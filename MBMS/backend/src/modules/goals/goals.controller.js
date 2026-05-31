// goals.controller.js
const service = require('./goals.service');
const { sendSuccess } = require('../../shared/ApiResponse');

/**
 * ── Get All Goals (With Progress Calculations) ───────────────────
 * GET /api/goals
 */
async function list(req, res, next) {
  try {
    const userId = req.user.id;
    const goals = await service.list(userId, req.query);

    // Dynamic UX Mapper: Injects computed completion percentage for the frontend progress bars
    const processedGoals = goals.data.map(goal => {
      const currentAmount = Number(goal.currentAmount || 0);
      const targetAmount = Number(goal.targetAmount || 0);
      
      // Prevent division by zero and cap progress tightly at 100%
      const percentage = targetAmount > 0 
        ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) 
        : 0;

      return {
        ...goal,
        completionPercentage: percentage,
        isCompleted: percentage >= 100
      };
    });

    sendSuccess(res, processedGoals, 200, goals.meta);
  } catch (err) {
    next(err);
  }
}

/**
 * ── Get Single Goal ──────────────────────────────────────────────
 * GET /api/goals/:id
 */
async function getOne(req, res, next) {
  try {
    const goal = await service.getById(req.params.id, req.user.id);
    
    const currentAmount = Number(goal.currentAmount || 0);
    const targetAmount = Number(goal.targetAmount || 0);
    const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

    sendSuccess(res, {
      ...goal,
      completionPercentage: percentage
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ── Create Financial Goal ────────────────────────────────────────
 * POST /api/goals
 * Body: { title, targetAmount, targetDate, currency }
 */
async function create(req, res, next) {
  try {
    const goalData = {
      ...req.body,
      currentAmount: 0 // Explicitly initialize progress tracking balances at zero
    };

    const newGoal = await service.create(req.user.id, goalData);
    sendSuccess(res, newGoal, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * ── Contribute to Savings Goal ───────────────────────────────────
 * POST /api/goals/:id/contribute
 * Body: { amount }
 * UX Trick: This increments progress and automatically feeds transaction logs
 */
async function contribute(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Contribution amount must be a positive numeric value.'
      });
    }

    // Process increment via service layer logic
    const updatedGoal = await service.addContribution(id, userId, amount);
    
    const currentAmount = Number(updatedGoal.currentAmount || 0);
    const targetAmount = Number(updatedGoal.targetAmount || 0);
    const percentage = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

    // Send the updated data along with notification sparks for immediate UI confetti triggers
    sendSuccess(res, {
      ...updatedGoal,
      completionPercentage: percentage,
      justCompleted: percentage >= 100,
      message: `Successfully contributed Rs. ${amount} toward your ${updatedGoal.title || 'goal'}!`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ── Update Goal Parameters ───────────────────────────────────────
 * PATCH /api/goals/:id
 */
async function update(req, res, next) {
  try {
    const updatedGoal = await service.update(
      req.params.id,
      req.user.id,
      req.body
    );
    sendSuccess(res, updatedGoal);
  } catch (err) {
    next(err);
  }
}

/**
 * ── Remove Financial Goal ────────────────────────────────────────
 * DELETE /api/goals/:id
 */
async function remove(req, res, next) {
  try {
    await service.remove(req.params.id, req.user.id);
    sendSuccess(res, {
      message: 'Financial target track deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  create,
  contribute,
  update,
  remove
};