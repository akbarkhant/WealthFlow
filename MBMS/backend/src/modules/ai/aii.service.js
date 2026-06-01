// backend/src/modules/ai/ai.service.js
const { default: ollama }          = require('ollama');
const { generateOnce, parseJson }  = require('./ai.engine');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeParseOllama(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```json|```/g, '').trim();
  }
  return JSON.parse(cleaned);
}

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
1. Reply with valid JSON ONLY: { "categoryId": "<uuid>", "cleanDescription": "<merchant name>" }
2. "categoryId" MUST match an ID from the list exactly.
3. "cleanDescription" strips currency symbols and prices — keep just the merchant name.
4. No markdown, no backticks, no explanation.
`;

  try {
    const response = await ollama.chat({
      model:    'llama3.2:1b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `Raw Input: "${rawInput}"` }
      ],
      options:  { temperature: 0.1 }
    });

    return safeParseOllama(response.message.content);
  } catch (error) {
    console.error('Auto-categorization failed:', error.message);
    return {
      categoryId:       availableCategories[0]?.id ?? null,
      cleanDescription: rawInput,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STREAMING AI CHAT ASSISTANT
// ─────────────────────────────────────────────────────────────────────────────
async function chatService({ message, history = [], res, next }) {
  try {
    const formattedMessages = history.map(msg => ({
      role:    msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text ?? msg.content ?? '',
    }));

    const systemPrompt = {
      role:    'system',
      content: `You are WealthFlow AI, a concise financial analyst assistant.
Answer questions about the user's finances based on the context provided.
Keep answers under 3 sentences unless steps or lists are explicitly requested.
Use PKR (Pakistani Rupees) for monetary references where currency is ambiguous.`,
    };

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const responseStream = await ollama.chat({
      model:    'llama3.2:1b',
      messages: [systemPrompt, ...formattedMessages, { role: 'user', content: message }],
      stream:   true,
    });

    for await (const chunk of responseStream) {
      const textChunk = chunk.message.content;
      if (textChunk) res.write(textChunk);
    }

    res.end();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      console.error('Chat stream error:', err.message);
      res.end();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SMART INSIGHTS & BUDGET HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeService({ income, expenses, budgets }) {
  const totalIncome   = income.reduce((a, c) => a + Number(c.amount), 0);
  const totalExpenses = expenses.reduce((a, c) => a + Number(c.amount), 0);
  const savingsRate   = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome) * 100
    : 0;

  let overBudgetCount = 0;
  budgets.forEach(b => {
    const spent = expenses
      .filter(e => e.categoryId === b.categoryId)
      .reduce((a, c) => a + Number(c.amount), 0);
    if (spent > b.amountLimit) overBudgetCount++;
  });

  // Arithmetic score — AI never touches the number
  let healthScore = 100;
  if (savingsRate < 20) healthScore -= 20;
  if (savingsRate < 0)  healthScore -= 30;
  healthScore -= overBudgetCount * 10;
  healthScore  = Math.max(10, Math.min(100, healthScore));

  const systemPrompt = `
You are the WealthFlow Insight engine.
Generate exactly 3 actionable financial insights as a raw JSON array.

Financial Context:
- Income:          Rs. ${totalIncome}
- Expenses:        Rs. ${totalExpenses}
- Savings Rate:    ${savingsRate.toFixed(1)}%
- Over-Budget Categories: ${overBudgetCount}

Format (raw JSON array, no markdown):
[{"type": "warning"|"danger"|"success", "text": "insight message", "actionText": "optional button label"}]
`;

  try {
    const response = await ollama.chat({
      model:    'llama3.2:1b',
      messages: [{ role: 'system', content: systemPrompt }],
      options:  { temperature: 0.2 }
    });

    return {
      budgetHealthScore: Math.round(healthScore),
      insights:          safeParseOllama(response.message.content),
    };
  } catch (error) {
    console.error('Insights engine failed:', error.message);
    return {
      budgetHealthScore: Math.round(healthScore),
      insights: [
        { type: 'success', text: 'Your spending data is loaded and being tracked.', actionText: 'View Dashboard' }
      ],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPENDING FORECAST ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function suggestService({ historicalMonthlyTotals }) {
  let trendDirection = 'stable';
  if (historicalMonthlyTotals.length >= 2) {
    const last = historicalMonthlyTotals[historicalMonthlyTotals.length - 1];
    const prev = historicalMonthlyTotals[historicalMonthlyTotals.length - 2];
    if (last > prev * 1.05) trendDirection = 'increasing';
    if (last < prev * 0.95) trendDirection = 'decreasing';
  }

  const systemPrompt = `
You are the WealthFlow Predictive Engine.
Predict next month's expenses based on historical data.

Data:
- Monthly totals: [${historicalMonthlyTotals.join(', ')}]
- Trend: ${trendDirection}

Reply with raw JSON only:
{ "expectedExpensesNextMonth": <number>, "reasoning": "<under 20 words>" }
`;

  try {
    const response = await ollama.chat({
      model:    'llama3.2:1b',
      messages: [{ role: 'system', content: systemPrompt }],
      options:  { temperature: 0.1 }
    });

    return safeParseOllama(response.message.content);
  } catch (error) {
    console.error('Forecast failed:', error.message);
    const fallback = historicalMonthlyTotals.at(-1) ?? 0;
    return {
      expectedExpensesNextMonth: fallback,
      reasoning: 'Based on your recent spending history.',
    };
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