const service = require('./ai.service');
const transactionService = require('../transactions/transactions.service');
const budgetService = require('../budgets/budget.service');
const { query } = require('../../config/db.config');
const { sendSuccess } = require('../../shared/ApiResponse');
const { logger } = require('../../config/logger.config');
const { StringDecoder } = require('string_decoder');

// ─────────────────────────────────────────────────────────────────────────────
// CHAT HISTORY — Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function saveChatMessage(userId, role, content) {
  if (!content || !content.trim()) return;
  await query(
    `INSERT INTO chat_history (user_id, role, content, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [userId, role, content.trim()]
  );
}

async function loadChatHistory(userId, limit = 50) {
  const result = await query(
    `SELECT id, role, content, created_at
     FROM   chat_history
     WHERE  user_id = $1
     ORDER  BY created_at ASC
     LIMIT  $2`,
    [userId, limit]
  );
  return result.rows || result || [];
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
// 3. POST /api/ai/chat  (Streaming)
// ─────────────────────────────────────────────────────────────────────────────
async function chat(req, res, next) {
  try {
    const { message, history } = req.body;
    const userId = req.user.id;

    // Persist user message first
    await saveChatMessage(userId, 'user', message);

    // Fetch transaction data safely
    const transactionResult = await transactionService.list(userId, {});
    
    // DEFENSIVE ARRAY GUARD (Applied)
    let userTransactions = [];
    if (transactionResult) {
      if (Array.isArray(transactionResult)) {
        userTransactions = transactionResult;
      } else if (transactionResult.data && Array.isArray(transactionResult.data)) {
        userTransactions = transactionResult.data;
      } else if (transactionResult.rows && Array.isArray(transactionResult.rows)) {
        userTransactions = transactionResult.rows;
      } else if (transactionResult.transactions && Array.isArray(transactionResult.transactions)) {
        userTransactions = transactionResult.transactions;
      }
    }

    const recentTransactions = userTransactions.slice(0, 26);
    const contextSummary = buildContextSummary(recentTransactions);

    const budgetResult = await budgetService.list(userId);
    const userBudgets = budgetResult?.data || budgetResult || [];

    const financialContext = `
${contextSummary}

Active Budgets:
${userBudgets.map(b => `- ${b.name}: Limit Rs. ${b.amountLimit || b.amount || 0}`).join('\n')}
`;

    // Intercept res.write to safely capture streamed chunks for the DB history logs
    let aiReply = '';
    const decoder = new StringDecoder('utf-8');
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = (chunk, encoding, callback) => {
      aiReply += typeof chunk === 'string' ? chunk : decoder.write(chunk);
      return originalWrite(chunk, encoding, callback);
    };

    res.end = async (...args) => {
      try {
        aiReply += decoder.end();
        await saveChatMessage(userId, 'assistant', aiReply);
      } catch (err) {
        logger.error(`Failed to background-save chat history: ${err.message}`);
      }
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
  if (!transactions || !transactions.length) return "User's recent financial context: No recent transactions found.";

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((a, t) => a + Number(t.amount || t.amount_in_base_currency || 0), 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((a, t) => a + Number(t.amount || t.amount_in_base_currency || 0), 0);

  const lines = transactions.slice(0, 8).map(t =>
    `- ${t.description ?? 'Transaction'} (${t.type}): Rs. ${t.amount || t.amount_in_base_currency || 0}`
  );

  return `User's recent financial context:
  Income this period:  Rs. ${income}
  Expenses this period: Rs. ${expenses}
  Recent transaction log entries:
  ${lines.join('\n')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST /api/ai/analyze  → Insights + Budget Health Score
// ─────────────────────────────────────────────────────────────────────────────
async function analyze(req, res, next) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, promptContext } = req.body || {};

    logger.info(`AI analysis requested for user ${userId} from ${startDate || 'all-time'} to ${endDate || 'now'}`);

    const rawData = await transactionService.list(userId, { startDate, endDate });
    
    // DEFENSIVE ARRAY GUARD (Applied)
    let allTx = [];
    if (rawData) {
      if (Array.isArray(rawData)) {
        allTx = rawData;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        allTx = rawData.data;
      } else if (rawData.rows && Array.isArray(rawData.rows)) {
        allTx = rawData.rows;
      } else if (rawData.transactions && Array.isArray(rawData.transactions)) {
        allTx = rawData.transactions;
      }
    }

    const expenses = allTx.filter(tx => tx.type === 'expense');
    const income = allTx.filter(tx => tx.type === 'income');

    const totalExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount || 0), 0);
    const totalIncome = income.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount || 0), 0);
    const netSavings = totalIncome - totalExpenses;

    const categoryBreakdown = expenses.reduce((acc, tx) => {
      const category = tx.category_name || tx.categoryName || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(tx.amount || tx.amount_in_base_currency || 0);
      return acc;
    }, {});

    const financialContext = {
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        period: { startDate: startDate || 'N/A', endDate: endDate || 'Now' }
      },
      topCategories: categoryBreakdown,
      sampleTransactions: expenses.slice(0, 15).map(tx => ({
        date: tx.date,
        amount: tx.amount || tx.amount_in_base_currency,
        currency: tx.currency || 'Rs.',
        description: tx.description
      }))
    };

    const aiInsight = await service.analyzeService(financialContext, promptContext);

    return res.status(200).json({
      success: true,
      data: {
        insights: aiInsight,
        metricsProcessed: allTx.length
      }
    });
  } catch (error) {
    logger.error(`AI Analysis Error: ${error.message}`, { stack: error.stack });
    return next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST /api/ai/suggest  → Spending Forecast Optimization
// ─────────────────────────────────────────────────────────────────────────────
async function suggest(req, res, next) {
  try {
    const userId = req.user.id;
    const { promptContext } = req.body || {};

    logger.info(`AI savings suggestions requested for user: ${userId}`);

    const rawData = await transactionService.list(userId);
    
    // DEFENSIVE ARRAY GUARD (Applied)
    let allTx = [];
    if (rawData) {
      if (Array.isArray(rawData)) {
        allTx = rawData;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        allTx = rawData.data;
      } else if (rawData.rows && Array.isArray(rawData.rows)) {
        allTx = rawData.rows;
      } else if (rawData.transactions && Array.isArray(rawData.transactions)) {
        allTx = rawData.transactions;
      }
    }

    const expenses = allTx.filter(tx => tx.type === 'expense');
    const income = allTx.filter(tx => tx.type === 'income');

    const totalExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount || 0), 0);
    const totalIncome = income.reduce((sum, tx) => sum + Number(tx.amount_in_base_currency || tx.amount || 0), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const spendingPattern = expenses.reduce((acc, tx) => {
      const category = tx.category_name || tx.categoryName || 'Other';
      acc[category] = (acc[category] || 0) + Number(tx.amount || tx.amount_in_base_currency || 0);
      return acc;
    }, {});

    const optimizationProfile = {
      metrics: {
        totalIncome,
        totalExpenses,
        savingsRatePercentage: Number(savingsRate.toFixed(2))
      },
      spendingPattern,
      highValueExpenses: expenses
        .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
        .slice(0, 10)
        .map(tx => ({
          date: tx.date,
          amount: tx.amount || tx.amount_in_base_currency,
          category: tx.category_name || 'Uncategorized',
          description: tx.description
        }))
    };

    const savingsSuggestions = await service.suggestService(optimizationProfile, promptContext);

    return res.status(200).json({
      success: true,
      data: {
        suggestions: savingsSuggestions,
        metricsProcessed: allTx.length
      }
    });
  } catch (error) {
    logger.error(`AI Suggest Error: ${error.message}`, { stack: error.stack });
    return next(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. POST /api/ai/receipt  → Receipt Scanner
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
// 7. FINANCIAL LITERACY EDUCATION
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
// 8. GET /api/ai/report/:month  → Monthly PDF Report Context Delivery
// ─────────────────────────────────────────────────────────────────────────────
async function getMonthlyReport(req, res, next) {
  try {
    const userId = req.user.id;
    const month = req.params.month; // 'YYYY-MM'

    const userRows = await query('SELECT name, currency FROM users WHERE id = $1', [userId]);
    const userName = userRows.rows?.[0]?.name ?? userRows[0]?.name ?? 'User';
    const currency = userRows.rows?.[0]?.currency ?? userRows[0]?.currency ?? 'Rs.';

    const response = await transactionService.list(userId);
    
    // DEFENSIVE ARRAY GUARD (Applied)
    let allTx = [];
    if (response) {
      if (Array.isArray(response)) {
        allTx = response;
      } else if (response.data && Array.isArray(response.data)) {
        allTx = response.data;
      } else if (response.rows && Array.isArray(response.rows)) {
        allTx = response.rows;
      } else if (response.transactions && Array.isArray(response.transactions)) {
        allTx = response.transactions;
      }
    }

    const monthTx = allTx.filter(t => String(t.date).startsWith(month));
    const incomeArr = monthTx.filter(t => t.type === 'income');
    const expenses = monthTx.filter(t => t.type === 'expense');

    const incomeSum = incomeArr.reduce((a, t) => a + Number(t.amount || t.amount_in_base_currency || 0), 0);
    const totalExp = expenses.reduce((a, t) => a + Number(t.amount || t.amount_in_base_currency || 0), 0);

    const catMap = {};
    expenses.forEach(t => {
      const k = t.category_name ?? t.categoryName ?? 'Uncategorized';
      catMap[k] = (catMap[k] || 0) + Number(t.amount || t.amount_in_base_currency || 0);
    });

    const categoryBreakdown = Object.entries(catMap)
      .map(([name, total]) => ({
        name,
        total,
        percentage: totalExp > 0 ? (total / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Map custom structure strictly matching expectations of analyzeService
    const reportDataEnvelope = {
      summary: {
        totalIncome: incomeSum,
        totalExpenses: totalExp,
        netSavings: incomeSum - totalExp,
        period: { startDate: `${month}-01`, endDate: `${month}-31` }
      },
      topCategories: catMap,
      sampleTransactions: expenses.slice(0, 10).map(e => ({ date: e.date, amount: e.amount, description: e.description }))
    };

    const aiInsightsMarkdown = await service.analyzeService(reportDataEnvelope, 'Focus layout recommendations specifically tailored for end-of-month financial statements.');

    // Calculate baseline budget health score manually
    let budgetHealthScore = 100;
    if (incomeSum > 0) {
      const burnRate = (totalExp / incomeSum) * 100;
      budgetHealthScore = Math.max(0, Math.min(100, Math.round(100 - (burnRate * 0.5))));
    } else if (totalExp > 0) {
      budgetHealthScore = 20; 
    }

    const pdfBuffer = await service.reportService({
      month,
      income: incomeSum,
      expenses: totalExp,
      categoryBreakdown,
      insights: aiInsightsMarkdown,
      budgetHealthScore,
      currency,
      userName,
    });

    const filename = `WealthFlow_Report_${month}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getChatHistory,
  clearChatHistory,
  chat,
  analyze,
  suggest,
  scanReceipt,
  getEducationTopics,
  getEducationTip,
  getEducationTipByTopic,
  getMonthlyReport,
};