import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config } from "./config";
import { createLogger } from "logger";

const isProduction = config.nodeEnv === "production";

const app = Fastify({
  loggerInstance: createLogger("api", { level: config.logLevel }),
  trustProxy: config.trustProxy || !isProduction,
});

app.register(helmet, {
  contentSecurityPolicy: isProduction ? undefined : false,
});

app.register(cors, {
  origin: isProduction ? config.allowedOrigins : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
});

app.get("/", async () => {
  return {
    status: "ok",
    message: "Server is running",
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  };
});

app.setErrorHandler((error: FastifyError, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  reply.status(statusCode).send({
    statusCode,
    error: error.name || "InternalServerError",
    message:
      isClientError || !isProduction
        ? error.message
        : "An unexpected error occurred",
  });
});

export default app;
