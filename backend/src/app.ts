
import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import compress from "@fastify/compress";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import { config } from "./config.js";
import {
  createGigSchema,
  feedQuerySchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sosSchema,
  topupSchema,
  verifyEmailSchema
} from "./lib/schemas.js";
import { sanitizeUnknown } from "./lib/sanitize.js";
import {
  hashIpAndAgent,
  hashPassword,
  randomToken,
  redactPII,
  sha256,
  verifyPassword,
  verifyWebhookSignature
} from "./lib/security.js";
import {
  findUserById as findUserByIdSupabase,
  findUserByIdentifier as findUserByIdentifierSupabase,
  isSupabaseEnabled,
  logActivity,
  pingSupabase,
  type PersistedUser,
  upsertUser
} from "./lib/supabase.js";

type UserRole = "STUDENT" | "ADMIN";
type UserStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "DELETED";
type UserRecord = {
  id: string;
  campusEmail: string;
  phoneE164: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  campusId: string;
  createdAt: string;
  updatedAt: string;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lockoutUntilMs: number | null;
  emailVerifiedAt: string | null;
};
type SessionUser = {
  id: string;
  campusEmail: string;
  phoneE164: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  campusId: string;
  profile: {
    displayName: string;
    bio: string;
    campusId: string;
    skills: string[];
    ratingAvg: number;
    ratingCount: number;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
};
type RefreshTokenRecord = {
  id: string;
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAtMs: number;
  revoked: boolean;
  replacedByTokenHash: string | null;
};
type GigRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  payAmount: number;
  currency: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startsAt: string;
  status: "OPEN" | "COMPLETED";
  posterId: string;
  createdAt: string;
};
type ChatMessageRecord = {
  id: string;
  threadId: string;
  senderId: string;
  ciphertext: string;
  nonce: string;
  ratchetHeader: string;
  senderKeyId: string;
  createdAt: string;
};
type WalletRecord = {
  id: string;
  currency: string;
  available: number;
  pending: number;
  ledgerEntries: Array<{ id: string; entryType: string; direction: "CREDIT" | "DEBIT"; amount: number; createdAt: string }>;
};
type AuthTokenPayload = { sub: string; role: UserRole; sessionId: string };
type OneTimeTokenRecord = { tokenHash: string; userId: string; expiresAtMs: number; usedAtMs: number | null };

const usersById = new Map<string, UserRecord>();
const usersByEmail = new Map<string, UserRecord>();
const usersByPhone = new Map<string, UserRecord>();
const refreshTokens = new Map<string, RefreshTokenRecord>();
const verificationTokens = new Map<string, OneTimeTokenRecord>();
const resetTokens = new Map<string, OneTimeTokenRecord>();
const walletsByUser = new Map<string, WalletRecord[]>();
const messagesByThread = new Map<string, ChatMessageRecord[]>();
const requestStartTimes = new Map<string, number>();
const gigs: GigRecord[] = [];

const toSeconds = (input: string, fallback: number) => {
  const m = input.match(/^(\d+)([smhd])$/i);
  if (!m) return fallback;
  const v = Number(m[1]);
  const u = m[2].toLowerCase();
  return u === "s" ? v : u === "m" ? v * 60 : u === "h" ? v * 3600 : v * 86400;
};
const accessTtlSeconds = toSeconds(config.ACCESS_TOKEN_TTL, 600);
const refreshTtlSeconds = toSeconds(config.REFRESH_TOKEN_TTL, 30 * 24 * 3600);
const rememberMeRefreshTtlSeconds = toSeconds(config.REMEMBER_ME_REFRESH_TTL, 90 * 24 * 3600);
const allowedOrigins = Array.from(new Set(["http://localhost:3000", "http://localhost:5173", ...config.WEB_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)]));
const externalApiKeys = new Set(config.EXTERNAL_API_KEYS.split(",").map((x) => x.trim()).filter(Boolean));

const toSessionUser = (u: UserRecord): SessionUser => ({
  id: u.id,
  campusEmail: u.campusEmail,
  phoneE164: u.phoneE164,
  role: u.role,
  status: u.status,
  displayName: u.displayName,
  campusId: u.campusId,
  profile: { displayName: u.displayName, bio: "", campusId: u.campusId, skills: [], ratingAvg: 5, ratingCount: 0, avatarUrl: null, createdAt: u.createdAt, updatedAt: u.updatedAt }
});

const toPersistedUser = (u: UserRecord): PersistedUser => ({
  id: u.id,
  campus_email: u.campusEmail,
  phone_e164: u.phoneE164,
  password_hash: u.passwordHash,
  role: u.role,
  status: u.status,
  display_name: u.displayName,
  campus_id: u.campusId,
  mfa_enabled: u.mfaEnabled,
  failed_login_attempts: u.failedLoginAttempts,
  lockout_until: u.lockoutUntilMs ? new Date(u.lockoutUntilMs).toISOString() : null,
  email_verified_at: u.emailVerifiedAt,
  created_at: u.createdAt,
  updated_at: u.updatedAt
});

const fromPersistedUser = (u: PersistedUser): UserRecord => ({
  id: u.id,
  campusEmail: u.campus_email,
  phoneE164: u.phone_e164,
  passwordHash: u.password_hash,
  role: u.role,
  status: u.status,
  displayName: u.display_name,
  campusId: u.campus_id,
  mfaEnabled: u.mfa_enabled,
  failedLoginAttempts: u.failed_login_attempts ?? 0,
  lockoutUntilMs: u.lockout_until ? Date.parse(u.lockout_until) : null,
  emailVerifiedAt: u.email_verified_at,
  createdAt: u.created_at,
  updatedAt: u.updated_at
});

const cacheUser = (u: UserRecord) => {
  usersById.set(u.id, u);
  usersByEmail.set(u.campusEmail.toLowerCase(), u);
  usersByPhone.set(u.phoneE164, u);
  return u;
};

async function persistUser(user: UserRecord, request?: FastifyRequest) {
  cacheUser(user);
  if (isSupabaseEnabled()) {
    try {
      await upsertUser(toPersistedUser(user));
    } catch (err) {
      request?.log.error({ err, userId: user.id }, "supabase.upsert.failed");
    }
  }
  return user;
}

async function findUserByIdentifier(identifier: string, request?: FastifyRequest) {
  const norm = identifier.trim().toLowerCase();
  const local = usersByEmail.get(norm) ?? usersByPhone.get(identifier.trim());
  if (local) return local;
  if (!isSupabaseEnabled()) return null;
  try {
    const row = await findUserByIdentifierSupabase(identifier);
    return row ? cacheUser(fromPersistedUser(row)) : null;
  } catch (err) {
    request?.log.error({ err, identifier: redactPII(identifier) }, "supabase.find_user.failed");
    return null;
  }
}

async function findUserById(userId: string, request?: FastifyRequest) {
  const local = usersById.get(userId);
  if (local) return local;
  if (!isSupabaseEnabled()) return null;
  try {
    const row = await findUserByIdSupabase(userId);
    return row ? cacheUser(fromPersistedUser(row)) : null;
  } catch (err) {
    request?.log.error({ err, userId }, "supabase.find_user_by_id.failed");
    return null;
  }
}

async function logActivitySafe(request: FastifyRequest | undefined, action: string, userId?: string | null, metadata?: Record<string, unknown>) {
  if (!isSupabaseEnabled()) return;
  try {
    const ip = request?.ip ?? "";
    const ua = String(request?.headers["user-agent"] ?? "");
    await logActivity({
      userId: userId ?? null,
      action,
      metadata: metadata ?? {},
      requestId: request?.requestId ?? null,
      ipHash: ip ? hashIpAndAgent(ip, ua) : null
    });
  } catch (err) {
    request?.log.error({ err, action }, "supabase.activity.failed");
  }
}

function issueDefaultWallets(userId: string) {
  const existing = walletsByUser.get(userId);
  if (existing) return existing;
  const wallets: WalletRecord[] = [{ id: `wallet_${randomUUID()}`, currency: "KES", available: 0, pending: 0, ledgerEntries: [] }];
  walletsByUser.set(userId, wallets);
  return wallets;
}

function seedGigsIfEmpty() {
  if (gigs.length) return;
  gigs.push({
    id: `gig_${randomUUID()}`,
    title: "Campus Delivery Run",
    description: "Deliver lunch orders to nearby hostels.",
    category: "DELIVERY",
    payAmount: 500,
    currency: "KES",
    latitude: -1.2921,
    longitude: 36.8219,
    radiusMeters: 1500,
    startsAt: new Date(Date.now() + 3600000).toISOString(),
    status: "OPEN",
    posterId: "seed-system",
    createdAt: new Date().toISOString()
  });
}

const isUserLockedOut = (u: UserRecord) => Boolean(u.lockoutUntilMs && u.lockoutUntilMs > Date.now());

async function registerFailedLogin(user: UserRecord, request: FastifyRequest) {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= config.LOGIN_MAX_ATTEMPTS) {
    user.lockoutUntilMs = Date.now() + config.LOGIN_LOCK_MINUTES * 60 * 1000;
  }
  user.updatedAt = new Date().toISOString();
  await persistUser(user, request);
}

async function clearFailedLogin(user: UserRecord, request: FastifyRequest) {
  user.failedLoginAttempts = 0;
  user.lockoutUntilMs = null;
  user.updatedAt = new Date().toISOString();
  await persistUser(user, request);
}

function createOneTimeToken(target: Map<string, OneTimeTokenRecord>, userId: string, ttlMs: number) {
  const rawToken = randomToken(32);
  const tokenHash = sha256(rawToken);
  target.set(tokenHash, { tokenHash, userId, expiresAtMs: Date.now() + ttlMs, usedAtMs: null });
  return rawToken;
}

function consumeOneTimeToken(target: Map<string, OneTimeTokenRecord>, rawToken: string) {
  const token = target.get(sha256(rawToken));
  if (!token || token.usedAtMs || token.expiresAtMs < Date.now()) return null;
  token.usedAtMs = Date.now();
  return token;
}

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify<AuthTokenPayload>();
  } catch {
    reply.unauthorized("Invalid or expired access token");
  }
}

async function getCurrentUser(request: FastifyRequest) {
  const userId = request.user?.sub;
  if (!userId) return null;
  return findUserById(userId, request);
}

function createCsrfToken(reply: FastifyReply) {
  const token = randomToken(24);
  reply.setCookie("csrfToken", token, {
    path: "/",
    httpOnly: false,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    domain: config.COOKIE_DOMAIN || undefined
  });
  return token;
}

function ensureCsrf(request: FastifyRequest, reply: FastifyReply) {
  const header = String(request.headers["x-csrf-token"] ?? "");
  const cookieToken = request.cookies?.csrfToken;
  if (!header || !cookieToken || header !== cookieToken) {
    reply.forbidden("Invalid CSRF token");
    return false;
  }
  return true;
}

function clearAuthCookies(reply: FastifyReply) {
  reply.clearCookie("refreshToken", { path: "/", domain: config.COOKIE_DOMAIN || undefined });
  reply.clearCookie("csrfToken", { path: "/", domain: config.COOKIE_DOMAIN || undefined });
}

async function issueAuthTokens(reply: FastifyReply, user: UserRecord, opts?: { familyId?: string; rememberMe?: boolean }) {
  const accessToken = await reply.jwtSign(
    { sub: user.id, role: user.role, sessionId: randomUUID() },
    { expiresIn: accessTtlSeconds, issuer: config.JWT_ISSUER, audience: config.JWT_AUDIENCE } as never
  );
  const ttl = opts?.rememberMe ? rememberMeRefreshTtlSeconds : refreshTtlSeconds;
  const refreshToken = randomToken(48);
  const tokenHash = sha256(refreshToken);
  const familyId = opts?.familyId ?? randomUUID();
  refreshTokens.set(tokenHash, { id: randomUUID(), userId: user.id, familyId, tokenHash, expiresAtMs: Date.now() + ttl * 1000, revoked: false, replacedByTokenHash: null });
  reply.setCookie("refreshToken", refreshToken, {
    path: "/",
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    domain: config.COOKIE_DOMAIN || undefined,
    maxAge: ttl
  });
  return { accessToken, refreshToken, expiresIn: accessTtlSeconds, familyId };
}

function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  if (!externalApiKeys.size) return reply.forbidden("External API keys are not configured");
  const key = String(request.headers["x-api-key"] ?? "");
  if (!key || !externalApiKeys.has(key)) return reply.unauthorized("Invalid API key");
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    trustProxy: config.TRUST_PROXY,
    logger:
      config.NODE_ENV === "development"
        ? { transport: { target: "pino-pretty" } }
        : true
  });

  seedGigsIfEmpty();

  await app.register(sensible);
  await app.register(cookie);
  await app.register(compress, { global: true, threshold: 1024 });
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("CORS origin denied"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Device-Id", "X-Device-Public-Key", "X-CSRF-Token", "X-API-Key", "X-Webhook-Signature"],
    credentials: true
  });
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", ...allowedOrigins]
      }
    }
  });
  await app.register(rateLimit, { global: true, max: config.RATE_LIMIT_MAX, timeWindow: config.RATE_LIMIT_WINDOW });
  await app.register(jwt, { secret: config.JWT_ACCESS_SECRET });

  app.addHook("onRequest", async (request) => {
    request.requestId = randomUUID();
    requestStartTimes.set(request.requestId, Date.now());
  });

  app.addHook("preValidation", async (request) => {
    if (request.body !== undefined) (request as unknown as { body: unknown }).body = sanitizeUnknown(request.body);
    if (request.query !== undefined) (request as unknown as { query: unknown }).query = sanitizeUnknown(request.query);
    if (request.params !== undefined) (request as unknown as { params: unknown }).params = sanitizeUnknown(request.params);
  });

  app.addHook("onResponse", async (request, reply) => {
    const started = requestStartTimes.get(request.requestId) ?? Date.now();
    requestStartTimes.delete(request.requestId);
    request.log.info({ requestId: request.requestId, method: request.method, url: request.url, statusCode: reply.statusCode, durationMs: Date.now() - started, ip: request.ip }, "request.completed");
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, requestId: request.requestId });
    const normalized = error as Error & { statusCode?: number };
    reply.status(normalized.statusCode ?? 500).send({ error: normalized.message || "Internal Server Error", requestId: request.requestId });
  });

  app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString(), env: config.NODE_ENV, uptimeSeconds: Math.round(process.uptime()) }));
  app.get("/ready", async () => {
    const db = await pingSupabase();
    return { status: db.ok ? "ready" : "degraded", db };
  });
  app.get("/api/v1/auth/csrf", async (_request, reply) => ({ csrfToken: createCsrfToken(reply) }));

  app.post("/api/v1/auth/register", { config: { rateLimit: { max: config.AUTH_RATE_LIMIT_MAX, timeWindow: config.AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");

    const existing = (await findUserByIdentifier(parsed.data.campusEmail, request)) || (await findUserByIdentifier(parsed.data.phone, request));
    if (existing) return reply.conflict("Account already exists for this email or phone.");

    const now = new Date().toISOString();
    const requiresVerification = config.REQUIRE_EMAIL_VERIFICATION;
    const user: UserRecord = {
      id: randomUUID(),
      campusEmail: parsed.data.campusEmail,
      phoneE164: parsed.data.phone,
      passwordHash: await hashPassword(parsed.data.password),
      role: "STUDENT",
      status: requiresVerification ? "PENDING_VERIFICATION" : "ACTIVE",
      displayName: parsed.data.displayName,
      campusId: parsed.data.campusId,
      createdAt: now,
      updatedAt: now,
      mfaEnabled: false,
      failedLoginAttempts: 0,
      lockoutUntilMs: null,
      emailVerifiedAt: requiresVerification ? null : now
    };

    await persistUser(user, request);
    issueDefaultWallets(user.id);
    await logActivitySafe(request, "AUTH_REGISTERED", user.id, { channel: "password" });

    const verificationToken = requiresVerification
      ? createOneTimeToken(verificationTokens, user.id, config.EMAIL_VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000)
      : undefined;

    return reply.code(201).send({
      user: toSessionUser(user),
      message: requiresVerification ? "Account created. Verify your email before login." : "Account created successfully.",
      requiresEmailVerification: requiresVerification,
      verificationToken: config.NODE_ENV !== "production" ? verificationToken : undefined
    });
  });

  app.post("/api/v1/auth/verify-email", { config: { rateLimit: { max: config.AUTH_RATE_LIMIT_MAX, timeWindow: config.AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const parsed = verifyEmailSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");

    const token = consumeOneTimeToken(verificationTokens, parsed.data.token);
    if (!token) return reply.badRequest("Invalid or expired verification token.");

    const user = await findUserById(token.userId, request);
    if (!user) return reply.notFound("User not found.");

    user.status = "ACTIVE";
    user.emailVerifiedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    await persistUser(user, request);
    await logActivitySafe(request, "AUTH_EMAIL_VERIFIED", user.id);

    return { success: true, message: "Email verification complete." };
  });

  app.post("/api/v1/auth/login", { config: { rateLimit: { max: config.AUTH_RATE_LIMIT_MAX, timeWindow: config.AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");

    const user = await findUserByIdentifier(parsed.data.identifier, request);
    if (!user) return reply.unauthorized("Invalid credentials");
    if (isUserLockedOut(user)) return reply.status(429).send({ error: "Account temporarily locked due to failed login attempts.", lockoutUntil: new Date(user.lockoutUntilMs as number).toISOString(), requestId: request.requestId });

    const ok = await verifyPassword(user.passwordHash, parsed.data.password);
    if (!ok) {
      await registerFailedLogin(user, request);
      return reply.unauthorized("Invalid credentials");
    }

    if (user.status === "PENDING_VERIFICATION" && config.REQUIRE_EMAIL_VERIFICATION) return reply.forbidden("Verify your email before logging in.");
    if (user.status === "SUSPENDED" || user.status === "DELETED") return reply.forbidden("Account is not active.");

    await clearFailedLogin(user, request);
    const tokens = await issueAuthTokens(reply, user, { rememberMe: parsed.data.rememberMe });
    const csrfToken = createCsrfToken(reply);
    await logActivitySafe(request, "AUTH_LOGIN_SUCCESS", user.id, { rememberMe: parsed.data.rememberMe });

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, tokenType: "Bearer", expiresIn: tokens.expiresIn, csrfToken, user: toSessionUser(user) };
  });

  app.post("/api/v1/auth/password/forgot", { config: { rateLimit: { max: config.AUTH_RATE_LIMIT_MAX, timeWindow: config.AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");

    const user = await findUserByIdentifier(parsed.data.campusEmail, request);
    if (user) {
      const resetToken = createOneTimeToken(resetTokens, user.id, config.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
      await logActivitySafe(request, "AUTH_PASSWORD_RESET_REQUESTED", user.id);
      return { success: true, message: "If the account exists, reset instructions have been generated.", resetToken: config.NODE_ENV !== "production" ? resetToken : undefined };
    }

    return { success: true, message: "If the account exists, reset instructions have been generated." };
  });

  app.post("/api/v1/auth/password/reset", { config: { rateLimit: { max: config.AUTH_RATE_LIMIT_MAX, timeWindow: config.AUTH_RATE_LIMIT_WINDOW } } }, async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");

    const token = consumeOneTimeToken(resetTokens, parsed.data.token);
    if (!token) return reply.badRequest("Invalid or expired reset token.");

    const user = await findUserById(token.userId, request);
    if (!user) return reply.notFound("User not found.");

    user.passwordHash = await hashPassword(parsed.data.password);
    user.failedLoginAttempts = 0;
    user.lockoutUntilMs = null;
    user.updatedAt = new Date().toISOString();
    await persistUser(user, request);

    for (const tokenRecord of refreshTokens.values()) {
      if (tokenRecord.userId === user.id) tokenRecord.revoked = true;
    }

    clearAuthCookies(reply);
    await logActivitySafe(request, "AUTH_PASSWORD_RESET_COMPLETED", user.id);
    return { success: true, message: "Password reset successful. Please login again." };
  });

  app.post<{ Body: { refreshToken?: string; rememberMe?: boolean } }>("/api/v1/auth/refresh", async (request, reply) => {
    const bodyRefresh = request.body?.refreshToken;
    const cookieRefresh = request.cookies?.refreshToken;
    const rawRefresh = bodyRefresh || cookieRefresh;
    if (!rawRefresh) return reply.badRequest("refreshToken is required");
    if (cookieRefresh && !ensureCsrf(request, reply)) return;

    const tokenHash = sha256(rawRefresh);
    const token = refreshTokens.get(tokenHash);
    if (!token || token.revoked) return reply.unauthorized("Invalid refresh token");
    if (token.expiresAtMs < Date.now()) return reply.unauthorized("Refresh token expired");

    const user = await findUserById(token.userId, request);
    if (!user) return reply.unauthorized("Invalid refresh token");

    token.revoked = true;
    const next = await issueAuthTokens(reply, user, { familyId: token.familyId, rememberMe: request.body?.rememberMe });
    token.replacedByTokenHash = sha256(next.refreshToken);

    return { accessToken: next.accessToken, refreshToken: next.refreshToken, tokenType: "Bearer", expiresIn: next.expiresIn };
  });

  app.post<{ Body: { refreshToken?: string; familyId?: string } }>("/api/v1/auth/logout", async (request, reply) => {
    const bodyRefresh = request.body?.refreshToken;
    const cookieRefresh = request.cookies?.refreshToken;
    const familyId = request.body?.familyId;
    if (cookieRefresh && !ensureCsrf(request, reply)) return;
    if (!bodyRefresh && !cookieRefresh && !familyId) return reply.badRequest("Provide refreshToken, cookie refresh token, or familyId");

    const effective = bodyRefresh || cookieRefresh;
    if (effective) {
      const existing = refreshTokens.get(sha256(effective));
      if (existing) {
        for (const token of refreshTokens.values()) {
          if (token.familyId === existing.familyId) token.revoked = true;
        }
      }
    } else if (familyId) {
      for (const token of refreshTokens.values()) {
        if (token.familyId === familyId) token.revoked = true;
      }
    }

    clearAuthCookies(reply);
    return { revoked: true };
  });

  app.get("/api/v1/auth/me", { preHandler: [authenticate] }, async (request, reply) => {
    const user = await getCurrentUser(request);
    if (!user) return reply.notFound("User not found");
    return { user: toSessionUser(user) };
  });

  app.get("/api/v1/gigs/feed", async (request, reply) => {
    const parsed = feedQuerySchema.safeParse(request.query);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid feed query.");

    return {
      gigs: gigs
        .filter((gig) => gig.status === "OPEN")
        .slice(0, parsed.data.limit ?? 50)
        .map((gig) => ({
          ...gig,
          poster: { profile: { displayName: usersById.get(gig.posterId)?.displayName ?? "Campus User" } }
        }))
    };
  });

  app.post("/api/v1/gigs", { preHandler: [authenticate] }, async (request, reply) => {
    const parsed = createGigSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid gig payload");

    const user = await getCurrentUser(request);
    if (!user) return reply.unauthorized("Unauthorized");

    const gig: GigRecord = {
      id: randomUUID(),
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      payAmount: parsed.data.payAmount,
      currency: parsed.data.currency,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      radiusMeters: parsed.data.radiusMeters,
      startsAt: parsed.data.startsAt,
      status: "OPEN",
      posterId: user.id,
      createdAt: new Date().toISOString()
    };

    gigs.unshift(gig);
    await logActivitySafe(request, "GIG_CREATED", user.id, { gigId: gig.id, category: gig.category });
    return reply.code(201).send({ gig });
  });

  app.post<{ Params: { id: string } }>("/api/v1/gigs/:id/apply", { preHandler: [authenticate] }, async (request) => {
    await logActivitySafe(request, "GIG_APPLIED", request.user?.sub ?? null, { gigId: request.params.id });
    return { success: true, gigId: request.params.id };
  });

  app.get("/api/v1/gigs/mine/posted", { preHandler: [authenticate] }, async (request) => {
    const user = await getCurrentUser(request);
    if (!user) return { gigs: [] };
    return { gigs: gigs.filter((gig) => gig.posterId === user.id) };
  });

  app.get("/api/v1/chat/threads", { preHandler: [authenticate] }, async () => ({ threads: [] }));

  app.get<{ Params: { threadId: string } }>("/api/v1/chat/threads/:threadId/messages", { preHandler: [authenticate] }, async (request) => ({ messages: messagesByThread.get(request.params.threadId) ?? [] }));

  app.post<{
    Params: { threadId: string };
    Body: { ciphertext?: string; nonce?: string; ratchetHeader?: string; senderKeyId?: string };
  }>("/api/v1/chat/threads/:threadId/messages", { preHandler: [authenticate] }, async (request, reply) => {
    const user = await getCurrentUser(request);
    if (!user) return reply.unauthorized("Unauthorized");

    const { ciphertext, nonce, ratchetHeader, senderKeyId } = request.body ?? {};
    if (!ciphertext || !nonce || !ratchetHeader || !senderKeyId) {
      return reply.badRequest("ciphertext, nonce, ratchetHeader and senderKeyId are required");
    }

    const message: ChatMessageRecord = {
      id: randomUUID(),
      threadId: request.params.threadId,
      senderId: user.id,
      ciphertext,
      nonce,
      ratchetHeader,
      senderKeyId,
      createdAt: new Date().toISOString()
    };

    const existing = messagesByThread.get(request.params.threadId) ?? [];
    existing.push(message);
    messagesByThread.set(request.params.threadId, existing);

    return reply.code(201).send({ message });
  });

  app.get<{ Params: { userId: string } }>("/api/v1/chat/prekeys/:userId", { preHandler: [authenticate] }, async () => ({ keys: [] }));

  app.get("/api/v1/chat/ws", async (request, reply) => {
    return reply.code(426).send({ error: "WebSocket upgrade endpoint is not enabled in this backend.", requestId: request.requestId });
  });

  app.get("/api/v1/escrow/wallet/me", { preHandler: [authenticate] }, async (request, reply) => {
    const user = await getCurrentUser(request);
    if (!user) return reply.unauthorized("Unauthorized");
    return { wallets: issueDefaultWallets(user.id) };
  });

  app.post<{ Body: { amount?: number; currency?: string } }>("/api/v1/escrow/wallet/topup", { preHandler: [authenticate] }, async (request, reply) => {
    const parsed = topupSchema.safeParse(request.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid topup payload");

    const user = await getCurrentUser(request);
    if (!user) return reply.unauthorized("Unauthorized");

    const wallets = issueDefaultWallets(user.id);
    const wallet = wallets.find((item) => item.currency === parsed.data.currency) ?? wallets[0];

    wallet.available += parsed.data.amount;
    wallet.ledgerEntries.unshift({
      id: randomUUID(),
      entryType: "TOPUP",
      direction: "CREDIT",
      amount: parsed.data.amount,
      createdAt: new Date().toISOString()
    });

    await logActivitySafe(request, "WALLET_TOPUP", user.id, { amount: parsed.data.amount, currency: parsed.data.currency });
    return { wallet, wallets, success: true };
  });

  app.get("/api/v1/safety/sessions/active", { preHandler: [authenticate] }, async () => ({ sessions: [] }));

  app.post<{ Params: { sessionId: string }; Body: { note?: string; encryptedLocation?: string } }>("/api/v1/safety/sessions/:sessionId/sos", { preHandler: [authenticate] }, async (request, reply) => {
    const parsed = sosSchema.safeParse(request.body ?? {});
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0]?.message ?? "Invalid SOS payload");
    await logActivitySafe(request, "SAFETY_SOS_TRIGGERED", request.user?.sub ?? null, { sessionId: request.params.sessionId });
    return { status: "ESCALATED", sessionId: request.params.sessionId, ...parsed.data };
  });

  app.get("/api/v1/admin/metrics", { preHandler: [authenticate] }, async () => ({
    totals: {
      totalUsers: usersById.size,
      activeGigs: gigs.filter((gig) => gig.status === "OPEN").length,
      completedToday: gigs.filter((gig) => gig.status === "COMPLETED").length,
      disputes: 0
    }
  }));

  app.get("/api/v1/risk/dashboard", { preHandler: [authenticate] }, async () => ({
    counts: {
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: usersById.size
    }
  }));

  app.post("/api/v1/external/ping", { preHandler: [requireApiKey] }, async (request) => ({ ok: true, requestId: request.requestId }));

  app.post("/api/v1/webhooks/incoming", { preHandler: [requireApiKey] }, async (request, reply) => {
    if (!config.WEBHOOK_SIGNING_SECRET) return reply.forbidden("WEBHOOK_SIGNING_SECRET is not configured");

    const signature = String(request.headers["x-webhook-signature"] ?? "");
    const payload = JSON.stringify(request.body ?? {});
    if (!verifyWebhookSignature(payload, signature, config.WEBHOOK_SIGNING_SECRET)) {
      return reply.unauthorized("Invalid webhook signature");
    }

    return { accepted: true };
  });

  return app;
}
