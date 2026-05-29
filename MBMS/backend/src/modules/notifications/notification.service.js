// push-notification.service.js

const pool = require('../../config/db.config');
const webpush = require('../../config/webpush.config');

// ─── Save subscription to DB ──────────────────────────────────────
const saveSubscription = async (subscription, user_id) => {
  const { endpoint, keys: { p256dh, auth } } = subscription;

  const result = await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) 
     DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, updated_at = NOW()
     RETURNING *`,
    [user_id || null, endpoint, p256dh, auth]
  );

  return result.rows[0];
};

// ─── Remove subscription from DB ─────────────────────────────────
const removeSubscription = async (endpoint) => {
  const result = await pool.query(
    `DELETE FROM push_subscriptions
     WHERE endpoint = $1
     RETURNING *`,
    [endpoint]
  );

  return result.rows[0];
};

// ─── Send push to a single subscription row ───────────────────────
const sendPush = async (row, payload) => {
  const pushSub = {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };

  try {
    await webpush.sendNotification(pushSub, payload);
    return { success: true, expired: false };
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      await pool.query(
        'DELETE FROM push_subscriptions WHERE endpoint = $1',
        [row.endpoint]
      );
      return { success: false, expired: true };
    }
    
    console.error(`Push delivery failed for endpoint ${row.endpoint}:`, err);
    throw err;
  }
};

// ─── Notify a specific user (all their devices) ───────────────────
const notifyUser = async (userId, { title, body, url }) => {
  const result = await pool.query(
    'SELECT * FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return { total: 0, succeeded: 0, failed: 0, expired: 0 };
  }

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    result.rows.map(row => sendPush(row, payload))
  );

  let succeeded = 0;
  let failed = 0;
  let expired = 0;

  for (const res of results) {
    if (res.status === 'fulfilled') {
      if (res.value.success) succeeded++;
      if (res.value.expired) expired++;
    } else {
      failed++;
    }
  }

  return { total: result.rows.length, succeeded, failed, expired };
};

// ─── Broadcast to all subscribers ────────────────────────────────
const broadcastNotification = async ({ title, body, url }) => {
  const result = await pool.query('SELECT * FROM push_subscriptions');

  if (result.rows.length === 0) {
    throw new Error('No subscribers found.');
  }

  const payload = JSON.stringify({ title, body, url });

  const results = await Promise.allSettled(
    result.rows.map(row => sendPush(row, payload))
  );

  let succeeded = 0;
  let failed = 0;
  let expired = 0;

  for (const res of results) {
    if (res.status === 'fulfilled') {
      if (res.value.success) succeeded++;
      if (res.value.expired) expired++;
    } else {
      failed++;
    }
  }

  return { total: result.rows.length, succeeded, failed, expired };
};

// ─── Check Budget Alerts ─────────────────────────────────────────
/**
 * Evaluates total expenses against a category budget for a given month ('YYYY-MM').
 * Dispatches a push notification if the budget is breached.
 */
const checkBudgetAlerts = async (userId, categoryId, yearMonth) => {
  // 1. Fetch budget limit and category name simultaneously
  const budgetQuery = await pool.query(
    `SELECT b.amount, c.name as category_name 
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.user_id = $1 AND b.category_id = $2 AND b.month = $3`,
    [userId, categoryId, yearMonth]
  );

  // If no budget is set for this category and month, nothing to check
  if (budgetQuery.rows.length === 0) return null;

  const { amount: budgetLimit, category_name: categoryName } = budgetQuery.rows[0];

  // 2. Sum up all base currency transactions for this specific month and category
  // Assumes your dates are saved as timestamp or ISO strings, matching 'YYYY-MM%'
  const expenseQuery = await pool.query(
    `SELECT COALESCE(SUM(amount_in_base), 0) as total_spent 
     FROM transactions 
     WHERE user_id = $1 
       AND category_id = $2 
       AND type = 'expense' 
       AND date LIKE $3`,
    [userId, categoryId, `${yearMonth}%`]
  );

  const totalSpent = parseFloat(expenseQuery.rows[0].total_spent);

  // 3. If they breached the limit, trigger the push notification
  if (totalSpent > parseFloat(budgetLimit)) {
    const overage = (totalSpent - parseFloat(budgetLimit)).toFixed(2);
    
    try {
      // Pass the payload directly to our internal notifyUser method
      return await notifyUser(userId, {
        title: '⚠️ Budget Alert!',
        body: `You've exceeded your budget for "${categoryName}" by $${overage} this month.`,
        url: '/budgets' // Target URL for app redirect upon clicking notification
      });
    } catch (err) {
      // Log notification dispatch failure separately so it doesn't break transaction pipelines
      console.error(`Failed to dispatch budget alert to user ${userId}:`, err);
    }
  }

  return null;
};

// ─── Get VAPID public key ─────────────────────────────────────────
const getVapidPublicKey = () => {
  return process.env.VAPID_PUBLIC_KEY;
};

module.exports = {
  saveSubscription,
  removeSubscription,
  notifyUser,
  broadcastNotification,
  checkBudgetAlerts, // Exported to be consumed by transactions.service.js
  getVapidPublicKey,
};