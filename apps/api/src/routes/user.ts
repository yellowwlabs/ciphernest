import type { FastifyInstance } from "fastify";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/@me",
    { preValidation: [authenticate] },
    userController.getMe.bind(userController),
  );
  app.post(
    "/auth/login",
    { preValidation: [authenticate] },
    userController.syncProfile.bind(userController),
  );
}
