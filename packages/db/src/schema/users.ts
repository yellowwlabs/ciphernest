import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { baseColumns } from "./base";

export const users = pgTable("users", {
  ...baseColumns,
  privyId: text("privy_id").notNull().unique(),
  walletAddress: text("wallet_address"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});
