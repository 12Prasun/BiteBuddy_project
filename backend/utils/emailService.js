// Email service utility using Nodemailer
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service not configured properly:', error);
  } else {
    console.log('Email service ready');
  }
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BiteBuddy <noreply@bitebuddy.com>',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send multiple emails
 * @param {Array} emails - Array of {to, subject, html}
 * @returns {Promise}
 */
const sendBatchEmails = async (emails) => {
  const results = await Promise.all(
    emails.map(email => sendEmail(email.to, email.subject, email.html))
  );
  return results;
};

module.exports = {
  sendEmail,
  sendBatchEmails,
  transporter
};
