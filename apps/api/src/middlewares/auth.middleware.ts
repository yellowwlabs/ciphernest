import type { FastifyRequest, FastifyReply } from "fastify";
import { UnauthorizedError } from "../utils/errors";

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (_err) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
