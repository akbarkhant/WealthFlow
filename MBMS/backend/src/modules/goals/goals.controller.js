// goals.controller.js

const service = require('./goals.service');
const { sendSuccess } = require('../../shared/ApiResponse');

/**
 * ─────────────────────────────────────────────
 * SAFE PROGRESS & TIME-BASED CALCULATION
 * ─────────────────────────────────────────────
 * NOTE:
 * Core business rules (status changes, completion logic) 
 * are strictly enforced in the SERVICE/DB layer.
 * This function derives UI-centric presentation fields dynamically.
 */
function calculateProgress(goal) {
  if (!goal) return null;

  const current = Number(goal.current_amount || 0);
  const target = Number(goal.target_amount || 0);
  const allowOverflow = !!goal.allow_overflow;

  // 3. Progress Calculation Logic (Avoid divide-by-zero)
  let completionPercentage = target > 0 
    ? Number(((current / target) * 100).toFixed(2)) 
    : 0;

  // Clamp between 0 - 100% unless overflow is enabled
  if (!allowOverflow && completionPercentage > 100) {
    completionPercentage = 100;
  }

  // 4. Time-Based Smart Logic
  let daysLeft = null;
  let requiredDailySavings = 0;

  if (goal.target_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(goal.target_date);
    targetDate.setHours(0, 0, 0, 0);

    const timeDiff = targetDate.getTime() - today.getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // If goal isn't completed and has time remaining, calculate run-rate
    if (daysLeft > 0 && current < target) {
      const remainingAmount = target - current;
      requiredDailySavings = Number((remainingAmount / daysLeft).toFixed(2));
    }
  }

  return {
    ...goal,
    completionPercentage,
    daysLeft: daysLeft !== null ? Math.max(0, daysLeft) : null,
    requiredDailySavings,
    isCompleted: goal.status === 'COMPLETED' || (current >= target && target > 0),
    isOverdue: goal.status === 'OVERDUE' || (daysLeft < 0 && current < target)
  };
}

/**
 * ─────────────────────────────────────────────
 * GET /api/goals
 * Get all goals for logged-in user
 * ─────────────────────────────────────────────
 */
async function list(req, res, next) {
  try {
    // 6. Access Control: strictly tied to req.user.id
    const result = await service.list(req.user.id);

    const processedGoals = (result.data || []).map(calculateProgress);

    return sendSuccess(res, processedGoals, 200, {
      total: result.meta?.total || processedGoals.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ─────────────────────────────────────────────
 * GET /api/goals/:id
 * Get single goal
 * ─────────────────────────────────────────────
 */
async function getById(req, res, next) {
  try {
    // 6. Access Control handled in service via dual parameters
    const goal = await service.getById(
      req.params.id,
      req.user.id
    );

    return sendSuccess(res, calculateProgress(goal));
  } catch (err) {
    next(err);
  }
}
/**
 * ─────────────────────────────────────────────
 * POST /api/goals
 * Create a new goal
 * ─────────────────────────────────────────────
 */
async function create(req, res, next) {
  try {
    // FIX: Destructure targetAmount (camelCase) to match the JSON input, 
    // or fallback to target_amount if your legacy frontend sends snake_case.
    const { name, icon, target_amount, currency, allowOverflow, deadline } = req.body;

    // Consolidate the variable cleanly
    const finalTarget = target_amount || targetAmount;

    // Validation Guardrail
    if (!finalTarget || Number(finalTarget) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Target amount must be greater than 0.' 
      });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Goal name is required.' });
    }

    // Forward the sanitized object down to your service layer
    const newGoal = await service.create(req.user.id, {
      name,
      icon: icon || '🎯',
      target_amount: Number(finalTarget),
      currency: currency || 'USD',
      allowOverflow: !!allowOverflow,
      deadline: deadline || null
    });

    return res.status(201).json({
      success: true,
      data: newGoal
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ─────────────────────────────────────────────
 * POST /api/goals/:id/contribute
 * Add money to goal
 * ─────────────────────────────────────────────
 */
async function contribute(req, res, next) {
  try {
    const { amount } = req.body;

    // Fast-fail check at controller level
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Contribution amount must be greater than zero.' });
    }

    // FIX: Pass the raw number directly as the 3rd argument instead of an object
    const updatedGoal = await service.contribute(
      req.params.id,
      req.user.id,
      Number(amount) 
    );

    const goalWithProgress = calculateProgress(updatedGoal);

    return sendSuccess(res, {
      ...goalWithProgress,
      justCompleted:
        goalWithProgress.isCompleted &&
        updatedGoal.status === false,
      message: `Successfully contributed Rs. ${Number(amount).toLocaleString()} toward your goal.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ─────────────────────────────────────────────
 * PATCH /api/goals/:id
 * Update goal details safely
 * ─────────────────────────────────────────────
 */
async function update(req, res, next) {
  try {
    const { name, target_amount, target_date, status, allow_overflow } = req.body;
    
    // Whitelist acceptable payload parameters to block cross-user or malicious updates (e.g. changing current_amount manually)
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (target_amount !== undefined) updatePayload.target_amount = Number(target_amount);
    if (target_date !== undefined) updatePayload.target_date = target_date;
    if (status !== undefined) updatePayload.status = status; // Reopen / Archive / Pause
    if (allow_overflow !== undefined) updatePayload.allow_overflow = allow_overflow;

    // 5. Validation and safety constraints are checked in the service layer 
    // (e.g., verifying target_amount hasn't fallen below current_amount)
    const updatedGoal = await service.update(
      req.params.id,
      req.user.id,
      updatePayload
    );

    return sendSuccess(res, calculateProgress(updatedGoal));
  } catch (err) {
    next(err);
  }
}

/**
 * ─────────────────────────────────────────────
 * DELETE /api/goals/:id
 * Remove or Archive goal
 * ─────────────────────────────────────────────
 */
async function remove(req, res, next) {
  try {
    // Service handles ownership checks and safety logic (e.g. soft-delete/archive)
    await service.remove(req.params.id, req.user.id);

    return sendSuccess(res, {
      message: 'Financial goal deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  contribute,
  update,
  remove,
};