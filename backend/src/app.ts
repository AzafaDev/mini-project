import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "node:path";
import cookieParser from "cookie-parser";

import authRouter from "./modules/auth/auth.route";
import eventRouter from "./modules/events/event.route";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Apply global rate limiter (disabled for testing)
// app.use("/api/", apiLimiter);

app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);

// Error handler must be registered after all routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
