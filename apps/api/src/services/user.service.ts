import { db, users } from "db";
import { eq } from "drizzle-orm";
import type { SyncUserDTO } from "../dtos/user.dto";

export class UserService {
  async getOrCreateByPrivyId(privyId: string) {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyId));

    if (existingUsers.length === 0) {
      const [newUser] = await db.insert(users).values({ privyId }).returning();
      return newUser;
    }

    return existingUsers[0];
  }

  async syncUser(privyId: string, data: SyncUserDTO) {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyId));

    if (existingUsers.length === 0) {
      const [newUser] = await db
        .insert(users)
        .values({
          privyId,
          email: data.email || null,
          walletAddress: data.walletAddress || null,
        })
        .returning();
      return newUser;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        email: data.email || existingUsers[0].email,
        walletAddress: data.walletAddress || existingUsers[0].walletAddress,
      })
      .where(eq(users.privyId, privyId))
      .returning();

    return updatedUser;
  }
}

export const userService = new UserService();
