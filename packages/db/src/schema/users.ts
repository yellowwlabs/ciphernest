import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  privyId: text("privy_id").notNull().unique(),
  walletAddress: text("wallet_address"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});
