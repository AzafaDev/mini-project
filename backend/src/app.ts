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

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
//
app.use("/api/events", voucherRouter);

app.use("/api/events", eventRouter);

app.use("/api/reviews", reviewRouter);

app.use("/api/points", pointsRouter);

app.use("/api/transactions", transactionRouter);

app.use(errorHandler);

startCronJobs();

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});