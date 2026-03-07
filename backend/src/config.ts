import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000,http://localhost:5173"),
  TRUST_PROXY: z.coerce.boolean().default(false),

  JWT_ACCESS_SECRET: z.string().min(16).default("change-this-access-secret-for-production"),
  JWT_REFRESH_SECRET: z.string().min(16).default("change-this-refresh-secret-for-production"),
  JWT_ISSUER: z.string().min(2).default("gigs-mtaani"),
  JWT_AUDIENCE: z.string().min(2).default("gigs-mtaani-clients"),
  ACCESS_TOKEN_TTL: z.string().default("10m"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),
  REMEMBER_ME_REFRESH_TTL: z.string().default("90d"),

  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().int().positive().default(15),
  REQUIRE_EMAIL_VERIFICATION: z.coerce.boolean().optional(),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  EMAIL_VERIFICATION_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(24),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(180),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AUTH_RATE_LIMIT_WINDOW: z.string().default("1 minute"),

  COOKIE_DOMAIN: z.string().optional().default(""),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),

  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_ANON_KEY: z.string().optional().default(""),
  SUPABASE_SERVICE_KEY: z.string().optional().default(""),

  EXTERNAL_API_KEYS: z.string().optional().default(""),
  WEBHOOK_SIGNING_SECRET: z.string().optional().default("")
});

const parsed = envSchema.parse(process.env);

export type AppConfig = z.infer<typeof envSchema> & {
  REQUIRE_EMAIL_VERIFICATION: boolean;
};

export const config: AppConfig = {
  ...parsed,
  REQUIRE_EMAIL_VERIFICATION: parsed.REQUIRE_EMAIL_VERIFICATION ?? parsed.NODE_ENV === "production"
};
