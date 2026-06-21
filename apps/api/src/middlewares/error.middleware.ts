import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../utils/errors";
import { config } from "config";

const isProduction = config.nodeEnv === "production";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  const statusCode = error.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  return reply.status(statusCode).send({
    statusCode,
    error: error.name || "InternalServerError",
    message:
      isClientError || !isProduction
        ? error.message
        : "An unexpected error occurred",
  });
}
