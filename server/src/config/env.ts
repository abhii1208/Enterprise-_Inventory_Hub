import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const derivedSmtpUser = process.env.SMTP_USER ?? process.env.EMAIL_USER;
const derivedSmtpPass = process.env.SMTP_PASS ?? process.env.EMAIL_PASS;
const derivedSmtpFrom =
  process.env.SMTP_FROM ?? (derivedSmtpUser ? `Inventory Hub <${derivedSmtpUser}>` : undefined);

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  CORS_ORIGIN: z.string().url(),
  COOKIE_NAME: z.string().default("inventory_hub_session"),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional()
});

export const env = envSchema.parse({
  ...process.env,
  SMTP_USER: derivedSmtpUser,
  SMTP_PASS: derivedSmtpPass,
  SMTP_FROM: derivedSmtpFrom
});
export const isProduction = env.NODE_ENV === "production";
