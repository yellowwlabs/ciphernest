import { type FastifyInstance } from "fastify";
import { db, users } from "db";
import { eq } from "drizzle-orm";

export async function userRoutes(app: FastifyInstance) {
  const meHandler = async (request: any, reply: any) => {
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
  };

  app.get("/me", { preValidation: [app.authenticate] }, meHandler);
  app.get("/@me", { preValidation: [app.authenticate] }, meHandler);

  app.post(
    "/auth/login",
    { preValidation: [app.authenticate] },
    async (request: any, reply: any) => {
      const privyId = request.user?.sub;
      if (!privyId) {
        return reply
          .status(400)
          .send({
            error: "Bad Request",
            message: "Privy ID not found in token",
          });
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
}
