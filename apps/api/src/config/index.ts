import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.string().default("info"),
  TRUST_PROXY: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .default(false),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((str) => str.split(",").map((s) => s.trim())),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
