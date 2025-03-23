// Load environment variables from a .env file (for development)
import nodemailer from "nodemailer";
// Check for required environment variables to prevent runtime errors
const requiredEnvVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Create a reusable transporter object for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT, // e.g., 587 for TLS, 465 for SSL
  secure: process.env.SMTP_SECURE === "true", // true for port 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER, // SMTP username (e.g., your email)
    pass: process.env.SMTP_PASS, // SMTP password or app-specific password
  },
  tls: {
    // Ensure certificate verification for security (optional customization)
    rejectUnauthorized: true,
  },
});

// Function to send an email
// export async function sendEmail(to, subject, text, OTP_CODE) {
export async function sendEmail(to,OTP_CODE) {
  const mailOptions = {
    from: `MASKAN LMS ${process.env.EMAIL_FROM}`, // Sender address (e.g., "Your Name <your_email@gmail.com>")
    to: to, // Recipient email address
    subject: 'Email Verification - Your One-Time Password (OTP)', // Email subject
    text: '', // Plain text body
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    h2 {
      color: #0275d8;
      text-align: center;
    }
    p {
      line-height: 1.5;
    }
    .otp {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 4px;
      text-align: center;
      margin: 20px 0;
      color: #333;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Email Verification</h2>
    <p>Dear User,</p>
    <p>Thank you for registering with us. Please use the following One-Time Password (OTP) to verify your email address:</p>
    <div class="otp">${OTP_CODE}</div>
    <p>This OTP is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
    <p>Best regards,<br>Your Company Team</p>
  </div>
  <div class="footer">
    &copy; 2025 Your Company. All rights reserved.
  </div>
</body>
</html>
`, // HTML body (optional)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error; // Allow the caller to handle the error
  }
}

// // Example usage
// (async () => {
//   try {
//     await sendEmail(
//       'recipient@example.com',
//       'Test Email',
//       'This is a test email sent using Nodemailer.',
//       '<p>This is a <b>test email</b> sent using Nodemailer.</p>'
//     );
//   } catch (error) {
//     console.error('Failed to send email:', error);
//   }
// })();
