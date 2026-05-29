// mailer.config.js

const nodemailer = require('nodemailer');
const { config } = require('./index.config');

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"WealthFlow" <${config.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `
      <p>Click the link below to verify your email. It expires in 24 hours.</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
  });
}

async function sendPasswordResetEmail(email, code) {
  await transporter.sendMail({
    from: `"WealthFlow" <${config.SMTP_USER}>`,
    to: email,
    subject: 'Your password reset code',
    html: `
      <p>Your password reset code is:</p>
      <h2 style="letter-spacing: 8px;">${code}</h2>
      <p>This code expires in 15 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
}

module.exports = { 
  sendVerificationEmail,
  sendPasswordResetEmail,   // ← add this
};
