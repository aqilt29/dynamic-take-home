import type {
  DBWallet,
  WalletInsertDTO,
  WalletRow,
} from "@/types/wallet.types";
import { getSupabaseClient } from "./supabase-client";

/**
 * Transform database row to DBWallet (app-layer) format
 */
function transformWalletRow(row: WalletRow): DBWallet {
  return {
    userId: row.user_id,
    walletId: row.wallet_id,
    accountAddress: row.account_address,
    publicKeyHex: row.public_key_hex,
    rawPublicKey: row.raw_public_key,
    externalServerKeyShares: row.external_server_key_shares,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Save a wallet to Supabase
 * Creates a new wallet or updates existing one
 * Enforces one wallet per user
 */
export async function saveWallet(wallet: DBWallet): Promise<DBWallet> {
  const supabase = getSupabaseClient();

  const walletData: WalletInsertDTO = {
    user_id: wallet.userId,
    wallet_id: wallet.walletId,
    account_address: wallet.accountAddress,
    public_key_hex: wallet.publicKeyHex,
    raw_public_key: wallet.rawPublicKey, // JSONB
    external_server_key_shares: wallet.externalServerKeyShares, // JSONB array
  };

  const { data, error } = await supabase
    .from("wallets")
    .upsert(walletData, { onConflict: "user_id" })
    .select("*")
    .single<WalletRow>();

  if (error) {
    console.error("Failed to save wallet:", error);
    throw new Error(`Failed to save wallet: ${error.message}`);
  }

  const saved = transformWalletRow(data);

  console.info(
    `💾 Wallet ${saved.walletId} for user ${saved.userId} saved to Supabase`
  );

  return saved;
}

/**
 * Get a specific wallet by wallet ID
 */
export async function getWalletById(
  walletId: string
): Promise<DBWallet | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("wallet_id", walletId)
    .single<WalletRow>();

  if (error) {
    if (error.code === "PGRST116") return undefined; // no rows
    console.error("Failed to get wallet:", error);
    throw new Error(`Failed to get wallet: ${error.message}`);
  }

  return data ? transformWalletRow(data) : undefined;
}

/**
 * Get a specific wallet by account address
 */
export async function getWalletByAccountAddress(
  accountAddress: string
): Promise<DBWallet | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("account_address", accountAddress)
    .single<WalletRow>();

  if (error) {
    if (error.code === "PGRST116") return undefined;
    console.error("Failed to get wallet by address:", error);
    throw new Error(`Failed to get wallet by address: ${error.message}`);
  }

  return data ? transformWalletRow(data) : undefined;
}

export async function getUserWalletByUserId(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single(); // because user_id is UNIQUE

  if (error && error.code !== "PGRST116") {
    // ignore "No rows" error
    throw error;
  }

  return data; // null if no wallet exists
}
