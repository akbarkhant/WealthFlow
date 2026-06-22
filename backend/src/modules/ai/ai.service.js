'use strict';

/**
 * @module ai/ai.service
 * @description Production AI service — coordinates gateway, cache, DB persistence,
 * and all Gemini model calls for WealthFlow.
 *
 * Architecture
 * ─────────────
 *  Streaming chat  → gateway.stream()  (real-time SSE to client)
 *  All other calls → gateway.call()    (resilient, retried, circuit-broken)
 *  Results cached  → ai.cache          (Redis, domain-specific TTLs)
 *  Insights stored → ai_insights table (permanent record, queryable)
 *
 * Nothing here touches HTTP objects (req/res) except chatService, which must
 * stream directly to the response.
 */

require('dotenv').config();

const { Type }   = require('@google/genai');
const { query }  = require('../../config/db.config');
const { logger } = require('../../config/logger.config');
const gateway    = require('./ai.gateway');
const aiCache    = require('./ai.cache');

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persists an AI insight to the ai_insights table.
 *
 * Schema columns used:
 *   id, user_id, type, target_month, target_year,
 *   insight_text, recommended_budget, confidence_score,
 *   is_applied, created_at, updated_at
 */
async function persistInsight(userId, { type, targetMonth, targetYear, insightText, recommendedBudget, confidenceScore }) {
  try {
    await query(
      `INSERT INTO ai_insights
         (user_id, type, target_month, target_year, insight_text,
          recommended_budget, confidence_score, is_applied)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       ON CONFLICT DO NOTHING`,
      [
        userId,
        type          ?? 'general',
        targetMonth   ?? null,
        targetYear    ?? null,
        insightText,
        recommendedBudget ? JSON.stringify(recommendedBudget) : null,
        confidenceScore   ?? null,
      ],
    );
  } catch (err) {
    // Non-fatal — log and continue; insight is still returned to caller
    logger.warn({ err: err.message, userId }, '[AIService] Failed to persist insight to DB.');
  }
}

/**
 * Saves a chat message to the chat_history table.
 * Matches schema: id(uuid), user_id(uuid), role, context, created_at
 */
async function saveChatMessage(userId, role, content) {
  if (!content?.trim()) return;
  try {
    const jsonContent = JSON.stringify(content.trim());

    await query(
      `INSERT INTO chat_history (user_id, role, content, created_at) -- Changed 'context' to 'content'
       VALUES ($1, $2, $3, NOW())`,
      [userId, role, jsonContent],
    );
  } catch (err) {
    logger.warn({ err: err.message, userId, role }, '[AIService] Failed to save chat message.');
  }
}

const calendarToolDeclaration = {
  name: 'createCalendarEvent',
  description: 'Create a new event in the user\'s Google Calendar. Use this when the user explicitly asks to schedule, book, or set a meeting, appointment, or reminder.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: 'The title or topic of the event (e.g., "Dentist Appointment", "Weekly Budget Sync").',
      },
      startDateTime: {
        type: Type.STRING,
        description: 'The start date and time in ISO 8601 format (e.g., "2026-06-22T15:00:00Z").',
      },
      endDateTime: {
        type: Type.STRING,
        description: 'The end date and time in ISO 8601 format. If omitted, default to 1 hour after startDateTime.',
      },
    },
    required: ['summary', 'startDateTime'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTOMATIC TRANSACTION CATEGORISATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Categorises a single raw transaction description.
 * Checks Redis cache first (7-day TTL) before calling the model.
 *
 * @param {string}   rawInput            - Raw merchant/description string.
 * @param {object[]} availableCategories - [{ id, name }]
 * @returns {Promise<{ categoryId: string|null, cleanDescription: string }>}
 */


async function automaticallyCategorize(rawInput, availableCategories) {
  const merchantNorm = rawInput.toLowerCase().trim().slice(0, 120);

  // Cache check
  const cached = await aiCache.getCategorization(merchantNorm);
  if (cached) {
    logger.debug({ merchantNorm }, '[AIService] Categorization cache HIT.');
    return { categoryId: cached, cleanDescription: rawInput };
  }

  const categoryMapString = availableCategories
    .map(c => `ID: "${c.id}" -> Name: "${c.name}"`)
    .join('\n');

  const systemPrompt = `You are an automated fintech parsing engine for WealthFlow.

Allowed Categories:
${categoryMapString}

Rules:
1. categoryId MUST match one of the IDs exactly above.
2. cleanDescription must remove prices and currency symbols.
3. Return ONLY valid JSON — no markdown or explanation.`;

  try {
    const response = await gateway.call(
      (model, ai) => ai.models.generateContent({
        model,
        contents: `Raw Input: "${rawInput}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categoryId:       { type: Type.STRING },
              cleanDescription: { type: Type.STRING },
            },
            required: ['categoryId', 'cleanDescription'],
          },
        },
      }),
      { label: 'categorize', timeoutMs: 15_000 },
    );

    const parsed = JSON.parse(response.text.trim());

    // Store in cache for future duplicate merchants
    if (parsed.categoryId) {
      await aiCache.setCategorization(merchantNorm, parsed.categoryId);
    }

    return parsed;
  } catch (error) {
    logger.error({ err: error.message }, '[AIService] Categorization failed — returning fallback.');
    return {
      categoryId:       availableCategories[0]?.id ?? null,
      cleanDescription: rawInput,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STREAMING AI CHAT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Streams an AI chat response directly to the HTTP response object.
 * Saves user message + AI reply to chat_history.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.message
 * @param {object[]} params.history       - Previous messages [{ role, content }]
 * @param {string} params.financialContext - Pre-built financial summary string
 * @param {object} params.res             - Express response object
 * @param {Function} params.next          - Express next()
 */

async function chatService({ userId, message, history = [], financialContext = '', res, next }) {
  // Persist user message before streaming begins
  await saveChatMessage(userId, 'user', message);

  const currentDateTime = new Date().toISOString();

  const systemPrompt = `You are WealthFlow AI, a personal finance assistant.

Rules:
- Only use the provided financial data. Never invent numbers.
- Be concise and practical. Use bullet points when helpful.
- If the user asks something outside personal finance, politely redirect.
- Current Date and Time reference anchor: ${currentDateTime}. Use this for resolving relative timing phrases like 'tomorrow' or 'next week'.

Financial Context:
${financialContext}`;

  const formattedContents = [
    { role: 'user', parts: [{ text: `System Context:\n${systemPrompt}` }] },
  ];

  if (Array.isArray(history)) {
    history.slice(-20).forEach(msg => {
      formattedContents.push({
        role:  msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.context || msg.content || msg.text || '' }],
      });
    });
  }

  formattedContents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const aiStream = await gateway.stream(
      (model, ai) => ai.models.generateContentStream({
        model,
        contents: formattedContents,
        config: { 
          temperature: 0.3, 
          topP: 0.9, 
          maxOutputTokens: 1024,
          tools: [{ functionDeclarations: [calendarToolDeclaration] }]
        },
      }),
      { label: 'chat-stream', timeoutMs: 60_000 },
    );

    // ── STEP 1: Intercept headers by preparing custom chunk monitoring ──
    let isToolCall = false;
    let toolArgs = null;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    let aiReply = '';
    const { StringDecoder } = require('string_decoder');
    const decoder       = new StringDecoder('utf-8');
    const originalWrite = res.write.bind(res);
    const originalEnd   = res.end.bind(res);

    res.write = (chunk, encoding, callback) => {
      aiReply += typeof chunk === 'string' ? chunk : decoder.write(chunk);
      return originalWrite(chunk, encoding, callback);
    };

    res.end = async (...args) => {
      try {
        aiReply += decoder.end();
        // Only save to DB if it was text (don't save the raw structural JSON payload)
        if (!isToolCall) {
          await saveChatMessage(userId, 'assistant', aiReply);
        }
      } catch (err) {
        logger.warn({ err: err.message }, '[AIService] Failed to persist assistant reply.');
      }
      return originalEnd(...args);
    };

    // ── STEP 2: Unified iteration loop (Handles BOTH text streaming & Tool Calls dynamically) ──
    for await (const chunk of aiStream) {
      // If the first chunk contains a tool directive invitation
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        isToolCall = true;
        toolArgs = chunk.functionCalls[0].args;
        break; // Stop streaming immediately to process backend action payload
      }

      // Stream text fragments cleanly and naturally without interruptions
      if (chunk.text) {
        res.write(chunk.text);
      }
    }

    // ── STEP 3: If a tool was triggered, wipe headers and return structured intercept action ──
    if (isToolCall && toolArgs) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
        success: true,
        triggerCalendarAction: true,
        eventDetails: {
          summary: toolArgs.summary,
          startDateTime: toolArgs.startDateTime,
          endDateTime: toolArgs.endDateTime || new Date(new Date(toolArgs.startDateTime).getTime() + 60 * 60 * 1000).toISOString()
        }
      });
    }

    // Wrap up standard stream text chunks normally
    res.end();
  } catch (err) {
    logger.error({ err: err.message }, '[AIService] Chat streaming failed.');
    if (!res.headersSent) return next(err);
    res.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MONTHLY SPENDING INSIGHTS (async-safe, cacheable, DB-persisted)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates monthly spending insights for a user.
 * Checks cache first; stores result in Redis + ai_insights table.
 *
 * @param {string} userId
 * @param {number} month  - 1-12
 * @param {number} year
 * @param {object} financialContext - { summary, topCategories, sampleTransactions }
 * @returns {Promise<{ insightText: string, recommendations: object[] }>}
 */
async function generateInsights(userId, month, year, financialContext) {
  // Cache check
  const cached = await aiCache.getInsights(userId, year, month);
  if (cached) {
    logger.info({ userId, month, year }, '[AIService] Insights cache HIT.');
    return cached;
  }

  const { summary, topCategories = {}, sampleTransactions = [] } = financialContext ?? {};

  if (!summary) throw new Error('[AIService] Missing financial summary for insights generation.');

  const prompt = `You are a financial analyst reviewing a user's monthly finances.

Period: ${year}-${String(month).padStart(2, '0')}
Income:   ${summary.totalIncome}
Expenses: ${summary.totalExpenses}
Savings:  ${summary.netSavings}

Spending by category:
${JSON.stringify(topCategories, null, 2)}

Sample transactions:
${JSON.stringify(sampleTransactions.slice(0, 10), null, 2)}

Generate:
1. Key insight paragraph (2-3 sentences) summarising this month's financial health.
2. Top 3 actionable recommendations as a JSON array: [{ title, description, priority }]
3. A budget health score from 0-100 (100 = perfect).

Respond ONLY with valid JSON:
{
  "insightText": "...",
  "recommendations": [...],
  "budgetHealthScore": 0-100,
  "confidenceScore": 0.0-1.0
}`;

  const response = await gateway.call(
    (model, ai) => ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature:        0.2,
        responseMimeType:  'application/json',
        maxOutputTokens:   1500,
      },
    }),
    { label: 'insights', timeoutMs: 30_000 },
  );

  let result;
  try {
    const clean = response.text.replace(/```json|```/g, '').trim();
    result = JSON.parse(clean);
  } catch {
    result = { insightText: response.text, recommendations: [], budgetHealthScore: 50, confidenceScore: 0.5 };
  }

  // Persist to cache and DB concurrently
  await Promise.allSettled([
    aiCache.setInsights(userId, year, month, result),
    persistInsight(userId, {
      type:             'monthly_insights',
      targetMonth:      month,
      targetYear:       year,
      insightText:      result.insightText,
      recommendedBudget: result.recommendations,
      confidenceScore:  result.confidenceScore,
    }),
  ]);

  logger.info({ userId, month, year }, '[AIService] Insights generated and cached.');
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ON-DEMAND ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates an on-demand analysis for a date range.
 * Results are cached for 1 hour to avoid re-billing the same request.
 *
 * @param {string} userId
 * @param {object} financialContext - { summary, topCategories, sampleTransactions }
 * @param {string} [customPrompt]
 * @returns {Promise<string>}  Markdown analysis text
 */
async function analyzeService(userId, financialContext, customPrompt = '') {
  const { summary, topCategories, sampleTransactions } = financialContext ?? {};
  if (!summary) throw new Error('Missing financial summary');

  // Cache check keyed by userId + date range
  const cacheKey = await aiCache.getAnalysis(
    userId,
    summary.period?.startDate ?? 'all',
    summary.period?.endDate   ?? 'now',
  );
  if (cacheKey) {
    logger.info({ userId }, '[AIService] Analysis cache HIT.');
    return cacheKey;
  }

  const prompt = `You are a strict financial analyst AI.

Income:   ${summary.totalIncome}
Expenses: ${summary.totalExpenses}
Savings:  ${summary.netSavings}
Period:   ${summary.period?.startDate ?? 'N/A'} → ${summary.period?.endDate ?? 'now'}

Categories:
${JSON.stringify(topCategories, null, 2)}

Sample Transactions:
${JSON.stringify(sampleTransactions, null, 2)}

${customPrompt ? `Focus: ${customPrompt}` : ''}

Provide a concise financial analysis with actionable insights. Use markdown headings.`;

  const response = await gateway.call(
    (model, ai) => ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.2, maxOutputTokens: 2000 },
    }),
    { label: 'analyze', timeoutMs: 30_000 },
  );

  const text = response.text;

  await aiCache.setAnalysis(
    userId,
    summary.period?.startDate ?? 'all',
    summary.period?.endDate   ?? 'now',
    text,
  );

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SAVINGS SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates savings/optimisation suggestions.
 * Cached for 6 hours.
 *
 * @param {string} userId
 * @param {object} profile - { metrics, spendingPattern, highValueExpenses }
 * @param {string} [customPrompt]
 * @returns {Promise<string>}
 */
async function suggestService(userId, profile, customPrompt = '') {
  // Cache check
  const cached = await aiCache.getSuggestions(userId);
  if (cached) {
    logger.info({ userId }, '[AIService] Suggestions cache HIT.');
    return cached;
  }

  const { metrics = {}, spendingPattern = {}, highValueExpenses = [] } = profile ?? {};

  const prompt = `You are a financial optimisation coach.

Income:        ${metrics.totalIncome}
Expenses:      ${metrics.totalExpenses}
Savings Rate:  ${metrics.savingsRatePercentage}%

Spending pattern:
${JSON.stringify(spendingPattern, null, 2)}

Top expenses:
${JSON.stringify(highValueExpenses, null, 2)}

${customPrompt || ''}

Give 5 practical, specific savings suggestions ranked by impact. Use markdown.`;

  const response = await gateway.call(
    (model, ai) => ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 1500 },
    }),
    { label: 'suggest', timeoutMs: 25_000 },
  );

  const text = response.text;
  await aiCache.setSuggestions(userId, text);
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. WRAPPERS (receipt, education, report — delegate to sub-modules)
// ─────────────────────────────────────────────────────────────────────────────

async function receiptService(filePath) {
  const { scanReceipt } = require('./ai.receipt');
  return scanReceipt(filePath);
}

async function educationService(topicOrIndex) {
  const { generateTip, generateTipByIndex, getAllTopics } = require('./ai.education');
  if (topicOrIndex === 'all') return { topics: getAllTopics() };
  if (typeof topicOrIndex === 'number') return generateTipByIndex(topicOrIndex);
  return generateTip(String(topicOrIndex));
}

async function reportService(reportData) {
  const { generateReport } = require('./ai.report');
  return generateReport(reportData);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CHAT HISTORY DB HELPERS (exposed for controller use)
// ─────────────────────────────────────────────────────────────────────────────

async function loadChatHistory(userId, limit = 50) {
  const result = await query(
    `SELECT id, role, context, created_at
     FROM   chat_history
     WHERE  user_id = $1
     ORDER  BY created_at ASC
     LIMIT  $2`,
    [userId, limit],
  );
  return result.rows ?? result ?? [];
}

async function clearChatHistory(userId) {
  await query('DELETE FROM chat_history WHERE user_id = $1', [userId]);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  automaticallyCategorize,
  chatService,
  generateInsights,
  analyzeService,
  suggestService,
  receiptService,
  educationService,
  reportService,
  loadChatHistory,
  clearChatHistory,
  saveChatMessage,
  persistInsight,
};