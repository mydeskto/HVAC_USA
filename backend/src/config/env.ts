import "dotenv/config";
import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL: booleanFromString,
  FRONTEND_ORIGINS: z.string().default("http://localhost:3000"),
  TRUST_PROXY: booleanFromString,
  SESSION_COOKIE_NAME: z.string().min(1).default("npl_admin_session"),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(24).default(24),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().optional(),
  UPLOAD_DIR: z.string().min(1).default("./uploads"),
  PUBLIC_MEDIA_BASE_URL: z.string().min(1).default("/uploads"),
  SPORTBEX_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment:", z.prettifyError(parsed.error));
  throw new Error("Backend environment validation failed");
}

export const env = {
  ...parsed.data,
  frontendOrigins: parsed.data.FRONTEND_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: parsed.data.NODE_ENV === "production",
  sessionTtlMs: parsed.data.SESSION_TTL_HOURS * 60 * 60 * 1000,
};
