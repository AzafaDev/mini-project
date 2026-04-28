import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./modules/auth/auth.route";
import eventRouter from "./modules/events/event.route";
import voucherRouter from "./modules/events/voucher.route";
import couponRouter from "./modules/events/coupon.route";
import reviewRouter from "./modules/events/review.route";
import pointsRouter from "./modules/points/points.route";
import transactionRouter from "./modules/transaction/transaction.route";
import { errorHandler } from "./middleware/errorHandler";
import { startCronJobs } from "./utils/cronJobs";
import { validateEnv } from "./config/envValidator";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 8000;

// Urutan middleware sangat penting! Diurutkan dari yang paling umum ke spesifik
// CORS harus paling awal agar semua request melewati pengecekan CORS terlebih dahulu
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// Cookie parser harus sebelum middleware yang butuh akses cookie
app.use(cookieParser());

// File upload handler harus sebelum body parser agar file tidak terganggu
const tempFileDir = process.env.NODE_ENV === "production"
  ? os.tmpdir()
  : path.join(process.cwd(), "temp");

if (!fs.existsSync(tempFileDir)) {
  fs.mkdirSync(tempFileDir, { recursive: true });
}

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir,
  }),
);

// Body parser harus sebelum route agar request body tersedia di controller
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Urutan route: diurutkan berdasarkan dependensi
app.use("/api/auth", authRouter);
// Voucher harus sebelum event route karena menggunakan prefix yang sama
app.use("/api/events", voucherRouter);
app.use("/api/events", eventRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/points", pointsRouter);
app.use("/api/transactions", transactionRouter);

// Error handler HARUS berada di paling akhir setelah SEMUA route dan middleware
// Ini akan menangkap semua error yang dilempar dari route dan middleware
app.use(errorHandler);

// Menjalankan semua cron job otomatis (pembersihan poin expired, dll)
startCronJobs();

// Menjalankan server pada port yang ditentukan
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}

// Export untuk Vercel serverless function
export default app;
