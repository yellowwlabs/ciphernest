import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || "0.0.0.0",
  logLevel: process.env.LOG_LEVEL || "info",
  trustProxy: process.env.TRUST_PROXY === "true",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim()),
};
