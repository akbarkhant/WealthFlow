const transactionsService = require('./transactions.service');
const {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
} = require('./transactions.schema');

async function getAllTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const filters = listTransactionsSchema.parse(req.query);
    const result = await transactionsService.list(userId, filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const transaction = await transactionsService.getById(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const input = createTransactionSchema.parse(req.body);
    const transaction = await transactionsService.create(req.user.id, input);

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const input = updateTransactionSchema.parse(req.body);
    const transaction = await transactionsService.update(
      req.params.id,
      req.user.id,
      input
    );

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    await transactionsService.remove(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Transaction successfully removed.',
    });
  } catch (error) {
    return next(error);
  }
}

// Add this to your transactions.controller.js file:

async function getMonthlyReport(req, res, next) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Fallback defaults if dates are missing from the query parameters
    const now = new Date();
    const start = startDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const end = endDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

    // Query your repository metrics using the same parameters as fetchDashboardData
    const result = await transactionsService.list(userId, { 
      startDate: start, 
      endDate: end,
      limit: 100000 
    });

    // Calculate sums safely from your high-precision ledger array
    let income = 0;
    let expenses = 0;

    if (result && Array.isArray(result.data)) {
      result.data.forEach(tx => {
        const amt = parseFloat(tx.amount || 0);
        if (tx.type === 'income') income += amt;
        if (tx.type === 'expense') expenses += amt;
      });
    }

    return res.status(200).json({
      success: true,
      totalIncome: income,
      totalExpenses: expenses,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyReport
};
