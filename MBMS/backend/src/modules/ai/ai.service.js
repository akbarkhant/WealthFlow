// backend/src/modules/ai/ai.service.js
require('dotenv').config();
const { GoogleGenAI, Type } = require('@google/genai');
const logger = require('../../config/logger.config').logger;
// The SDK automatically discovers process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

// Standard cost-efficient, high-speed model for utility tasks
const MODEL_NAME = 'gemini-3.5-flash'; 

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTOMATIC TRANSACTION CATEGORIZATION
// ─────────────────────────────────────────────────────────────────────────────
async function automaticallyCategorize(rawInput, availableCategories) {
  const categoryMapString = availableCategories
    .map(c => `ID: "${c.id}" -> Name: "${c.name}"`)
    .join('\n');

  const systemPrompt = `
You are an automated fintech parsing engine for WealthFlow.
Analyze the raw input string and map it to exactly ONE category from the list below.

Allowed Categories:
${categoryMapString}

Rules:
1. "categoryId" MUST match an ID from the list exactly.
2. "cleanDescription" strips currency symbols and prices — keep just the merchant name.
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Raw Input: "${rawInput}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        // Enforce rigid structural output
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryId: { type: Type.STRING },
            cleanDescription: { type: Type.STRING }
          },
          required: ['categoryId', 'cleanDescription']
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error('Auto-categorization failed:', error.message);
    return {
      categoryId: availableCategories[0]?.id ?? null,
      cleanDescription: rawInput,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STREAMING AI CHAT ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────
async function chatService({
  message,
  history = [],
  financialContext = '',
  res,
  next,
}) {
  try {
    const formattedContents = [];

    const systemPrompt = `
You are WealthFlow AI, an intelligent personal finance assistant.

Rules:
- Use ONLY the financial data provided.
- Never invent balances, budgets, transactions, or goals.
- If data is unavailable, say so clearly.
- Give concise answers.
- Use bullet points when useful.
- Mention specific spending patterns when present.
- Provide practical financial advice.
- Currency values must be displayed exactly as provided.

Financial Context:

${financialContext}
`;

    formattedContents.push({
      role: 'user',
      parts: [{
        text: `System Context:\n${systemPrompt}`
      }]
    });

    if (Array.isArray(history)) {
      history.slice(-20).forEach(msg => {
        formattedContents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{
            text: msg.text || msg.content || ''
          }]
        });
      });
    }

    formattedContents.push({
      role: 'user',
      parts: [{
        text: message
      }]
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: formattedContents,
      config: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 1024,
      }
    });

    for await (const chunk of stream) {
      const text = chunk.text;

      if (text) {
        res.write(text);
      }
    }

    res.end();

  } catch (err) {
    console.error('AI Chat Error:', err);

    if (!res.headersSent) {
      next(err);
    } else {
      res.end();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SMART INSIGHTS & BUDGET HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeService(financialContext, customPrompt = '') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY configuration in environment variables.');
    }

    // ✅ Clean extraction matching exactly what your controller builds
    const { summary, topCategories, sampleTransactions } = financialContext || {};

    if (!summary) {
      throw new Error('Financial context summary data is missing or ill-formed.');
    }

    const systemInstruction = 
      "You are an expert personal finance AI assistant embedded in a Money Management App (MBMS). " +
      "Your task is to analyze user transaction summaries, spot structural trends or anomalies, " +
      "and provide highly actionable, empathetic, concise advice. Never hallucinate metrics.";

    // Build the prompt using the metrics the controller already calculated
    const userPrompt = `
      Please analyze my financial data for this period:
      
      ### Financial Summary:
      - Total Income: $${Number(summary.totalIncome || 0).toFixed(2)}
      - Total Expenses: $${Number(summary.totalExpenses || 0).toFixed(2)}
      - Net Savings: $${Number(summary.netSavings || 0).toFixed(2)}
      - Date Range: ${summary.period?.startDate || 'N/A'} to ${summary.period?.endDate || 'N/A'}
      
      ### Spending by Category:
      ${JSON.stringify(topCategories || {}, null, 2)}
      
      ### Sample Transactions Analysed:
      ${JSON.stringify(sampleTransactions || [], null, 2)}
      
      ${customPrompt ? `### User Custom Focus Question:\n"${customPrompt}"` : ''}
      
      Provide your analytical breakdown using clear Markdown headings. Keep it brief, smart, and direct.
    `;

    if (logger && typeof logger.info === 'function') {
      logger.info('Forwarding financial context data to gemini-2.5-flash engine...');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    if (!response || !response.text) {
      throw new Error('Received an empty text generation structure from Gemini API.');
    }

    return response.text;

  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`[AI_ANALYZE_SERVICE_ERROR] Execution failed: ${error.message}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPENDING FORECAST ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function suggestService(optimizationProfile, customPrompt = '') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY configuration in environment variables.');
    }

    // ✅ FIX: Added explicit empty fallbacks right during destructuring
    const { 
      metrics = {}, 
      spendingPattern = {}, 
      highValueExpenses = [] // 🌟 Crucial fallback to prevent .length crashes
    } = optimizationProfile || {};

    const systemInstruction = 
      "You are a strict, smart, proactive financial coach. Your job is to look at a user's " +
      "spending patterns and largest transactions, then provide exactly 3 brutal, realistic " +
      "saving recommendations to optimize their budget and raise their savings rate.";

    // Build the prompt context safely
    const userPrompt = `
      Analyze this profile and generate recommendations:
      - Income: $${Number(metrics.totalIncome || 0).toFixed(2)}
      - Expenses: $${Number(metrics.totalExpenses || 0).toFixed(2)}
      - Current Savings Rate: ${Number(metrics.savingsRatePercentage || 0).toFixed(2)}%
      
      Top Spending Sectors:
      ${JSON.stringify(spendingPattern, null, 2)}
      
      Largest Individual Transactions (${highValueExpenses.length} items logged):
      ${JSON.stringify(highValueExpenses, null, 2)}
      
      ${customPrompt ? `User request focus: "${customPrompt}"` : ""}
    `;

    if (logger && typeof logger.info === 'function') {
      logger.info('Sending account optimization matrices to gemini-2.5-flash context...');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: { 
        systemInstruction: systemInstruction, 
        temperature: 0.3 
      }
    });

    if (!response || !response.text) {
      throw new Error('Received an empty text generation structure from Gemini API.');
    }

    return response.text;

  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`[AI_SUGGEST_SERVICE_ERROR] Execution failed: ${error.message}`);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RECEIPT PARSING SERVICE (delegates to ai.receipt.js)
// ─────────────────────────────────────────────────────────────────────────────
async function receiptService(filePath) {
  const { scanReceipt } = require('./ai.receipt');
  return scanReceipt(filePath);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EDUCATION TIP SERVICE (delegates to ai.education.js)
// ─────────────────────────────────────────────────────────────────────────────
async function educationService(topicOrIndex) {
  const { generateTip, generateTipByIndex, getAllTopics } = require('./ai.education');

  if (topicOrIndex === 'all') return { topics: getAllTopics() };
  if (typeof topicOrIndex === 'number') return generateTipByIndex(topicOrIndex);
  return generateTip(String(topicOrIndex));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. REPORT GENERATION SERVICE (delegates to ai.report.js)
// ─────────────────────────────────────────────────────────────────────────────
async function reportService(reportData) {
  const { generateReport } = require('./ai.report');
  return generateReport(reportData);
}

module.exports = {
  automaticallyCategorize,
  chatService,
  analyzeService,
  suggestService,
  receiptService,
  educationService,
  reportService,
};