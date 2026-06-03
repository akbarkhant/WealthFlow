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

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
