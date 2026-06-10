// tests/budgets.service.test.js

const budgetsService = require('../../src/modules/budgets/budget.service');

// Skip DB tests if database is not available
const describeIfDbAvailable = global.DB_AVAILABLE ? describe : describe.skip;

describeIfDbAvailable('Budgets Service Tests', () => {
  // ─────────────────────────────────────────────
  // CREATE BUDGET
  // ─────────────────────────────────────────────

  describe('create()', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        userId: 1,
        name: 'Monthly Budget',
        category: 'Food',
        amount: 5000,
        month: '2026-05',
      };

      const result =
        await budgetsService.create(
          budgetData
        );

      expect(result).toBeDefined();

      expect(result.name).toBe(
        budgetData.name
      );

      expect(result.amount).toBe(
        budgetData.amount
      );
    });
  });

  // ─────────────────────────────────────────────
  // GET USER BUDGETS
  // ─────────────────────────────────────────────

  describe('list()', () => {
    it('should return budgets for a user', async () => {
      const budgets =
        await budgetsService.list(1);

      expect(Array.isArray(budgets)).toBe(
        true
      );
    });
  });

  // ─────────────────────────────────────────────
  // GET SINGLE BUDGET
  // ─────────────────────────────────────────────

  describe('getById()', () => {
    it('should return a budget by id', async () => {
      const createdBudget =
        await budgetsService.create({
          userId: 1,
          name: 'Transport Budget',
          category: 'Transport',
          amount: 3000,
          month: '2026-05',
        });

      const budget =
        await budgetsService.getById(
          createdBudget.id
        );

      expect(budget).toBeDefined();

      expect(budget.id).toBe(
        createdBudget.id
      );
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE BUDGET
  // ─────────────────────────────────────────────

  describe('update()', () => {
    it('should update budget details', async () => {
      const createdBudget =
        await budgetsService.create({
          userId: 1,
          name: 'Shopping Budget',
          category: 'Shopping',
          amount: 4000,
          month: '2026-05',
        });

      const updatedBudget =
        await budgetsService.update(
          createdBudget.id,
          {
            amount: 6000,
          }
        );

      expect(updatedBudget.amount).toBe(
        6000
      );
    });
  });

  // ─────────────────────────────────────────────
  // DELETE BUDGET
  // ─────────────────────────────────────────────

  describe('deleteBudget()', () => {
    it('should delete a budget', async () => {
      const createdBudget =
        await budgetsService.create({
          userId: 1,
          name: 'Entertainment Budget',
          category: 'Entertainment',
          amount: 2000,
          month: '2026-05',
        });

      const result =
        await budgetsService.remove(
          createdBudget.id
        );

      expect(result).toBeDefined();
    });
  });
});