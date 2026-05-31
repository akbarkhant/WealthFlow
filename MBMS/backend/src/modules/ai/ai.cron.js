const cron = require('node-cron');
const { generateInsightsSummary } = require('./ai.insights');
const { getWeeklyTransactions, getAllUsersWithEmail } = require('../reports/reports.repository');
const { sendWeeklyInsightsEmail } = require('../../config/mailer.config');
const { logger } = require('../../config/logger.config');

function getDateRange(weeksAgo = 0) {
  const now   = new Date();
  const day   = now.getDay(); // 0 = Sunday
  const diffToMonday = (day === 0 ? -6 : 1 - day);

  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() + diffToMonday - weeksAgo * 7);
  thisMonday.setHours(0, 0, 0, 0);

  const thisSunday = new Date(thisMonday);
  thisSunday.setDate(thisMonday.getDate() + 6);
  thisSunday.setHours(23, 59, 59, 999);

  return {
    start: thisMonday.toISOString().split('T')[0],
    end:   thisSunday.toISOString().split('T')[0],
  };
}

async function runWeeklyInsights() {
  logger.info('Running weekly AI insights job...');

  try {
    const users = await getAllUsersWithEmail();

    for (const user of users) {
      try {
        const thisWeekRange = getDateRange(0); // current week
        const lastWeekRange = getDateRange(1); // previous week

        const [thisWeek, lastWeek] = await Promise.all([
          getWeeklyTransactions(user.id, thisWeekRange.start, thisWeekRange.end),
          getWeeklyTransactions(user.id, lastWeekRange.start, lastWeekRange.end),
        ]);

        // Skip if no transactions at all
        if (thisWeek.length === 0 && lastWeek.length === 0) {
          logger.info(`No transactions for user ${user.id}, skipping.`);
          continue;
        }

        const insights = await generateInsightsSummary({ user, thisWeek, lastWeek });

        await sendWeeklyInsightsEmail(user.email, user.name, insights);

        logger.info(`Weekly insights sent to ${user.email}`);

        // Small delay between users to avoid overwhelming Ollama
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err) {
        logger.error({ err, userId: user.id }, `Failed insights for user ${user.id}`);
      }
    }

    logger.info('Weekly AI insights job complete.');
  } catch (err) {
    logger.error({ err }, 'Weekly insights job failed.');
  }
}

// ── Schedule: every Monday at 9:00am ─────────────────────
function startInsightsCron() {
  cron.schedule('0 9 * * 1', runWeeklyInsights, {
    timezone: 'Asia/Karachi', // ← your timezone
  });

  logger.info('Weekly insights cron scheduled — runs every Monday at 9am');
}

module.exports = { startInsightsCron, runWeeklyInsights };