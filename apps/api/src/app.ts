import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { config } from "./config";

const isProduction = config.env === "production";

const app = Fastify({
  logger: {
    level: config.logLevel,
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
    env: config.env,
    timestamp: new Date().toISOString(),
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
