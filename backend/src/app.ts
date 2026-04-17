import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./modules/auth/auth.route";
import eventRouter from "./modules/events/event.route";
import voucherRouter from "./modules/events/voucher.route";
import reviewRouter from "./modules/events/review.route";
import pointsRouter from "./modules/points/points.route";
import transactionRouter from "./modules/transaction/transaction.route";
import { errorHandler } from "./middleware/errorHandler";
import { startCronJobs } from "./utils/cronJobs";

dotenv.config();

console.log(
  "[DEBUG App] Starting application, NODE_ENV:",
  process.env.NODE_ENV,
);

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

console.log("[DEBUG App] PORT:", PORT);
console.log("[DEBUG App] FRONTEND_URL:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);
console.log("[DEBUG App] CORS middleware applied");

app.use(cookieParser());
console.log("[DEBUG App] Cookie parser middleware applied");

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
  }),
);
console.log("[DEBUG App] File upload middleware applied");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
console.log("[DEBUG App] Body parser middlewares applied");

// Apply global rate limiter (disabled for testing)
// app.use("/api/", apiLimiter);

console.log("[DEBUG App] Registering routers...");

app.use("/api/auth", authRouter);
console.log("[DEBUG App] /api/auth router mounted");

app.use("/api/events", voucherRouter);
console.log("[DEBUG App] /api/events voucher router mounted");

app.use("/api/events", eventRouter);
console.log("[DEBUG App] /api/events router mounted");

app.use("/api/reviews", reviewRouter);
console.log("[DEBUG App] /api/reviews router mounted");

app.use("/api/points", pointsRouter);
console.log("[DEBUG App] /api/points router mounted");

app.use("/api/transactions", transactionRouter);
console.log("[DEBUG App] /api/transactions router mounted");

// Error handler must be registered after all routes
app.use(errorHandler);
console.log("[DEBUG App] Error handler middleware applied");

// Start cron jobs
startCronJobs();
console.log("[DEBUG App] Cron jobs started");

app.listen(PORT, () => {
  console.log(`[DEBUG App] Server is running on port: ${PORT}`);
});
