// tests/budgets.service.test.js

const budgetsService = require('../src/services/budgets.service');

describe('Budgets Service Tests', () => {
  // ─────────────────────────────────────────────
  // CREATE BUDGET
  // ─────────────────────────────────────────────

  describe('createBudget()', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        userId: 1,
        name: 'Monthly Budget',
        category: 'Food',
        amount: 5000,
        month: '2026-05',
      };

      const result =
        await budgetsService.createBudget(
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

  describe('getUserBudgets()', () => {
    it('should return budgets for a user', async () => {
      const budgets =
        await budgetsService.getUserBudgets(1);

      expect(Array.isArray(budgets)).toBe(
        true
      );
    });
  });

  // ─────────────────────────────────────────────
  // GET SINGLE BUDGET
  // ─────────────────────────────────────────────

  describe('getBudgetById()', () => {
    it('should return a budget by id', async () => {
      const createdBudget =
        await budgetsService.createBudget({
          userId: 1,
          name: 'Transport Budget',
          category: 'Transport',
          amount: 3000,
          month: '2026-05',
        });

      const budget =
        await budgetsService.getBudgetById(
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

  describe('updateBudget()', () => {
    it('should update budget details', async () => {
      const createdBudget =
        await budgetsService.createBudget({
          userId: 1,
          name: 'Shopping Budget',
          category: 'Shopping',
          amount: 4000,
          month: '2026-05',
        });

      const updatedBudget =
        await budgetsService.updateBudget(
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
        await budgetsService.createBudget({
          userId: 1,
          name: 'Entertainment Budget',
          category: 'Entertainment',
          amount: 2000,
          month: '2026-05',
        });

      const result =
        await budgetsService.deleteBudget(
          createdBudget.id
        );

      expect(result).toBeDefined();
    });
  });
});