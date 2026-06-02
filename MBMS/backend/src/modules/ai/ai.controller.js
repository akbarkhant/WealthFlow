// backend/src/modules/ai/ai.controller.js
const service = require('./ai.service');
const transactionService = require('../transactions/transactions.service');
const budgetService = require('../budgets/budget.service');
const { query } = require('../../config/db.config');
const { sendSuccess } = require('../../shared/ApiResponse');
const { logger } = require('../../config/logger.config');

// ─────────────────────────────────────────────────────────────────────────────
// CHAT HISTORY — helpers
// ─────────────────────────────────────────────────────────────────────────────
async function saveChatMessage(userId, role, content) {
  await query(
    `INSERT INTO chat_history (user_id, role, content, created_at)
      VALUES ($1, $2, $3, NOW())`,
    [userId, role, content]
  );
}

async function loadChatHistory(userId, limit = 50) {
  return query(
    `SELECT id, role, content, created_at
      FROM   chat_history
      WHERE  user_id = $1
      ORDER  BY created_at ASC
      LIMIT  $2`,
    [userId, limit]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/ai/chat/history
// ─────────────────────────────────────────────────────────────────────────────
async function getChatHistory(req, res, next) {
  try {
    const history = await loadChatHistory(req.user.id);
    return sendSuccess(res, history);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DELETE /api/ai/chat/history
// ─────────────────────────────────────────────────────────────────────────────
async function clearChatHistory(req, res, next) {
  try {
    await query('DELETE FROM chat_history WHERE user_id = $1', [req.user.id]);
    return sendSuccess(res, { cleared: true });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/ai/chat  (streaming)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/ai/chat  (streaming)
// ─────────────────────────────────────────────────────────────────────────────
async function chat(req, res, next) {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;

    // Persist user message first
    await saveChatMessage(userId, 'user', message);

    // 1. Fetch live financial data envelope from transaction service
    const transactionResult = await transactionService.list(userId, {});

    // 2. Unpack the nested rows array safely (Fixes ReferenceError)
    const userTransactions = transactionResult?.data || [];

    // 3. Slice recent entries safely from the array
    const recentTransactions = userTransactions.slice(0, 26);

    const contextSummary = buildContextSummary(recentTransactions);

    const budgetResult = await budgetService.list(userId);
    console.log('BUDGETS:', budgets);

    const financialContext = `
${contextSummary}

Active Budgets:
${budgetResult
        .map(b => `${b.name}: Limit ${b.amountLimit}`)
        .join('\n')}
`;

    // Intercept res.end so we can save the AI reply after streaming completes
    let aiReply = '';
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = (chunk) => {
      aiReply += chunk;
      return originalWrite(chunk);
    };
    res.end = async (...args) => {
      try {
        await saveChatMessage(userId, 'assistant', aiReply);
      } catch (_) { }
      return originalEnd(...args);
    };


    await service.chatService({
      message,
      history,
      financialContext,
      res,
      next,
    });
  } catch (err) {
    next(err);
  }
}

function buildContextSummary(transactions) {
  if (!transactions.length) return 'No recent transactions found.';

  const income = transactions.filter(t => t.type === 'income')
    .reduce((a, t) => a + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense')
    .reduce((a, t) => a + Number(t.amount), 0);

  const lines = transactions.slice(0, 8).map(t =>
    `- ${t.description ?? 'Transaction'} (${t.type}): Rs. ${t.amount}`
  );

  return `User's recent financial context:
  Income this period:  Rs. ${income}
  Expenses this period: Rs. ${expenses}
  Recent transactions:
  ${lines.join('\n')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST /api/ai/analyze  → Insights + Budget Health Score
// ─────────────────────────────────────────────────────────────────────────────
async function analyze(req, res, next) {
  try {
    const userId = req.user.id; // Extracted from your auth middleware
    const { startDate, endDate, promptContext } = req.body || {};

    logger.info(`AI analysis requested for user ${userId} from ${startDate || 'all-time'} to ${endDate || 'now'}`);

    // 1. Fetch data from your transaction layer
    const rawData = await transactionService.list(userId, { startDate, endDate });

    // 2. DEFENSIVE GUARD: Ensure allTx resolves to a real array
    // Accounts for: raw PG objects (.rows), structured responses (.transactions), or null variants
    let allTx = [];
    if (rawData) {
      if (Array.isArray(rawData)) {
        allTx = rawData;
      } else if (rawData.rows && Array.isArray(rawData.rows)) {
        allTx = rawData.rows;
      } else if (rawData.transactions && Array.isArray(rawData.transactions)) {
        allTx = rawData.transactions;
      }
    }

    // 3. Safe filtering (No more "filter is not a function" crashes!)
    const expenses = allTx.filter(tx => tx.type === 'expense');
    const income = allTx.filter(tx => tx.type === 'income');

    // 4. Calculate core analytical aggregates to feed the AI context
    const totalExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount), 0);
    const totalIncome = income.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount), 0);
    const netSavings = totalIncome - totalExpenses;

    // Grouping spending categories for context brevity
    const categoryBreakdown = expenses.reduce((acc, tx) => {
      const category = tx.category_name || tx.categoryId || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(tx.amount);
      return acc;
    }, {});

    // 5. Compile the payload context to deliver to your LLM engine
    const financialContext = {
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        period: { startDate, endDate }
      },
      topCategories: categoryBreakdown,
      sampleTransactions: expenses.slice(0, 15).map(tx => ({
        date: tx.date,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description
      }))
    };

    // 6. Invoke your AI engine service layer
    const aiInsight = await service.analyzeService(financialContext, promptContext);

    // 7. Deliver clean JSON response
    return res.status(200).json({
      success: true,
      data: {
        insights: aiInsight,
        metricsProcessed: allTx.length
      }
    });

  } catch (error) {
    logger.error(`AI Analysis Error: ${error.message}`, { stack: error.stack });
    
    // Pass along to global error handling middleware
    return next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST /api/ai/suggest  → Spending Forecast
// ─────────────────────────────────────────────────────────────────────────────
/**
 * POST /api/ai/suggest
 * Generates proactive financial advice and savings recommendations
 */
async function suggest(req, res, next) {
  try {
    const userId = req.user.id; // Extracted from your auth middleware
    const { promptContext } = req.body || {};

    if (logger && typeof logger.info === 'function') {
      logger.info(`AI savings suggestions requested for user: ${userId}`);
    }

    // 1. Fetch transaction history from your repository abstraction layer
    const rawData = await transactionService.list(userId);

    // 2. DEFENSIVE GUARD: Safely extract the array structure
    let allTx = [];
    if (rawData) {
      if (Array.isArray(rawData)) {
        allTx = rawData;
      } else if (rawData.rows && Array.isArray(rawData.rows)) {
        allTx = rawData.rows;
      } else if (rawData.transactions && Array.isArray(rawData.transactions)) {
        allTx = rawData.transactions;
      }
    }

    // 3. Filter data securely without encountering ".filter is not a function" errors
    const expenses = allTx.filter(tx => tx.type === 'expense');
    const income = allTx.filter(tx => tx.type === 'income');

    // 4. Compute financial metrics to build the budget profile context
    const totalExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount), 0);
    const totalIncome = income.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Grouping category balances to detect heavy optimization opportunities
    const spendingPattern = expenses.reduce((acc, tx) => {
      const category = tx.category_name || tx.categoryId || 'Other';
      acc[category] = (acc[category] || 0) + Number(tx.amount);
      return acc;
    }, {});

    const optimizationProfile = {
      metrics: {
        totalIncome,
        totalExpenses,
        savingsRatePercentage: Number(savingsRate.toFixed(2))
      },
      spendingPattern,
      // Pass the 10 largest expenses to see where the user can cut back
      highValueExpenses: expenses
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10)
        .map(tx => ({
          date: tx.date,
          amount: tx.amount,
          category: tx.category_name || 'Uncategorized',
          description: tx.description
        }))
    };

    // 5. Fire compiled profile context down to your specialized service layer
    // NOTE: If your service uses commonJS require, verify 'service.suggestService' mapping match
    const savingsSuggestions = await service.suggestService(optimizationProfile, promptContext);

    // 6. Return response payload
    return res.status(200).json({
      success: true,
      data: {
        suggestions: savingsSuggestions,
        metricsProcessed: allTx.length
      }
    });

  } catch (error) {
    if (logger && typeof logger.error === 'function') {
      logger.error(`AI Suggest Error: ${error.message}`, { stack: error.stack });
    }
    return next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. POST /api/ai/receipt  → Receipt Scanner (Feature 11)
// ─────────────────────────────────────────────────────────────────────────────
async function scanReceipt(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const result = await service.receiptService(req.file.path);

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GET /api/ai/education          → list all topics
//    GET /api/ai/education/:index   → tip by rotation index
//    GET /api/ai/education/topic/:name → tip by topic name
// ─────────────────────────────────────────────────────────────────────────────
async function getEducationTopics(req, res, next) {
  try {
    const result = await service.educationService('all');
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

async function getEducationTip(req, res, next) {
  try {
    const index = parseInt(req.params.index ?? '0', 10);
    const result = await service.educationService(index);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

async function getEducationTipByTopic(req, res, next) {
  try {
    const topic = decodeURIComponent(req.params.name ?? '');
    const result = await service.educationService(topic);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. GET /api/ai/report/:month  → Monthly PDF Report (Feature 13)
//    month format: YYYY-MM  (e.g. 2025-06)
// ─────────────────────────────────────────────────────────────────────────────
async function getMonthlyReport(req, res, next) {
  try {
    const userId = req.user.id;
    const month = req.params.month; // 'YYYY-MM'

    // Pull user name
    const userRows = await query('SELECT name, currency FROM users WHERE id = $1', [userId]);
    const userName = userRows[0]?.name ?? 'User';
    const currency = userRows[0]?.currency ?? 'Rs.';


    const response = await transactionService.list(userId);
    // Filter transactions for the requested month

    const allTx = response?.data || [];

    const monthTx = allTx.filter(t => String(t.date).startsWith(month));
    const income = monthTx.filter(t => t.type === 'income')
      .reduce((a, t) => a + Number(t.amount), 0);
    const expenses = monthTx.filter(t => t.type === 'expense');
    const totalExp = expenses.reduce((a, t) => a + Number(t.amount), 0);

    // Category breakdown
    const catMap = {};
    expenses.forEach(t => {
      const k = t.category_name ?? t.categoryName ?? 'Uncategorized';
      catMap[k] = (catMap[k] || 0) + Number(t.amount);
    });
    const categoryBreakdown = Object.entries(catMap)
      .map(([name, total]) => ({
        name,
        total,
        percentage: totalExp > 0 ? (total / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // AI insights for the report
    const budgets = await budgetService.list(userId);
    const incomeArr = monthTx.filter(t => t.type === 'income');
    const { budgetHealthScore, insights } = await service.analyzeService({
      income: incomeArr,
      expenses: expenses,
      budgets,
    });

    // Generate the PDF
    const pdfBuffer = await service.reportService({
      month,
      income,
      expenses: totalExp,
      categoryBreakdown,
      insights,
      budgetHealthScore,
      currency,
      userName,
    });

    // Stream PDF to client
    const filename = `WealthFlow_Report_${month}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Chat
  getChatHistory,
  clearChatHistory,
  chat,
  // Analysis
  analyze,
  suggest,
  // Phase 2 — new
  scanReceipt,
  getEducationTopics,
  getEducationTip,
  getEducationTipByTopic,
  getMonthlyReport,
};  