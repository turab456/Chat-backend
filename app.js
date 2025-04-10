import "./module_alias.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import requestLogger from "./src/middlewares/requestLogger.middleware.js";
import helmetMiddleware from "./src/middlewares/helmet.Middleware.js";
import errorLogger from "./src/middlewares/errorLogger.middleware.js";
import limiter from "./src/middlewares/rateLimiter.middleware.js";

const app = express();

app.use(
  cors({
    origin: 'http://localhost:8080',
    credentials: true,
  })
); // middleware

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
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

// import adminRouter from "./src/routes/admin/admin.routes.js";
// import commonRouter from "./src/routes/common/common.routes.js";
import superadminRouter from "./src/routes/super_admin/super_admin.routes.js";
import showuserRouter from './src/routes/show_users/show_user.route.js'
import {
  ADMIN_BASE_URL,
  COMMON_BASE_URL,
  SUPER_ADMIN_URL,
  APP_URL
} from "./src/constants.js";

// put the routes here
// app.use(ADMIN_BASE_URL, adminRouter);
// app.use(COMMON_BASE_URL, commonRouter);
app.use(SUPER_ADMIN_URL, superadminRouter);
app.use(APP_URL, showuserRouter);

// Error logger middleware (should be after all other middlewares and routes)
app.use(errorLogger);

export default app;
