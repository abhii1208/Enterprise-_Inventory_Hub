import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import routes from "./routes/index.js";

export const app = express();
app.set("trust proxy", 1);

const configuredOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        allowedOrigins.has(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Inventory Hub API is running",
    data: {
      health: "/api/health",
      apiBase: "/api"
    }
  });
});
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok"
    }
  });
});
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);
