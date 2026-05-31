// notification.service.js  (enhanced)

const pool      = require('../../config/db.config');
const webpush   = require('../../config/webpush.config');

// ─── Constants ───────────────────────────────────────────────────
const BROADCAST_CHUNK_SIZE  = 50;   // push N subscriptions at a time
const BROADCAST_CHUNK_DELAY = 300;  // ms between chunks
const RETRY_ATTEMPTS        = 3;
const RETRY_BASE_DELAY      = 500;  // ms — doubles each attempt

// ─── Helpers ─────────────────────────────────────────────────────

/** Sleep for `ms` milliseconds. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Send a push to one subscription row with exponential-backoff retry.
 * Expired (410/404) subscriptions are auto-deleted and never retried.
 */
const sendPush = async (row, payload, attempt = 1) => {
  const pushSub = {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };

  try {
    await webpush.sendNotification(pushSub, payload);
    return { success: true, expired: false };
  } catch (err) {
    // ── Expired subscription — delete and stop ────────────────────
    if (err.statusCode === 410 || err.statusCode === 404) {
      await pool.query(
        'DELETE FROM push_subscriptions WHERE endpoint = $1',
        [row.endpoint]
      );
      return { success: false, expired: true };
    }

    // ── Transient error — retry with exponential backoff ──────────
    if (attempt < RETRY_ATTEMPTS) {
      const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
      console.warn(
        `Push failed for ${row.endpoint} (attempt ${attempt}/${RETRY_ATTEMPTS}). Retrying in ${delay}ms…`
      );
      await sleep(delay);
      return sendPush(row, payload, attempt + 1);
    }

    console.error(`Push delivery failed permanently for endpoint ${row.endpoint}:`, err);
    throw err;
  }
};

/**
 * Aggregate an array of Promise.allSettled results into a summary object.
 */
const aggregateResults = (results) => {
  let succeeded = 0, failed = 0, expired = 0;
  for (const res of results) {
    if (res.status === 'fulfilled') {
      if (res.value.success)  succeeded++;
      if (res.value.expired)  expired++;
    } else {
      failed++;
    }
  }
  return { succeeded, failed, expired };
};

// ─── Notification History ─────────────────────────────────────────
/**
 * Persist a notification record for auditing / in-app history.
 * Non-fatal — errors are swallowed so they never break delivery.
 */
const logNotification = async ({ userId = null, type, title, body, url, status }) => {
  try {
    await pool.query(
      `INSERT INTO notification_history (user_id, type, title, body, url, status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, type, title, body, url || null, status]
    );
  } catch (err) {
    console.error('Failed to log notification history:', err.message);
  }
};

// ─── User Preferences ────────────────────────────────────────────
/**
 * Returns true when the user has NOT opted out of this notification type.
 * Defaults to true (opted in) when no preference row exists.
 */
const isUserOptedIn = async (userId, type) => {
  const result = await pool.query(
    `SELECT enabled FROM notification_preferences
     WHERE user_id = $1 AND type = $2`,
    [userId, type]
  );
  if (result.rows.length === 0) return true;  // default opted-in
  return result.rows[0].enabled;
};

/**
 * Upsert a user's opt-in/out preference for a given notification type.
 */
const setUserPreference = async (userId, type, enabled) => {
  const result = await pool.query(
    `INSERT INTO notification_preferences (user_id, type, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, type)
     DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = NOW()
     RETURNING *`,
    [userId, type, enabled]
  );
  return result.rows[0];
};

/**
 * Fetch all preferences for a user (for a settings UI).
 */
const getUserPreferences = async (userId) => {
  const result = await pool.query(
    `SELECT type, enabled, updated_at
     FROM notification_preferences
     WHERE user_id = $1
     ORDER BY type`,
    [userId]
  );
  return result.rows;
};

// ─── Subscription Management ──────────────────────────────────────

const saveSubscription = async (subscription, user_id) => {
  const { endpoint, keys: { p256dh, auth } } = subscription;
  const result = await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint)
     DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh,
                   auth = EXCLUDED.auth, updated_at = NOW()
     RETURNING *`,
    [user_id || null, endpoint, p256dh, auth]
  );
  return result.rows[0];
};

const removeSubscription = async (endpoint) => {
  const result = await pool.query(
    'DELETE FROM push_subscriptions WHERE endpoint = $1 RETURNING *',
    [endpoint]
  );
  return result.rows[0];
};

// ─── Notify a specific user (all their devices) ───────────────────
const notifyUser = async (userId, { title, body, url, type = 'general' }) => {
  // ── Respect user opt-out preference ──────────────────────────────
  const optedIn = await isUserOptedIn(userId, type);
  if (!optedIn) {
    return { total: 0, succeeded: 0, failed: 0, expired: 0, skipped: true };
  }

  const result = await pool.query(
    'SELECT * FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return { total: 0, succeeded: 0, failed: 0, expired: 0 };
  }

  const payload = JSON.stringify({ title, body, url, type });
  const results = await Promise.allSettled(
    result.rows.map((row) => sendPush(row, payload))
  );

  const summary = aggregateResults(results);
  const status  = summary.succeeded > 0 ? 'delivered' : 'failed';

  await logNotification({ userId, type, title, body, url, status });

  return { total: result.rows.length, ...summary };
};

// ─── Broadcast to all subscribers (chunked) ──────────────────────
const broadcastNotification = async ({ title, body, url, type = 'broadcast' }) => {
  const result = await pool.query('SELECT * FROM push_subscriptions');

  if (result.rows.length === 0) {
    throw new Error('No subscribers found.');
  }

  const payload = JSON.stringify({ title, body, url, type });
  const rows    = result.rows;
  const allResults = [];

  // ── Process in chunks to avoid slamming the push service ─────────
  for (let i = 0; i < rows.length; i += BROADCAST_CHUNK_SIZE) {
    const chunk   = rows.slice(i, i + BROADCAST_CHUNK_SIZE);
    const settled = await Promise.allSettled(chunk.map((row) => sendPush(row, payload)));
    allResults.push(...settled);

    // Brief pause between chunks (skip after the last one)
    if (i + BROADCAST_CHUNK_SIZE < rows.length) {
      await sleep(BROADCAST_CHUNK_DELAY);
    }
  }

  const summary = aggregateResults(allResults);
  await logNotification({ userId: null, type, title, body, url, status: 'broadcast' });

  return { total: rows.length, ...summary };
};

// ─── Notification History Queries ────────────────────────────────
const getNotificationHistory = async (userId, { limit = 20, offset = 0 } = {}) => {
  const result = await pool.query(
    `SELECT id, type, title, body, url, status, sent_at
     FROM notification_history
     WHERE user_id = $1
     ORDER BY sent_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

const getNotificationCount = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*) as total FROM notification_history WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].total, 10);
};

// ─── Budget Alerts (with deduplication) ──────────────────────────
/**
 * Fires at most once per user + category + month.
 * A sent_at timestamp in the budgets table (or a separate alerts table)
 * acts as the cooldown flag — no second push until the month rolls over.
 */
const checkBudgetAlerts = async (userId, categoryId, yearMonth) => {
  // 1. Fetch budget + category info
  const budgetQuery = await pool.query(
    `SELECT b.amount, b.alert_sent_at, c.name as category_name
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.user_id = $1 AND b.category_id = $2 AND b.month = $3`,
    [userId, categoryId, yearMonth]
  );

  if (budgetQuery.rows.length === 0) return null;

  const { amount: budgetLimit, category_name: categoryName, alert_sent_at } = budgetQuery.rows[0];

  // ── Deduplication: skip if we already alerted this month ─────────
  if (alert_sent_at) {
    const alertMonth = alert_sent_at.toISOString().slice(0, 7); // 'YYYY-MM'
    if (alertMonth === yearMonth) return null;
  }

  // 2. Sum expenses for this month and category
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

  // 3. Only fire when budget is exceeded
  if (totalSpent > parseFloat(budgetLimit)) {
    const overage = (totalSpent - parseFloat(budgetLimit)).toFixed(2);

    try {
      const notifyResult = await notifyUser(userId, {
        title: '⚠️ Budget Alert!',
        body:  `You've exceeded your "${categoryName}" budget by $${overage} this month.`,
        url:   '/budgets',
        type:  'budget_alert',
      });

      // ── Mark as alerted so we don't fire again this month ────────
      await pool.query(
        `UPDATE budgets SET alert_sent_at = NOW()
         WHERE user_id = $1 AND category_id = $2 AND month = $3`,
        [userId, categoryId, yearMonth]
      );

      return notifyResult;
    } catch (err) {
      console.error(`Failed to dispatch budget alert to user ${userId}:`, err);
    }
  }

  return null;
};

// ─── VAPID ───────────────────────────────────────────────────────
const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY;

// ─── Exports ─────────────────────────────────────────────────────
module.exports = {
  saveSubscription,
  removeSubscription,
  notifyUser,
  broadcastNotification,
  checkBudgetAlerts,
  getVapidPublicKey,
  // history
  getNotificationHistory,
  getNotificationCount,
  // preferences
  setUserPreference,
  getUserPreferences,
};