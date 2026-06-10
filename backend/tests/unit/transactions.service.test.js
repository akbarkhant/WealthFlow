// tests/transactions.service.test.js

const transactionsService = require('../../src/modules/transactions/transactions.service');
const { query } = require('../../src/config/db.config');

// Skip DB tests if database is not available
const describeIfDbAvailable = global.DB_AVAILABLE ? describe : describe.skip;

describeIfDbAvailable('Transactions Service Tests', () => {
  const testUserId = '11111111-1111-1111-1111-111111111111';

  beforeAll(async () => {
    // Ensure test user exists to satisfy FK constraint
    await query(
      `INSERT INTO users (id, email, password_hash, name, currency, balance, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 100000, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET balance = 100000`,
      [testUserId, 'test_tx@example.com', 'hash', 'Tx Test User', 'USD']
    );
  });
  // ─────────────────────────────────────────────
  // CREATE TRANSACTION
  // ─────────────────────────────────────────────

  describe('create()', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        userId: testUserId,
        title: 'Groceries',
        type: 'expense',
        category: 'Food',
        amount: 2500,
        description: 'Weekly grocery shopping',
        date: new Date(),
      };

      const transaction =
        await transactionsService.create(
          transactionData
        );

      expect(transaction).toBeDefined();

      expect(transaction.description).toBe(
        transactionData.description
      );

      expect(Number(transaction.amount)).toBe(
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
          testUserId
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
          userId: testUserId,
          title: 'Fuel',
          type: 'expense',
          category: 'Transport',
          amount: 5000,
          description: 'Car fuel',
          date: new Date(),
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
          userId: testUserId,
          title: 'Internet Bill',
          type: 'expense',
          category: 'Utilities',
          amount: 3000,
          description: 'Monthly internet payment',
          date: new Date(),
        });

      const updatedTransaction =
        await transactionsService.updateTransaction(
          createdTransaction.id,
          {
            amount: 3500,
          }
        );

      expect(Number(updatedTransaction.amount)).toBe(
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
          userId: testUserId,
          title: 'Movie Ticket',
          type: 'expense',
          category: 'Entertainment',
          amount: 1200,
          description: 'Cinema',
          date: new Date(),
        });

      const result =
        await transactionsService.deleteTransaction(
          createdTransaction.id
        );

      expect(result).toBeDefined();
    });
  });
});