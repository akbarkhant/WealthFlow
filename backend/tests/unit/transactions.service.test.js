// tests/unit/transactions.service.test.js
const { transactionsService } = require('../../src/modules/transactions/transactions.service');

describe('Transactions Service (Unit Tests)', () => {
  describe('createTransaction()', () => {
    it('should create income transaction with valid data', async () => {
      const transactionData = {
        userId: 'user-123',
        type: 'income',
        amount: 5000.00,
        description: 'Monthly Salary',
        category: 'salary',
        date: new Date('2026-06-01'),
      };

      const result = await transactionsService.createTransaction(transactionData);

      expect(result).toBeDefined();
      expect(result.type).toBe('income');
      expect(result.amount).toBe(5000.00);
      expect(result.category).toBe('salary');
    });

    it('should create expense transaction with valid data', async () => {
      const transactionData = {
        userId: 'user-123',
        type: 'expense',
        amount: 150.00,
        description: 'Grocery Shopping',
        category: 'food',
        date: new Date('2026-06-10'),
      };

      const result = await transactionsService.createTransaction(transactionData);

      expect(result).toBeDefined();
      expect(result.type).toBe('expense');
      expect(result.amount).toBe(150.00);
    });

    it('should reject transaction with missing required fields', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'income',
        // missing amount, description, category
      };

      await expect(transactionsService.createTransaction(invalidData)).rejects.toThrow();
    });

    it('should reject transaction with zero amount', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'income',
        amount: 0,
        description: 'Test',
        category: 'salary',
      };

      await expect(transactionsService.createTransaction(invalidData)).rejects.toThrow(
        'Amount must be greater than zero'
      );
    });

    it('should reject transaction with negative amount', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'expense',
        amount: -100.00,
        description: 'Test',
        category: 'food',
      };

      await expect(transactionsService.createTransaction(invalidData)).rejects.toThrow(
        'Amount must be positive'
      );
    });

    it('should reject invalid transaction type', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'invalid_type',
        amount: 100.00,
        description: 'Test',
        category: 'food',
      };

      await expect(transactionsService.createTransaction(invalidData)).rejects.toThrow(
        'Invalid transaction type'
      );
    });

    it('should reject future-dated transaction', async () => {
      const invalidData = {
        userId: 'user-123',
        type: 'income',
        amount: 1000.00,
        description: 'Future salary',
        category: 'salary',
        date: new Date('2099-12-31'),
      };

      await expect(transactionsService.createTransaction(invalidData)).rejects.toThrow(
        'Transaction date cannot be in the future'
      );
    });
  });

  describe('getTransactionById()', () => {
    it('should retrieve transaction by ID', async () => {
      const transactionId = 'txn-123';

      const result = await transactionsService.getTransactionById(transactionId);

      expect(result).toBeDefined();
      expect(result.id).toBe(transactionId);
    });

    it('should throw error for non-existent transaction', async () => {
      const nonExistentId = 'invalid-txn-id';

      await expect(transactionsService.getTransactionById(nonExistentId)).rejects.toThrow(
        'Transaction not found'
      );
    });
  });

  describe('getTransactionsByUserId()', () => {
    it('should retrieve all transactions for user', async () => {
      const userId = 'user-123';

      const result = await transactionsService.getTransactionsByUserId(userId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((txn) => {
        expect(txn.userId).toBe(userId);
      });
    });

    it('should filter transactions by type', async () => {
      const userId = 'user-123';
      const filters = { type: 'income' };

      const result = await transactionsService.getTransactionsByUserId(userId, filters);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((txn) => {
        expect(txn.type).toBe('income');
      });
    });

    it('should filter transactions by category', async () => {
      const userId = 'user-123';
      const filters = { category: 'food' };

      const result = await transactionsService.getTransactionsByUserId(userId, filters);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((txn) => {
        expect(txn.category).toBe('food');
      });
    });

    it('should filter transactions by date range', async () => {
      const userId = 'user-123';
      const filters = {
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      };

      const result = await transactionsService.getTransactionsByUserId(userId, filters);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((txn) => {
        const txnDate = new Date(txn.date);
        expect(txnDate >= filters.startDate).toBe(true);
        expect(txnDate <= filters.endDate).toBe(true);
      });
    });
  });

  describe('updateTransaction()', () => {
    it('should update transaction with valid data', async () => {
      const transactionId = 'txn-123';
      const updateData = {
        amount: 200.00,
        description: 'Updated description',
      };

      const result = await transactionsService.updateTransaction(transactionId, updateData);

      expect(result).toBeDefined();
      expect(result.amount).toBe(200.00);
      expect(result.description).toBe('Updated description');
    });

    it('should not allow changing transaction type', async () => {
      const transactionId = 'txn-123';
      const updateData = {
        type: 'income', // Cannot change type
      };

      await expect(
        transactionsService.updateTransaction(transactionId, updateData)
      ).rejects.toThrow('Cannot change transaction type');
    });

    it('should throw error for non-existent transaction', async () => {
      const nonExistentId = 'invalid-txn-id';
      const updateData = { amount: 100.00 };

      await expect(
        transactionsService.updateTransaction(nonExistentId, updateData)
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('deleteTransaction()', () => {
    it('should delete transaction successfully', async () => {
      const transactionId = 'txn-123';

      const result = await transactionsService.deleteTransaction(transactionId);

      expect(result).toBe(true);
    });

    it('should throw error for non-existent transaction', async () => {
      const nonExistentId = 'invalid-txn-id';

      await expect(transactionsService.deleteTransaction(nonExistentId)).rejects.toThrow(
        'Transaction not found'
      );
    });
  });

  describe('getTransactionStats()', () => {
    it('should calculate income and expense totals', async () => {
      const userId = 'user-123';

      const result = await transactionsService.getTransactionStats(userId);

      expect(result).toHaveProperty('totalIncome');
      expect(result).toHaveProperty('totalExpenses');
      expect(result).toHaveProperty('netBalance');
      expect(result.netBalance).toBe(result.totalIncome - result.totalExpenses);
    });

    it('should provide stats for date range', async () => {
      const userId = 'user-123';
      const dateRange = {
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
      };

      const result = await transactionsService.getTransactionStats(userId, dateRange);

      expect(result).toHaveProperty('totalIncome');
      expect(result).toHaveProperty('totalExpenses');
      expect(result).toHaveProperty('period');
    });
  });

  describe('getCategoryBreakdown()', () => {
    it('should provide spending breakdown by category', async () => {
      const userId = 'user-123';

      const result = await transactionsService.getCategoryBreakdown(userId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((categoryData) => {
        expect(categoryData).toHaveProperty('category');
        expect(categoryData).toHaveProperty('amount');
        expect(categoryData).toHaveProperty('percentage');
      });
    });

    it('should filter category breakdown by transaction type', async () => {
      const userId = 'user-123';
      const type = 'expense';

      const result = await transactionsService.getCategoryBreakdown(userId, type);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((categoryData) => {
        expect(categoryData.type).toBe(type);
      });
    });
  });

  describe('getDuplicateTransactions()', () => {
    it('should identify duplicate transactions', async () => {
      const userId = 'user-123';

      const result = await transactionsService.getDuplicateTransactions(userId);

      expect(Array.isArray(result)).toBe(true);
      // Each item should contain transactions that are duplicates
      result.forEach((duplicateGroup) => {
        expect(duplicateGroup.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('bulkCreateTransactions()', () => {
    it('should create multiple transactions', async () => {
      const userId = 'user-123';
      const transactions = [
        {
          type: 'income',
          amount: 5000,
          description: 'Salary',
          category: 'salary',
          date: new Date('2026-06-01'),
        },
        {
          type: 'expense',
          amount: 100,
          description: 'Groceries',
          category: 'food',
          date: new Date('2026-06-05'),
        },
      ];

      const result = await transactionsService.bulkCreateTransactions(userId, transactions);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should handle partial failures in bulk create', async () => {
      const userId = 'user-123';
      const transactions = [
        {
          type: 'income',
          amount: 5000,
          description: 'Salary',
          category: 'salary',
        },
        {
          type: 'invalid',
          amount: -100,
          description: 'Bad transaction',
        },
      ];

      const result = await transactionsService.bulkCreateTransactions(userId, transactions);

      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');
    });
  });
});