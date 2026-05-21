const nodemailer = require('nodemailer');

const { config } = require('../../config/index.config');
const { logger } = require('../../config/logger.config');

const {
  wasAlertSentToday,
  markAlertSentToday,
} = require('../../config/redis.config');

const { ALERT_THRESHOLDS } = require('../../shared/constants');

const {
  getBudgetForCategoryMonth,
} = require('../budgets/budget.service');

const { getUserById } = require('../users/users.repository');

// ── Email Transporter ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

// ── Main Alert Logic ───────────────────────────────────────────────
async function checkBudgetAlerts(userId, categoryId, yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);

  const budget = await getBudgetForCategoryMonth(
    userId,
    categoryId,
    month,
    year
  );

  if (!budget) return;

  const percent = budget.percentUsed / 100;

  for (const threshold of ALERT_THRESHOLDS) {
    if (percent >= threshold) {
      const alertType = `budget:${budget.id}:${threshold}`;

      const alreadySent = await wasAlertSentToday(userId, alertType);
      if (alreadySent) continue;

      const user = await getUserById(userId);
      if (!user || !user.email) continue;

      const label =
        threshold >= 1
          ? 'exceeded'
          : `${Math.round(threshold * 100)}% used`;

      const subject =
        threshold >= 1
          ? `🚨 Budget exceeded: ${budget.categoryName}`
          : `⚠️ Budget alert: ${budget.categoryName} is ${label}`;

      await sendEmail({
        to: user.email,
        subject,
        html: buildAlertEmail({
          name: user.name,
          categoryName: budget.categoryName,
          categoryIcon: budget.categoryIcon,
          amountLimit: budget.amountLimit,
          spent: budget.spent,
          percentUsed: budget.percentUsed,
          currency: budget.currency,
          label,
        }),
      });

      await markAlertSentToday(userId, alertType);

      logger.info(
        { userId, categoryId, threshold },
        'Budget alert sent'
      );
    }
  }
}

// ── Email Sender ───────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to send email');
  }
}

// ── Email Template ───────────────────────────────────────────────
function buildAlertEmail(data) {
  const pct = Math.min(Math.round(data.percentUsed), 100);
  const color = pct >= 100 ? '#ef4444' : '#f59e0b';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #f9fafb;
    margin: 0;
    padding: 20px;
  }
  .card {
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    max-width: 480px;
    margin: 0 auto;
    box-shadow: 0 2px 8px rgba(0,0,0,.08);
  }
  .icon { font-size: 40px; }
  h1 {
    font-size: 22px;
    color: #111827;
    margin: 16px 0 4px;
  }
  .bar-bg {
    background: #e5e7eb;
    border-radius: 99px;
    height: 10px;
    margin: 20px 0;
  }
  .bar-fill {
    height: 10px;
    border-radius: 99px;
    background: ${color};
    width: ${pct}%;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #6b7280;
  }
  .footer {
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 24px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">${data.categoryIcon}</div>
    <h1>Budget ${data.label}</h1>
    <p style="color:#6b7280">
      Hi ${data.name}, your <strong>${data.categoryName}</strong> budget is ${data.label} this month.
    </p>

    <div class="bar-bg">
      <div class="bar-fill"></div>
    </div>

    <div class="meta">
      <span>Spent: <strong>${data.currency} ${data.spent.toFixed(2)}</strong></span>
      <span>Limit: <strong>${data.currency} ${data.amountLimit.toFixed(2)}</strong></span>
    </div>

    <div class="footer">
      Budget Manager · You can manage your alerts in settings.
    </div>
  </div>
</body>
</html>`;
}

// ── exports ───────────────────────────────────────────────
module.exports = {
  checkBudgetAlerts,
};