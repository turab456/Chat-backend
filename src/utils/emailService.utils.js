import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid';
import { validationResult } from 'express-validator';
import { emailValidationSchema } from '../validations/common/email/emailService.validation.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SENDGRID_API_KEY', 'EMAIL_FROM'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const transporter = nodemailer.createTransport(
  sgTransport({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

/**
 * Validates email input using express-validator
 * @param {Object} data - Email data (to, subject, text, html)
 * @throws {Error} If validation fails
 */
const validateEmailInput = async (data) => {
  // Validate input data using schema
  await Promise.all(
    emailValidationSchema.map((rule) => rule.run({ body: data }))
  );

  const errors = validationResult({ body: data });
  if (!errors.isEmpty()) {
    console.error(`❌ Validation failed:`, errors.array());
    throw new Error(JSON.stringify(errors.array()));
  }
};

/**
 * Sends an email using Nodemailer and SendGrid.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @returns {Promise<Object>} - Success object or error
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  // Step 1: Validate input
  await validateEmailInput({ to, subject, text, html });

  // Step 2: Prepare email data
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    // Step 3: Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}: ${error.message}`);
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
};
