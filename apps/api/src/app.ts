import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import Fastify, {
  type FastifyInstance,
  type FastifyBaseLogger,
} from "fastify";
import { createLogger } from "logger";
import { config } from "./config";
import { errorHandler } from "./middlewares/error.middleware";
import { userRoutes } from "./routes/user";

const isProduction = config.nodeEnv === "production";

const app: FastifyInstance = Fastify({
  loggerInstance: createLogger("api", { level: config.logLevel }) as unknown as FastifyBaseLogger,
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

if (config.privyPublicKey) {
  app.register(fastifyJwt, {
    secret: config.privyPublicKey,
    verify: {
      algorithms: ["RS256"],
    },
  });
} else {
  app.log.warn(
    "⚠️ PRIVY_PUBLIC_KEY is not defined. Using fallback secret for development.",
  );
  app.register(fastifyJwt, {
    secret: "fallback-secret-for-dev",
  });
}

app.get("/health", async () => {
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

app.register(userRoutes);

app.setErrorHandler(errorHandler);

export default app;
