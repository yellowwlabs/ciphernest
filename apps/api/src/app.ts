import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import { db, users } from "db";
import { eq } from "drizzle-orm";
import { config } from "./config";
import { createLogger } from "logger";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

const isProduction = config.nodeEnv === "production";

const app: FastifyInstance<any, any, any, any> = Fastify({
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

app.decorate("authenticate", async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply
      .status(401)
      .send({ error: "Unauthorized", message: "Invalid or expired token" });
  }
});

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

app.get(
  "/me",
  { preValidation: [app.authenticate] },
  async (request: any, reply: any) => {
    const privyId = request.user?.sub;
    if (!privyId) {
      return reply
        .status(400)
        .send({ error: "Bad Request", message: "Privy ID not found in token" });
    }

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyId));
    if (existingUsers.length === 0) {
      const [newUser] = await db.insert(users).values({ privyId }).returning();
      return newUser;
    }

    return existingUsers[0];
  },
);

app.post(
  "/auth/login",
  { preValidation: [app.authenticate] },
  async (request: any, reply: any) => {
    const privyId = request.user?.sub;
    if (!privyId) {
      return reply
        .status(400)
        .send({ error: "Bad Request", message: "Privy ID not found in token" });
    }

    const { email, walletAddress } = request.body as {
      email?: string;
      walletAddress?: string;
    };
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyId));

    if (existingUsers.length === 0) {
      const [newUser] = await db
        .insert(users)
        .values({
          privyId,
          email: email || null,
          walletAddress: walletAddress || null,
        })
        .returning();
      return newUser;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        email: email || existingUsers[0].email,
        walletAddress: walletAddress || existingUsers[0].walletAddress,
      })
      .where(eq(users.privyId, privyId))
      .returning();

    return updatedUser;
  },
);

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
