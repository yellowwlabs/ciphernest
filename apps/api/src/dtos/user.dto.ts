import { z } from "zod";

export const syncUserSchema = z.object({
  email: z.string().email().optional().nullable(),
  walletAddress: z.string().optional().nullable(),
});

export type SyncUserDTO = z.infer<typeof syncUserSchema>;

export const userResponseSchema = z.object({
  id: z.uuid(),
  privyId: z.string(),
  walletAddress: z.string().nullable(),
  email: z.string().nullable(),
  createdAt: z.date(),
});

export type UserResponseDTO = z.infer<typeof userResponseSchema>;
