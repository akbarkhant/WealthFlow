// transactions.controller.js

const transactionRepository = require('./transactions.repository');
const { 
  createTransactionSchema, 
  updateTransactionSchema, 
  listTransactionsSchema 
} = require('./transactions.schema');

// ── Handle Get All Transactions ──────────────────────────────────
async function getAllTransactions(req, res, next) {
  try {
    const userId = req.user.id; // From your auth/session middleware

    // 1. Parse and assign safe query parameters via Zod coercion
    const filterQuery = listTransactionsSchema.parse(req.query);

    // 2. Extract paginated rows cleanly from repository
    const result = await transactionRepository.findAll(userId, filterQuery);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

// ── Handle Get Transaction By ID ─────────────────────────────────
async function getTransactionById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await transactionRepository.findById(id, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

// ── Handle Create Transaction ────────────────────────────────────
async function createTransaction(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Zod safely checks body types (removes malicious variables)
    const validatedInput = createTransactionSchema.parse(req.body);

    // 2. Base currency translation step (Defaults to input value or explicit converter)
    const amountInBase = validatedInput.amount; 

    // 3. Save execution inside repository
    const newTransaction = await transactionRepository.create(userId, validatedInput, amountInBase);

    return res.status(201).json({
      success: true,
      data: newTransaction,
    });
  } catch (error) {
    // 4. Trap balance validation errors to provide clean frontend messaging
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }
    next(error);
  }
}

// ── Handle Update Transaction ────────────────────────────────────
async function updateTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const validatedInput = updateTransactionSchema.parse(req.body);
    
    // Recalculate base translation if updated value exists
    const amountInBase = validatedInput.amount !== undefined ? validatedInput.amount : undefined;

    const updatedTransaction = await transactionRepository.update(id, userId, validatedInput, amountInBase);

    return res.status(200).json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }
    next(error);
  }
}

// ── Handle Delete Transaction ────────────────────────────────────
async function deleteTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const isDeleted = await transactionRepository.softDelete(id, userId);

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction successfully removed.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};