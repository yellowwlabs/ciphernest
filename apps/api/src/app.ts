import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import buildGetJwks from "get-jwks";
import Fastify, {
  type FastifyInstance,
  type FastifyBaseLogger,
  type FastifyRequest,
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

if (config.privyAppId) {
  const getJwks = buildGetJwks();
  app.register(fastifyJwt, {
    decode: { complete: true },
    secret: async (
      _request: FastifyRequest,
      tokenOrHeader: {
        header?: { alg?: string; kid?: string };
        alg?: string;
        kid?: string;
      },
    ) => {
      const header = tokenOrHeader?.header || tokenOrHeader;
      const kid = header?.kid;
      const alg = header?.alg;
      if (!kid) {
        throw new Error("Invalid token headers");
      }
      return getJwks.getPublicKey({
        domain: `https://auth.privy.io/api/v1/apps/${config.privyAppId}/`,
        alg,
        kid,
      });
    },
    verify: {
      algorithms: ["ES256", "RS256"],
    },
  });
} else if (config.privyPublicKey) {
  app.register(fastifyJwt, {
    secret: config.privyPublicKey,
    verify: {
      algorithms: ["RS256"],
    },
  });
} else {
  app.log.warn(
    "⚠️ PRIVY_APP_ID and PRIVY_PUBLIC_KEY are not defined. Using fallback secret for development.",
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
