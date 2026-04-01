import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

import authRoute from "./modules/auth/auth.route";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
    createParentPath: true,
  }),
);

// Debug middleware to log cookies
app.use((req, res, next) => {
  console.log("[APP] Cookies:", req.cookies);
  console.log("[APP] Raw Cookie Header:", req.headers.cookie);
  next();
});

// Routes
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
