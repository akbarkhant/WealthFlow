// tests/transactions.service.test.js

const transactionsService = require('../../src/modules/transactions/transactions.service');

describe('Transactions Service Tests', () => {
  // ─────────────────────────────────────────────
  // CREATE TRANSACTION
  // ─────────────────────────────────────────────

  describe('create()', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        userId: 1,
        title: 'Groceries',
        type: 'expense',
        category: 'Food',
        amount: 2500,
        description: 'Weekly grocery shopping',
        transactionDate: new Date(),
      };

      const transaction =
        await transactionsService.create(
          transactionData
        );

      expect(transaction).toBeDefined();

      expect(transaction.title).toBe(
        transactionData.title
      );

      expect(transaction.amount).toBe(
        transactionData.amount
      );

      expect(transaction.type).toBe(
        transactionData.type
      );
    });
  });

  // ─────────────────────────────────────────────
  // GET USER TRANSACTIONS
  // ─────────────────────────────────────────────

  describe('list()', () => {
    it('should return user transactions', async () => {
      const transactions =
        await transactionsService.list(
          1
        );

      expect(Array.isArray(transactions)).toBe(
        true
      );
    });
  });

  // ─────────────────────────────────────────────
  // GET SINGLE TRANSACTION
  // ─────────────────────────────────────────────

  describe('getById()', () => {
    it('should return transaction by id', async () => {
      const createdTransaction =
        await transactionsService.createTransaction({
          userId: 1,
          title: 'Fuel',
          type: 'expense',
          category: 'Transport',
          amount: 5000,
          description: 'Car fuel',
          transactionDate: new Date(),
        });

      const transaction =
        await transactionsService.getById(
          createdTransaction.id
        );

      expect(transaction).toBeDefined();

      expect(transaction.id).toBe(
        createdTransaction.id
      );
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE TRANSACTION
  // ─────────────────────────────────────────────

  describe('updateTransaction()', () => {
    it('should update transaction details', async () => {
      const createdTransaction =
        await transactionsService.createTransaction({
          userId: 1,
          title: 'Internet Bill',
          type: 'expense',
          category: 'Utilities',
          amount: 3000,
          description: 'Monthly internet payment',
          transactionDate: new Date(),
        });

      const updatedTransaction =
        await transactionsService.updateTransaction(
          createdTransaction.id,
          {
            amount: 3500,
          }
        );

      expect(updatedTransaction.amount).toBe(
        3500
      );
    });
  });

  // ─────────────────────────────────────────────
  // DELETE TRANSACTION
  // ─────────────────────────────────────────────

  describe('deleteTransaction()', () => {
    it('should delete transaction successfully', async () => {
      const createdTransaction =
        await transactionsService.createTransaction({
          userId: 1,
          title: 'Movie Ticket',
          type: 'expense',
          category: 'Entertainment',
          amount: 1200,
          description: 'Cinema',
          transactionDate: new Date(),
        });

      const result =
        await transactionsService.deleteTransaction(
          createdTransaction.id
        );

      expect(result).toBeDefined();
    });
  });
});