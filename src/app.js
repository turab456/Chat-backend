import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import validateAndSanitize from "./middlewares/validateAndSanitize.middleware.js";
import helmetMiddleware from "./middlewares/helmet.Middleware.js";
import errorLogger from "./middlewares/errorLogger.middleware.js";
import limiter from "./middlewares/rateLimiter.middleware.js";
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
app.use(validateAndSanitize); // Middleware to validate and sanitize query parameters for the API
// Middleware for logging requests

// Handle CSP Violation Reports
app.post("/report-violation", express.json(), (req, res) => {
  console.log("CSP Violation:", req.body); // Log or store the violation report
  res.status(204).end(); // Respond with HTTP 204 (No Content)
});

// Use the custom Helmet middleware globally
app.use(helmetMiddleware);

import adminRouter from "./routes/admin/admin.routes.js";
import commonRouter from "./routes/common/common.routes.js";
import { ADMIN_BASE_URL, COMMON_BASE_URL } from "./constants.js";

// put the routes here
app.use(ADMIN_BASE_URL,adminRouter)
app.use(COMMON_BASE_URL,commonRouter)


// Error logger middleware (should be after all other middlewares and routes)
app.use(errorLogger);

export { app };
