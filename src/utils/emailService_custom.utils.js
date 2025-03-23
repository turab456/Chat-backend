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
  const mailOptions = {
    from: `MASKAN LMS ${process.env.EMAIL_FROM}`, // Sender address (e.g., "Your Name <your_email@gmail.com>")
    to: to, // Recipient email address
    subject: "Email Verification - Your One-Time Password (OTP)", // Email subject
    text: "", // Plain text body
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Maskan LMS - Verify Your Email</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    /* Global Styles */
    body, html {
      margin: 0;
      padding: 0;
      background: #000; /* Black background */
      font-family: 'Roboto', sans-serif;
      color: #f0f0f0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.4); /* Dark translucent */
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow:  20px 20px 60px rgba(0, 0, 0, 0.9),
                   -20px -20px 60px rgba(255, 255, 255, 0.1);
    }
    h1 {
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 5px;
      color: #a2d2ff;
    }
    h2 {
      text-align: center;
      font-size: 24px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #a2d2ff;
    }
    p {
      text-align: center;
      font-size: 16px;
      line-height: 1.6;
      margin: 15px 0;
      color: #ddd;
    }
    /* Elevated Neumorphic Glass Effect for OTP */
    .otp {
      margin: 20px auto;
      padding: 20px 25px;
      max-width: 300px;
      border-radius: 15px;
      font-size: 48px;
      font-weight: 700;
      letter-spacing: 6px;
      text-align: center;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 
        inset 6px 6px 12px rgba(0, 0, 0, 0.8),
        inset -6px -6px 12px rgba(255, 255, 255, 0.1),
        6px 6px 12px rgba(0, 0, 0, 0.9),
        -6px -6px 12px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
    .button {
      display: block;
      width: 200px;
      margin: 30px auto;
      padding: 12px 0;
      text-align: center;
      text-decoration: none;
      font-weight: 700;
      color: #a2d2ff;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow:  6px 6px 12px rgba(0, 0, 0, 0.9),
                   -6px -6px 12px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      transition: all 0.2s ease;
    }
    .button:hover {
      box-shadow: inset 6px 6px 12px rgba(0, 0, 0, 0.9),
                  inset -6px -6px 12px rgba(255, 255, 255, 0.1);
      color: #7bbcff;
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
    <p>Welcome to Maskan LMS – where cutting-edge technology meets seamless learning. To complete your registration, please use the OTP below to verify your email address:</p>
    <div class="otp">${OTP_CODE}</div>
    <p>This OTP is valid for 10 minutes. If you did not request this verification, please ignore this email or contact support.</p>
    <a class="button" href="https://maskanlms.com/support">Contact Support</a>
    <p>Thank you for choosing Maskan LMS. Elevate your learning experience with us!</p>
  </div>
  <div class="footer">
    &copy; 2025 Maskan Technologies Pvt Ltd. All rights reserved.
  </div>
</body>
</html>
`,
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
