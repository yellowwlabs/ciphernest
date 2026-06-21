import pino from "pino";

// Standard serializers to keep logs clean and avoid logging large objects or sensitive headers
export const stdSerializers: {
  req: (request: unknown) => Record<string, unknown>;
  res: (reply: unknown) => Record<string, unknown>;
  err: (err: unknown) => Record<string, unknown>;
} = {
  req(request) {
    const req = request as Record<string, unknown> | null | undefined;
    return {
      method: req?.method,
      url: req?.url,
      hostname: req?.hostname,
      remoteAddress: req?.ip || req?.remoteAddress,
    };
  },
  res(reply) {
    const res = reply as Record<string, unknown> | null | undefined;
    return {
      statusCode: res?.statusCode,
    };
  },
  err: pino.stdSerializers.err as (err: unknown) => Record<string, unknown>,
};

// Standard list of paths to redact in logs to prevent secret leakages
// (e.g. passwords, authentication tokens, cookies, secrets, etc.)
export const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['x-api-key']",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "jwt",
  "authorization",
  "cookie",
  "*.password",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.secret",
  "*.jwt",
  "*.authorization",
  "*.cookie",
];

export interface LoggerConfig extends pino.LoggerOptions {
  name: string;
}

/**
 * Creates a configured Pino logger instance.
 * Output is formatted using pino-pretty in non-production environments
 * and structured JSON in production, with standard redactions applied.
 */
export const createLogger = (name: string, options?: pino.LoggerOptions) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Use pino-pretty for development console output
  const transport = !isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

  return pino({
    name,
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    redact: {
      paths: redactPaths,
      censor: "[REDACTED]",
    },
    serializers: stdSerializers,
    transport,
    ...options,
  });
};

// Create and export a default application-wide logger
export const logger = createLogger("app");
