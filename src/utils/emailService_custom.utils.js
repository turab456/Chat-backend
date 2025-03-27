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
export async function sendEmail(to, OTP_CODE) {
  // Calculate a static time string for the countdown timer (since JS doesn't run in emails)
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in milliseconds
  const expirationTimeString = expirationTime.toLocaleString(); // Readable format, e.g., "12/25/2025, 2:30:45 PM"

  const mailOptions = {
    from: `MASKAN LMS ${process.env.EMAIL_FROM}`, // Sender address (e.g., "Your Name <your_email@gmail.com>")
    to: to, // Recipient email address
    subject: "Email Verification - Your One-Time Password (OTP)", // Email subject
    text: "", // Plain text body
    html: `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Maskan LMS - Verify Your Email</title>
        <style>
          /* Global Styles */
          body, html {
            margin: 0;
            padding: 0;
            background: #000;
            font-family: Arial, sans-serif;
            color: #f0f0f0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            border-radius: 20px;
            background: linear-gradient(to bottom, #1a1a1a, #000);
            border: 1px solid #333;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          }
          h1 {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #00aaff;
            text-shadow: 0 0 10px #00aaff;
          }
          h2 {
            text-align: center;
            font-size: 24px;
            font-weight: normal;
            margin-bottom: 20px;
            color: #00aaff;
          }
          p {
            text-align: center;
            font-size: 16px;
            line-height: 1.6;
            margin: 15px 0;
            color: #ddd;
          }
          .otp {
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 6px;
            text-align: center;
            color: #00aaff;
            background: #333;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #00aaff;
            margin: 20px auto;
            max-width: 300px;
            text-shadow: 0 0 5px #00aaff;
          }
          .timer {
            text-align: center;
            font-size: 16px;
            color: #ff6666;
            margin-top: -10px;
          }
          .button {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 12px 0;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            color: #fff;
            background: linear-gradient(45deg, #00aaff, #0077cc);
            border-radius: 30px;
            border: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Maskan LMS</h1>
          <h2>Email Verification</h2>
          <p>Hello,</p>
          <p>Step into the future of education with Maskan LMS. Our state-of-the-art platform is engineered to deliver an unparalleled learning experience, seamlessly blending cutting-edge technology with intuitive design. To unlock your journey and secure your account, please verify your email address using the exclusive One-Time Password (OTP) provided below:</p>
          <div class="otp">${OTP_CODE}</div>
          <p class="timer">⏳ This OTP will expire at ${expirationTimeString}. Please use it before then.</p>
          <p>Should this verification request be unanticipated, we recommend disregarding this message or contacting our dedicated support team for immediate assistance.</p>
          <a class="button" href="https://maskanlms.com/support">Contact Support</a>
          <p>We are privileged to welcome you to the Maskan LMS community. Prepare to embark on a transformative educational odyssey unlike any other.</p>
        </div>
        <div class="footer">
          © 2025 Maskan Technologies Pvt Ltd. All rights reserved.
        </div>
      </body>
      </html>
    `,
    replyTo: "no-reply@maskanlms.com", // "No reply" address
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
