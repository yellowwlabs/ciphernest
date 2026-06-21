import type { FastifyReply, FastifyRequest } from "fastify";
import { syncUserSchema } from "../dtos/user.dto";
import { userService } from "../services/user.service";
import { BadRequestError } from "../utils/errors";

export class UserController {
  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const privyId = (request.user as { sub?: string })?.sub;
    if (!privyId) {
      throw new BadRequestError("Privy ID not found in token");
    }

    const user = await userService.getOrCreateByPrivyId(privyId);
    return reply.send(user);
  }

  async syncProfile(request: FastifyRequest, reply: FastifyReply) {
    const privyId = (request.user as { sub?: string })?.sub;
    if (!privyId) {
      throw new BadRequestError("Privy ID not found in token");
    }

    const parseResult = syncUserSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new BadRequestError(
        "Invalid request payload",
        "VALIDATION_ERROR",
        parseResult.error.format(),
      );
    }

    const user = await userService.syncUser(privyId, parseResult.data);
    return reply.send(user);
  }
}

export const userController = new UserController();
