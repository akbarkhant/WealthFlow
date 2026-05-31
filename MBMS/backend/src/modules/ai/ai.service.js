const { streamToClient } = require('./ai.engine');

const SYSTEM_PROMPT = `You are WealthFlow AI, a personal financial assistant.

Rules:
- Only help with finance
- Use provided transaction data only
- Be concise and actionable
- If unrelated: refuse politely
`;

function buildTransactionContext(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return '';
  return `
Transactions:
${transactions
    .map(t => `- ${t.description || 'Unknown'} | ${t.type || ''} | ${t.amount || 0} | ${t.categoryName || 'Uncategorized'}`)
    .join('\n')}
`;
}

async function chatService({ message, transactions, res, next }) {
  const context = buildTransactionContext(transactions);
  const prompt = `
${SYSTEM_PROMPT}
${context}
User: ${message}
AI:
`;
  return streamToClient(prompt, { temperature: 0.4, num_predict: 600 }, res, next);
}

async function analyzeService({ expenses, res, next }) {
  const prompt = `
${SYSTEM_PROMPT}

Analyze this expenses data:
${JSON.stringify(expenses, null, 2)}

Return:
1. Total spending
2. Top categories
3. Savings tips
4. Financial score
`;
  return streamToClient(prompt, { temperature: 0.3, num_predict: 600 }, res, next);
}

async function suggestService({ income, expenses, res, next }) {
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const savings = income - totalExpenses;
  const savingsRate = ((savings / income) * 100).toFixed(1);
  const prompt = `
${SYSTEM_PROMPT}

Income: ${income}
Expenses: ${JSON.stringify(expenses)}
Savings Rate: ${savingsRate}%

Give:
- spending improvements
- savings plan
- investment ideas
- 3-month roadmap
`;
  return streamToClient(prompt, { temperature: 0.3, num_predict: 600 }, res, next);
}

module.exports = { chatService, analyzeService, suggestService };