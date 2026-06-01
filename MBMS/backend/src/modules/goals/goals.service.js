// goals.service.js
// Business logic layer (controller ↔ repository)

const repo = require('./goals.repository');

/**
 * ─────────────────────────────────────────────
 * UTILITY / CALCULATION HELPER FUNCTIONS
 * ─────────────────────────────────────────────
 */

/**
 * Computes goal progress percentage and dynamic time metrics
 * Matches Requirements 3 & 4
 */
function calculateGoalMetrics(goal) {
  const currentAmount = Number(goal.currentAmount || goal.current_amount || 0);
  const target_amount = Number(goal.target_amount || goal.target_amount || 0);
  const allowOverflow = !!(goal.allowOverflow || goal.allow_overflow);
  const deadline = goal.deadline || goal.targetDate;

  // 1. Progress Calculation (Avoid division by zero & clamp if needed)
  let progress = 0;
  if (target_amount > 0) {
    progress = (currentAmount / target_amount) * 100;
    if (!allowOverflow && progress > 100) {
      progress = 100;
    }
    progress = Math.max(0, parseFloat(progress.toFixed(2)));
  }

  // 2. Time-Based / Smart Logic
  let daysLeft = null;
  let requiredDailySavings = null;
  let isOverdue = false;

  if (deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deadline);
    targetDate.setHours(0, 0, 0, 0);

    const timeDiff = targetDate.getTime() - today.getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Check if goal is overdue
    if (daysLeft < 0 && goal.status !== 'COMPLETED') {
      isOverdue = true;
      daysLeft = 0; // Don't expose negative days to UI
    }

    // Required daily savings rate to meet deadline
    const remainingAmount = target_amount - currentAmount;
    if (remainingAmount > 0 && daysLeft > 0) {
      requiredDailySavings = parseFloat((remainingAmount / daysLeft).toFixed(2));
    } else if (remainingAmount <= 0) {
      requiredDailySavings = 0;
    } else {
      requiredDailySavings = remainingAmount; // Everything is due right now
    }
  }

  // Derive status based on metrics if it's currently ACTIVE
  let currentStatus = goal.status || 'ACTIVE';
  if (currentStatus === 'ACTIVE' && isOverdue) {
    currentStatus = 'OVERDUE';
  }

  return {
    progress,
    daysLeft,
    requiredDailySavings,
    derivedStatus: currentStatus
  };
}

/**
 * ─────────────────────────────────────────────
 * LIST ALL GOALS
 * ─────────────────────────────────────────────
 */
async function list(userId) {
  const goals = await repo.findAllByUser(userId);

  // Enhance every goal in the list with calculating tracking logic
  const enrichedGoals = goals.map(goal => {
    const metrics = calculateGoalMetrics(goal);
    return {
      ...goal,
      progress: metrics.progress,
      daysLeft: metrics.daysLeft,
      requiredDailySavings: metrics.requiredDailySavings,
      status: goal.status === 'ACTIVE' ? metrics.derivedStatus : goal.status
    };
  });

  return {
    data: enrichedGoals,
    meta: {
      total: enrichedGoals.length,
    },
  };
}

/**
 * ─────────────────────────────────────────────
 * GET SINGLE GOAL
 * ─────────────────────────────────────────────
 */
async function getById(goalId, userId) {
  const goal = await repo.findById(goalId, userId);

  // Requirement 6: Ownership Verification
  if (!goal) {
    const err = new Error('Goal not found');
    err.status = 404;
    throw err;
  }

  const metrics = calculateGoalMetrics(goal);
  
  return {
    ...goal,
    progress: metrics.progress,
    daysLeft: metrics.daysLeft,
    requiredDailySavings: metrics.requiredDailySavings,
    status: goal.status === 'ACTIVE' ? metrics.derivedStatus : goal.status
  };
}

/**
 * ─────────────────────────────────────────────
 * CREATE GOAL
 * ─────────────────────────────────────────────
 */
async function create(userId, body) {
  const {
    name,
    icon,
    target_amount,
    targetDate,
    current_amount,
    currency,
    allow_overflow,
  } = body;

  // Requirement 5 & 6: Strict Field Validations
  if (!userId) {
    const err = new Error('userId is strictly required');
    err.status = 400;
    throw err;
  }

  if (!name) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }

  if (target_amount === undefined || target_amount === null) {
    const err = new Error('target_amount is required');
    err.status = 400;
    throw err;
  }

  if (Number(target_amount) <= 0) {
    const err = new Error('target_amount must be greater than 0');
    err.status = 400;
    throw err;
  }

  if (!currency) {
    const err = new Error('currency is required');
    err.status = 400;
    throw err;
  }

  const initial_amount = Number(current_amount || 0);
  const target = Number(target_amount);
  
  // Determine starting status based on initial balance
  let status = 'ACTIVE';
  if (initial_amount >= target) {
    status = 'COMPLETED';
  }

  const goal = await repo.create({
    userId,
    name: name ,
    icon,
    currency,
    target_amount: target,
    current_amount: initial_amount,
    deadline: targetDate || null,
    allow_overflow: !!allow_overflow,
    status: status, // Requirement 1: Starts ACTIVE or COMPLETED if initial satisfies goal
  });

  const metrics = calculateGoalMetrics(goal);

  return {
    ...goal,
    ...metrics,
  };
}

/**
 * ─────────────────────────────────────────────
 * CONTRIBUTE TO GOAL (Money Flow & Side Effects)
 * ─────────────────────────────────────────────
 */
async function contribute(goalId, userId, amount, paymentDetails = {}) {
  const numericAmount = Number(amount);
  
  // Safely destruct payment attributes with fallbacks if object is omitted
  const { source = 'manual', note = null } = paymentDetails || {};

  // Requirement 1: Validate contribution amount is valid currency increments
  if (isNaN(numericAmount) || numericAmount <= 0) {
    const err = new Error('Contribution amount must be greater than zero');
    err.status = 400;
    throw err;
  }

  // Requirement 2: Ensure target goal exists and belongs exclusively to the request user
  const goal = await repo.findById(goalId, userId);
  if (!goal) {
    const err = new Error('Goal not found or unauthorized');
    err.status = 404;
    throw err;
  }

  // Requirement 3: Lifecycle rule constraints enforcement
  if (goal.status === 'COMPLETED') {
    const err = new Error('Completed goals cannot accept contributions unless explicitly reopened');
    err.status = 400;
    throw err;
  }
  
  if (goal.status === 'PAUSED' || goal.status === 'FAILED') {
    const err = new Error(`Cannot contribute to a goal that is currently ${goal.status}`);
    err.status = 400;
    throw err;
  }

  // Requirement 4: Core Flow Mathematics (Capping vs. Unlimited Overflowing)
  const current_amount = Number(goal.currentAmount || goal.current_amount || 0);
  const target_amount = Number(goal.target_amount || goal.target_amount || 0);
  const allow_overflow = !!(goal.allowOverflow || goal.allow_overflow);

  let proposedNewAmount = current_amount + numericAmount;
  let actualContributionAmount = numericAmount;

  if (proposedNewAmount > target_amount && !allow_overflow) {
    // If overflow tracking is disabled, cap the final calculation right at the target
    actualContributionAmount = target_amount - current_amount;
    proposedNewAmount = target_amount;

    // Safety edge case guard if database synchronization was delayed
    if (actualContributionAmount <= 0) {
      const err = new Error('Goal is already fully funded and overflow is disabled');
      err.status = 400;
      throw err;
    }
  }

  // Requirement 5: Auto-evaluate state migration changes
  let finalStatus = goal.status;
  if (proposedNewAmount >= target_amount) {
    finalStatus = 'COMPLETED';
  }

  // Requirement 6: Update main goal document
  // Passing properties explicitly in camelCase to fit the repository's destructuring block
  const updatedGoal = await repo.update(goalId, userId, {
    name: goal.name || goal.name, 
    target_amount: target_amount,
    allow_overflow: allow_overflow,
    deadline: goal.deadline || goal.target_date,
    current_amount: proposedNewAmount, // Map to the exact repository keyword update field
    status: finalStatus
  });

  // Requirement 7: Write to audit trail (goal_contributions table) for legal history tracking
  await repo.contribute({
    goalId,
    userId,
    amount: actualContributionAmount,
    source,
    note,
    date: new Date()
  });

  // Requirement 8: Recalculate runtime tracking transformations (Days left, percentage etc.)
  // Safe execution pattern check in case module helper is declared under alternative namespaces
  const metrics = typeof calculateGoalMetrics === 'function' ? calculateGoalMetrics(updatedGoal) : {};
  const justCompleted = (finalStatus === 'COMPLETED' && goal.status !== 'COMPLETED');

  // Build the unified payload package to return back to the controller pipeline
  return {
    ...updatedGoal,
    ...metrics,
    justCompleted,
    message: `Successfully contributed ${updatedGoal.currency || 'Rs.'} ${actualContributionAmount.toLocaleString()} toward your goal.`,
  };
}
/**
 * ─────────────────────────────────────────────
 * UPDATE GOAL (Business Rules Validation)
 * ─────────────────────────────────────────────
 */
async function update(goalId, userId, body) {
  const { target_amount, status, name, icon, deadline, allow_overflow } = body;

  // Requirement 6: Look up existing target configuration safely
  const existingGoal = await repo.findById(goalId, userId);
  if (!existingGoal) {
    const err = new Error('Goal not found');
    err.status = 404;
    throw err;
  }

  // Requirement 5: Cannot modify completed goals unless explicitly mutating status
  if (existingGoal.status === 'COMPLETED' && !status) {
    const err = new Error('Cannot modify details of a completed goal unless updating status to reopen it');
    err.status = 400;
    throw err;
  }

  const currentAmount = Number(existingGoal.currentAmount || existingGoal.current_amount || 0);
  const updatePayload = {};

  // Requirement 5: Target amount boundary guards
  if (target_amount !== undefined) {
    const numericTarget = Number(target_amount);
    if (numericTarget <= 0) {
      const err = new Error('target_amount must be greater than 0');
      err.status = 400;
      throw err;
    }
    if (numericTarget < currentAmount) {
      const err = new Error(`target_amount cannot be set lower than your current progress of ${currentAmount}`);
      err.status = 400;
      throw err;
    }
    updatePayload.target_amount = numericTarget;
  }

  // Requirement 1: Handle Manual Lifecycle status Updates
  if (status) {
    const allowedStatuses = ['ACTIVE', 'COMPLETED', 'PAUSED', 'FAILED', 'ARCHIVED'];
    if (!allowedStatuses.includes(status)) {
      const err = new Error('Invalid goal status update requested');
      err.status = 400;
      throw err;
    }
    updatePayload.status = status;
  }

  // Map remaining structural safe fields
  if (name !== undefined) updatePayload.name = name;
  if (icon !== undefined) updatePayload.icon = icon;
  if (deadline !== undefined) updatePayload.deadline = deadline;
  if (allow_overflow !== undefined) updatePayload.allow_overflow = !!allow_overflow;

  // Persist modifications
  const updated = await repo.update(goalId, userId, updatePayload);
  const metrics = calculateGoalMetrics(updated);

  // Requirement 8: If changes in parameters complete goals automatically
  if (updated.status === 'ACTIVE' && metrics.progress >= 100) {
    const autoCompletedGoal = await repo.update(goalId, userId, { status: 'COMPLETED' });
    return { ...autoCompletedGoal, ...calculateGoalMetrics(autoCompletedGoal) };
  }

  return {
    ...updated,
    ...metrics
  };
}

/**
 * ─────────────────────────────────────────────
 * DELETE / ARCHIVE GOAL
 * ─────────────────────────────────────────────
 */
async function remove(goalId, userId) {
  // Requirement 6: Ensure authorization matches before dropping entries
  const existingGoal = await repo.findById(goalId, userId);
  if (!existingGoal) {
    const err = new Error('Goal not found');
    err.status = 404;
    throw err;
  }

  const deleted = await repo.remove(goalId, userId);
  if (!deleted) {
    const err = new Error('Goal could not be deleted');
    err.status = 500;
    throw err;
  }

  return {
    success: true,
    message: 'Goal deleted successfully',
  };
}

module.exports = {
  list,
  getById,
  create,
  contribute,
  update,
  remove,
};