const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Taskify <noreply@taskify.com>',
    to: email,
    subject: 'Your Taskify Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0f0f23; color: #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #818cf8; margin: 0;">Taskify</h1>
          <p style="color: #94a3b8; margin-top: 8px;">Your intelligent productivity companion</p>
        </div>
        <div style="background: #1e1b4b; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #312e81;">
          <p style="color: #c7d2fe; margin: 0 0 16px;">Your verification code is:</p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #a5b4fc; margin: 16px 0;">${otp}</div>
          <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 0;">This code expires in 10 minutes</p>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    // In development, log the OTP for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }
    return false;
  }
};

const sendReminderEmail = async (email, task) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Taskify <noreply@taskify.com>',
    to: email,
    subject: `⏰ Reminder: "${task.title}" is due soon`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0f0f23; color: #e2e8f0; border-radius: 16px;">
        <h1 style="color: #818cf8; text-align: center;">Taskify Reminder</h1>
        <div style="background: #1e1b4b; border-radius: 12px; padding: 24px; border: 1px solid #312e81;">
          <h2 style="color: #a5b4fc; margin: 0 0 8px;">${task.title}</h2>
          <p style="color: #94a3b8;">${task.description || 'No description'}</p>
          <p style="color: #fbbf24; font-weight: 600;">Deadline: ${new Date(task.deadline).toLocaleString()}</p>
        </div>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
  } catch (error) {
    console.error('Reminder email error:', error.message);
  }
};

const sendDailySummaryEmail = async (email, summary) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Taskify <noreply@taskify.com>',
    to: email,
    subject: '📋 Your Daily Taskify Summary',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0f0f23; color: #e2e8f0; border-radius: 16px;">
        <h1 style="color: #818cf8; text-align: center;">Daily Summary</h1>
        <div style="background: #1e1b4b; border-radius: 12px; padding: 24px; border: 1px solid #312e81;">
          <p style="color: #a5b4fc;">📌 Pending Tasks: <strong>${summary.pendingCount}</strong></p>
          <p style="color: #f87171;">⚠️ Overdue Tasks: <strong>${summary.overdueCount}</strong></p>
          <p style="color: #34d399;">✅ Completed Yesterday: <strong>${summary.completedYesterday}</strong></p>
          <p style="color: #fbbf24;">🔥 Current Streak: <strong>${summary.streak} days</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
  } catch (error) {
    console.error('Daily summary email error:', error.message);
  }
};

module.exports = { sendOtpEmail, sendReminderEmail, sendDailySummaryEmail };
