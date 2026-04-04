import dotenv from "dotenv";
dotenv.config(); // ✅ Must run before process.env is read

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import healthcheckRouter from "./src/routes/healthcheck.route.js";
import userRouter from "./src/routes/user.routes.js";
import jobRouter from "./src/routes/job.routes.js";
import applicationRouter from "./src/routes/application.route.js";
import authRouter from "./src/routes/auth.route.js";

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/health-check", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
