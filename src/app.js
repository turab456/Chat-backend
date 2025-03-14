import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import helmetMiddleware from "./middlewares/helmet.Middleware.js";
import errorLogger from "./middlewares/errorLogger.middleware.js";
import limiter from "./middlewares/rateLimiter.middleware.js";
import { sendEmail } from "./utils/emailService.utils.js";
import { sendOtp } from "./utils/mobileotpservice.utils.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
  })
); // middleware

app.use(express.json({limit : "20kb"}));
app.use(express.urlencoded({extended : true , limit : "20kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(requestLogger);
app.use(limiter); // Enhance security by adding request rate capping for APIs
// Middleware for logging requests

// Handle CSP Violation Reports
app.post("/report-violation", express.json(), (req, res) => {
  console.log("CSP Violation:", req.body); // Log or store the violation report
  res.status(204).end(); // Respond with HTTP 204 (No Content)
});

// Use the custom Helmet middleware globally
app.use(helmetMiddleware);

// const sendOtp = async () => {
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

//   try {
//     const response = await sendEmail({
//       to: 'sufiturabhussain@gmail.com',
//       subject: 'Your OTP Code for Login',
//       text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
//       html: `
//         <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 400px;">
//           <h2 style="color: #4CAF50; text-align: center;">Your OTP Code</h2>
//           <p style="font-size: 16px;">Hello,</p>
//           <p style="font-size: 16px;">Use the following OTP to complete your login:</p>
//           <div style="font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p style="font-size: 16px;">This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
//           <p style="font-size: 14px; color: #999; text-align: center;">
//             If you did not request this, please ignore this email.
//           </p>
//         </div>
//       `,
//     });

//     console.log('✅ OTP email sent:', response);
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   }
// };

// sendOtp()

const run = async () => {
  try {
    const toMobile = '+919899211238'; // Replace with a valid phone number
    const result = await sendOtp(toMobile);
    console.log(`✅ OTP Sent Successfully: ${result.otp}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
};

run()
import adminRouter from "./routes/admin/admin.routes.js";
import commonRouter from "./routes/common/common.routes.js";
import { ADMIN_BASE_URL, COMMON_BASE_URL } from "./constants.js";

// put the routes here
app.use(ADMIN_BASE_URL,adminRouter)
app.use(COMMON_BASE_URL,commonRouter)


// Error logger middleware (should be after all other middlewares and routes)
app.use(errorLogger);

export default app ;
