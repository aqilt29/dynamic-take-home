/**
 * Centralized Configuration
 * Single source of truth for all application configuration and environment variables
 */

import { baseSepolia } from "viem/chains";

/**
 * NextAuth Configuration
 */
export const NEXTAUTH_CONFIG = {
  jwtPrivateKey: process.env.NEXTAUTH_JWT_PRIVATE_KEY || "",
  jwtPublicKey: process.env.NEXTAUTH_JWT_PUBLIC_KEY || "",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
} as const;

/**
 * Supabase Configuration
 */
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
} as const;

/**
 * Dynamic Labs Configuration
 */
export const DYNAMIC_CONFIG = {
  apiBase: "https://app.dynamic.xyz/api/v0",
  environmentId: process.env.DYNAMIC_ENVIRONMENT_ID || "",
  authToken: process.env.DYNAMIC_AUTH_TOKEN || "",
  webhookSecret: process.env.DYNAMIC_WEBHOOK_SECRET || "",
  delegationPrivateKey: process.env.DELEGATION_PRIVATE_KEY || "",
} as const;

/**
 * Blockchain Configuration
 */
export const BLOCKCHAIN_CONFIG = {
  chains: {
    baseSepolia: {
      id: 84532,
      name: "Base Sepolia",
      chain: baseSepolia,
      rpcUrl: "https://sepolia.base.org",
    },
  },
  defaultChain: "baseSepolia" as const,
} as const;

/**
 * External API Configuration
 */
export const EXTERNAL_API_CONFIG = {
  basescan: {
    apiUrl: "https://api.etherscan.io/v2/api",
    apiKey: process.env.BASESCAN_API_KEY || "",
    chainId: "84532", // Base Sepolia
  },
} as const;

/**
 * ZeroDev Configuration
 */
export const ZERODEV_CONFIG = {
  defaultNetworkId: "84532", // Base Sepolia
  withSponsorship: true,
} as const;

/**
 * API Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  basescan: {
    delayMs: 2000, // 2 seconds between requests to avoid rate limits
  },
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  env: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

/**
 * Validation helpers
 */
export function validateNextAuthConfig() {
  const { jwtPrivateKey, jwtPublicKey } = NEXTAUTH_CONFIG;
  if (!jwtPrivateKey || !jwtPublicKey) {
    throw new Error("NextAuth JWT keys not configured");
  }
}

export function validateSupabaseConfig() {
  const { url, anonKey } = SUPABASE_CONFIG;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase credentials not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
}

export function validateDynamicConfig() {
  const { environmentId, authToken } = DYNAMIC_CONFIG;
  if (!environmentId || !authToken) {
    throw new Error("Dynamic credentials not configured");
  }
}

export function validateBasescanConfig() {
  const { apiKey } = EXTERNAL_API_CONFIG.basescan;
  if (!apiKey) {
    throw new Error("Basescan API key not configured");
  }
}
