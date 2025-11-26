/**
 * Wallet Service
 * Business logic for wallet operations
 */

import { blockchainClient, dynamicClient, type WalletBalance } from "@/lib/clients";
import { getSupabaseClient } from "@/lib/supabase-client";
import { DBWallet } from "@/types/wallet.types";

export interface WalletDetails extends WalletBalance {
  userId?: string;
}

/**
 * WalletService - Handles wallet-related business logic
 */
export class WalletService {
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

    return data;
  }

  /**
   * List all wallets for a user (from database)
   */
  static async listByUserId(userId: string): Promise<DBWallet[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to list wallets: ${error.message}`);

    return data || [];
  }

  /**
   * Get wallets with balances for a user
   */
  static async listByUserIdWithBalances(
    userId: string
  ): Promise<(DBWallet & { balance?: WalletBalance })[]> {
    const wallets = await this.listByUserId(userId);

    // Enrich with balance data
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const balance = await blockchainClient.getBalance(wallet.accountAddress);
          return { ...wallet, balance };
        } catch (error) {
          console.error(`Failed to get balance for ${wallet.accountAddress}:`, error);
          return wallet;
        }
      })
    );

    return walletsWithBalances;
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
    const wallets = await this.listByUserId(userId);
    return wallets.length > 0;
  }
}

/**
 * Legacy singleton instance for backward compatibility
 * TODO: Remove once all code is migrated to static methods
 */
export const walletService = {
  getWalletDetails: WalletService.getBalance,
  getBalances: WalletService.getBalances,
  createEmbeddedWallet: WalletService.createForUser,
};
