import { z } from "zod";

const phonePattern = /^\+?[1-9]\d{8,14}$/;

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password is too long.")
  .refine((value) => /[a-z]/.test(value), "Password must include a lowercase letter.")
  .refine((value) => /[A-Z]/.test(value), "Password must include an uppercase letter.")
  .refine((value) => /\d/.test(value), "Password must include a number.")
  .refine(
    (value) => /[^A-Za-z0-9]/.test(value),
    "Password must include a special character."
  );

export const registerSchema = z.object({
  campusEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Use a valid campus email address."),
  phone: z
    .string()
    .trim()
    .regex(phonePattern, "Use E.164 format, e.g. +2547XXXXXXXX."),
  password: passwordSchema,
  displayName: z
    .string()
    .trim()
    .min(2, "Display name is too short.")
    .max(80, "Display name is too long."),
  campusId: z
    .string()
    .trim()
    .min(2, "Campus ID is required.")
    .max(64, "Campus ID is too long.")
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Identifier is required."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional().default(false),
  mfaCode: z.string().trim().optional()
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(16, "Verification token is required.")
});

export const forgotPasswordSchema = z.object({
  campusEmail: z.string().trim().toLowerCase().email("Use a valid email address.")
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(16, "Reset token is required."),
  password: passwordSchema
});

export const createGigSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  category: z.string().trim().min(2).max(60),
  payAmount: z.number().min(0),
  currency: z.enum(["KES", "USD", "EUR"]),
  latitude: z.number(),
  longitude: z.number(),
  radiusMeters: z.number().min(100).max(50000),
  startsAt: z.string().datetime(),
  media: z
    .array(
      z.object({
        type: z.enum(["IMAGE", "VIDEO", "VOICE"]),
        objectKey: z.string().trim().min(1).max(512)
      })
    )
    .optional()
});

export const feedQuerySchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  radiusMeters: z.coerce.number().min(100).max(50000),
  mode: z.enum(["MY_LOCATION", "GENERAL"]),
  limit: z.coerce.number().min(1).max(100).optional()
});

export const chatMessageSchema = z.object({
  ciphertext: z.string().min(1).max(20000),
  nonce: z.string().min(1).max(500),
  ratchetHeader: z.string().min(1).max(5000),
  senderKeyId: z.string().min(1).max(500)
});

export const createThreadSchema = z.object({
  gigId: z.string().trim().min(1).max(120).optional(),
  gigTitle: z.string().trim().min(1).max(180).optional(),
  participantId: z.string().trim().min(1).max(120).optional(),
  participantName: z.string().trim().min(1).max(120).optional()
});

export const topupSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().trim().min(3).max(8).default("KES")
});

export const sosSchema = z.object({
  note: z.string().trim().max(2000).optional(),
  encryptedLocation: z.string().trim().max(10000).optional()
});
