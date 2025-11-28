/**
 * Wallet Service
 * Business logic for wallet operations
 */

import {
  blockchainClient,
  dynamicClient,
  type WalletBalance,
} from "@/lib/clients";
import { getSupabaseClient } from "@/lib/supabase-client";
import { DBWallet, WalletRow } from "@/types/wallet.types";

export interface WalletDetails extends WalletBalance {
  userId?: string;
}

/**
 * WalletService - Handles wallet-related business logic
 */
export class WalletService {
  /**
   * Private: Map database row to StoredUser (camelCase)
   */
  private static mapToDBWallet(row: WalletRow): DBWallet {
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
   * Get wallet balance by address
   */
  static async getBalance(address: string): Promise<WalletBalance> {
    return await blockchainClient.getBalance(address);
  }

  /**
   * Get wallet by address (from database)
   */
  static async getByAddress(address: string): Promise<DBWallet | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("account_address", address)
      .single();

    if (error?.code === "PGRST116") return null; // Not found
    if (error) throw new Error(`Failed to get wallet: ${error.message}`);

    return this.mapToDBWallet(data);
  }

  /**
   * List all wallets for a user (from database)
   */
  static async walletByUserId(userId: string): Promise<DBWallet> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw new Error(`Failed to list wallets: ${error.message}`);

    return this.mapToDBWallet(data);
  }

  /**
   * Get wallet with balances for a user
   */
  static async listByUserIdWithBalances(
    userId: string
  ): Promise<{ wallet: DBWallet; balance?: WalletBalance | null }> {
    const wallet = await this.walletByUserId(userId);

    try {
      const balance = await blockchainClient.getBalance(wallet.accountAddress);
      return { wallet, balance };
    } catch (error) {
      console.error(
        `Failed to get balance for ${wallet.accountAddress}:`,
        error
      );
      return { wallet, balance: null };
    }
  }

  /**
   * Create embedded wallet for user
   */
  static async createForUser(userId: string): Promise<DBWallet> {
    return await dynamicClient.createEmbeddedWallet(userId);
  }

  /**
   * Get balances for multiple addresses
   */
  static async getBalances(addresses: string[]): Promise<WalletBalance[]> {
    return await Promise.all(
      addresses.map((address) => blockchainClient.getBalance(address))
    );
  }

  /**
   * Check if user has a wallet
   */
  static async userHasWallet(userId: string): Promise<boolean> {
    const wallets = await this.walletByUserId(userId);
    if (wallets) return true;
    return false;
  }
}
