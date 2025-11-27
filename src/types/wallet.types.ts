import { StoredUser } from "./users.types";

/** JSON-serialized numeric map for bytes: { "0": 39, "1": 196, ... } */
export type ByteMap = Record<string, number>;

/** raw_public_key column shape (JSONB): { pubkey: ByteMap } */
export interface RawPublicKeyJSON {
  pubkey: ByteMap;
}

/**
 * external_server_key_shares column items (JSONB array)
 * Matches your saved file:
 * {
 *   pubkey: { pubkey: { "0": 39, ... } },
 *   secretShare: "..."
 * }
 */
export interface ExternalServerKeyShareJSON {
  pubkey: {
    pubkey: ByteMap;
  };
  secretShare: string;
}

export interface DBWallet {
  userId: string; // FK to users table
  walletId: string; // Dynamic Labs wallet ID
  accountAddress: string;
  publicKeyHex: string;

  rawPublicKey: RawPublicKeyJSON; // JSONB
  externalServerKeyShares: ExternalServerKeyShareJSON; // JSONB array

  createdAt?: string;
  updatedAt?: string;
}

/**
 * If you want a distinct "stored" wallet type (optional),
 * this is what comes back after a read.
 */
export interface StoredWallet extends DBWallet {
  id: string; // wallets.id UUID
  createdAt: string;
  updatedAt: string;
}

/** Row type returned from Supabase */
export interface WalletRow {
  id: string; // UUID
  user_id: string; // UUID (FK users.id)
  wallet_id: string; // Dynamic Labs wallet ID
  account_address: string;
  public_key_hex: string;
  raw_public_key: RawPublicKeyJSON; // JSONB
  external_server_key_shares: ExternalServerKeyShareJSON; // JSONB array
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/** Insert DTO you pass to supabase.from("wallets").insert/upsert */
export interface WalletInsertDTO {
  user_id: string;
  wallet_id: string;
  account_address: string;
  public_key_hex: string;
  raw_public_key: RawPublicKeyJSON; // JSONB
  external_server_key_shares: ExternalServerKeyShareJSON; // JSONB array
}

// -----------------------------
// Combined types / convenience
// -----------------------------

export interface UserWithWallet {
  user: StoredUser;
  wallet: StoredWallet | null;
}
