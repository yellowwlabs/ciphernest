import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

// Create the Fastify instance with highly optimized Pino logger configurations
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
    },
  },
  // Enable trustProxy in production if deploying behind a reverse proxy (Nginx, ALB, Cloudflare, etc.)
  trustProxy: process.env.TRUST_PROXY === "true" || !isProduction,
});

// Configure Helmet for secure HTTP headers
app.register(helmet, {
  contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev for easier tool/playground integration
});

// Configure CORS dynamically based on environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"]; // Next.js default port

app.register(cors, {
  origin: isProduction ? allowedOrigins : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
});

// Base health check route
app.get("/", async () => {
  return {
    status: "ok",
    env,
    timestamp: new Date().toISOString(),
  };
});

// Standardized Error Handler
app.setErrorHandler((error: FastifyError, request, reply) => {
  // Automatically logs the error details using Fastify's optimized logger
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
