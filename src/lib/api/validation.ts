/**
 * API Request Validation Schemas
 * Centralized Zod schemas for request validation
 */

import { z } from "zod";

/**
 * Common validation patterns
 */
const ethereumAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

const hexString = z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid hex string");

const positiveNumber = z.string().refine(
  (val) => {
    const num = BigInt(val);
    return num > 0n;
  },
  { message: "Must be a positive number" }
);

/**
 * Transaction Schemas
 */
export const SendTransactionSchema = z.object({
  to: ethereumAddress,
  value: positiveNumber,
  walletAddress: ethereumAddress,
  data: hexString.optional(),
});

export type SendTransactionRequest = z.infer<typeof SendTransactionSchema>;

/**
 * Wallet Schemas
 */
export const WalletAddressParamSchema = z.object({
  address: ethereumAddress,
});

export type WalletAddressParam = z.infer<typeof WalletAddressParamSchema>;

export const SignTransactionSchema = z.object({
  to: ethereumAddress,
  value: positiveNumber,
  data: hexString.optional(),
  nonce: z.number().int().nonnegative().optional(),
  gasLimit: positiveNumber.optional(),
});

export type SignTransactionRequest = z.infer<typeof SignTransactionSchema>;

/**
 * Webhook Schemas
 */
export const WebhookEventSchema = z.object({
  eventName: z.string(),
  eventId: z.string(),
  messageId: z.string(),
  webhookId: z.string(),
  timestamp: z.string(),
  userId: z.string(),
  environmentId: z.string(),
  environmentName: z.string(),
  data: z.unknown(),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const DelegationCreatedDataSchema = z.object({
  chain: z.string(),
  encryptedDelegatedShare: z.object({
    alg: z.string(),
    ct: z.string(),
    ek: z.string(),
    iv: z.string(),
    tag: z.string(),
  }),
  encryptedWalletApiKey: z.object({
    alg: z.string(),
    ct: z.string(),
    ek: z.string(),
    iv: z.string(),
    kid: z.string(),
    tag: z.string(),
  }),
  publicKey: z.string(),
  userId: z.string(),
  walletId: z.string(),
});

export type DelegationCreatedData = z.infer<typeof DelegationCreatedDataSchema>;

export const DelegationRevokedDataSchema = z.object({
  chain: z.string(),
  publicKey: z.string(),
  userId: z.string(),
  walletId: z.string(),
});

export type DelegationRevokedData = z.infer<typeof DelegationRevokedDataSchema>;

/**
 * Query Parameter Schemas
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

/**
 * Validation helper - validates and returns parsed data or throws
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation - returns result with success/error
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod errors for API responses
 */
export function formatZodError(error: z.ZodError) {
  return error.issues.map((err: z.ZodIssue) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}
