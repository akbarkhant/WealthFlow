// backend/src/modules/ai/ai.controller.js
const service             = require('./ai.service');
const transactionService  = require('../transactions/transactions.service');
const budgetService       = require('../budgets/budget.service');
const { query }           = require('../../config/db.config');
const { sendSuccess }     = require('../../shared/ApiResponse');

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
async function chat(req, res, next) {
  try {
    const { message, history } = req.body;
    const userId               = req.user.id;

    // Persist user message first
    await saveChatMessage(userId, 'user', message);

    // Build live financial context (last 15 transactions)
    const userTransactions = await transactionService.listAllForUser(userId);
    const contextSummary   = buildContextSummary(userTransactions.slice(0, 15));

    // Intercept res.end so we can save the AI reply after streaming completes
    let aiReply = '';
    const originalWrite = res.write.bind(res);
    const originalEnd   = res.end.bind(res);

    res.write = (chunk) => {
      aiReply += chunk;
      return originalWrite(chunk);
    };
    res.end = async (...args) => {
      try {
        await saveChatMessage(userId, 'assistant', aiReply);
      } catch (_) {}
      return originalEnd(...args);
    };

    await service.chatService({
      message: `${contextSummary}\n\nUser question: ${message}`,
      history: history ?? [],
      res,
      next,
    });
  } catch (err) {
    next(err);
  }
}

function buildContextSummary(transactions) {
  if (!transactions.length) return 'No recent transactions found.';

  const income   = transactions.filter(t => t.type === 'income')
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
    const userId        = req.user.id;
    const allTx         = await transactionService.listAllForUser(userId);
    const userBudgets   = await budgetService.listAllForUser(userId);
    const income        = allTx.filter(t => t.type === 'income');
    const expenses      = allTx.filter(t => t.type === 'expense');

    const result = await service.analyzeService({ income, expenses, budgets: userBudgets });

    return sendSuccess(res, {
      budgetHealthScore: result.budgetHealthScore,
      insights:          result.insights,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. POST /api/ai/suggest  → Spending Forecast
// ─────────────────────────────────────────────────────────────────────────────
async function suggest(req, res, next) {
  try {
    const userId   = req.user.id;
    const allTx    = await transactionService.listAllForUser(userId);
    const expenses = allTx.filter(t => t.type === 'expense');

    const monthlyGroups = {};
    expenses.forEach(e => {
      const key = String(e.date).substring(0, 7);
      monthlyGroups[key] = (monthlyGroups[key] || 0) + Number(e.amount);
    });

    const sortedMonths            = Object.keys(monthlyGroups).sort();
    const historicalMonthlyTotals = sortedMonths.map(m => monthlyGroups[m]).slice(-6);
    if (!historicalMonthlyTotals.length) historicalMonthlyTotals.push(0);

    const forecast = await service.suggestService({ historicalMonthlyTotals });

    return sendSuccess(res, {
      expectedExpensesNextMonth: forecast.expectedExpensesNextMonth,
      reasoning:                 forecast.reasoning,
    });
  } catch (err) {
    next(err);
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
    const index  = parseInt(req.params.index ?? '0', 10);
    const result = await service.educationService(index);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

async function getEducationTipByTopic(req, res, next) {
  try {
    const topic  = decodeURIComponent(req.params.name ?? '');
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
    const userId    = req.user.id;
    const month     = req.params.month; // 'YYYY-MM'

    // Pull user name
    const userRows  = await query('SELECT name, currency FROM users WHERE id = $1', [userId]);
    const userName  = userRows[0]?.name     ?? 'User';
    const currency  = userRows[0]?.currency ?? 'Rs.';

    // Filter transactions for the requested month
    const allTx     = await transactionService.listAllForUser(userId);
    const monthTx   = allTx.filter(t => String(t.date).startsWith(month));
    const income    = monthTx.filter(t => t.type === 'income')
                             .reduce((a, t) => a + Number(t.amount), 0);
    const expenses  = monthTx.filter(t => t.type === 'expense');
    const totalExp  = expenses.reduce((a, t) => a + Number(t.amount), 0);

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
    const budgets       = await budgetService.listAllForUser(userId);
    const incomeArr     = monthTx.filter(t => t.type === 'income');
    const { budgetHealthScore, insights } = await service.analyzeService({
      income:   incomeArr,
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
    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length',      pdfBuffer.length);
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