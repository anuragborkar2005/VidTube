import express from "express";
import cors from "cors";
import healthCheckRouter from "./routes/health.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

//common middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/user", userRouter);

app.use(errorHandler);
export { app };
