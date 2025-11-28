/**
 * Funding Service
 * Handles automatic funding of new user wallets
 */

import { FUNDING_CONFIG } from "@/lib/config";
import { WalletService, zerodevService } from "@/services";
import { getSupabaseClient } from "@/lib/supabase-client";
import { parseEther } from "viem";

export interface FundingResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  amount: string;
}

export class FundingService {
  /**
   * Get the admin wallet for funding operations
   */
  static async getAdminWallet() {
    const supabase = getSupabaseClient();

    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("is_admin", true)
      .single();

    if (userError || !adminUser) {
      throw new Error("Admin user not found. Please set an admin user.");
    }

    // Get admin wallet
    const adminWallet = await WalletService.walletByUserId(adminUser.id);

    if (!adminWallet) {
      throw new Error(`Admin user ${adminUser.email} has no wallet`);
    }

    return { user: adminUser, wallet: adminWallet };
  }

  /**
   * Check if admin wallet has sufficient balance
   */
  static async checkAdminBalance(requiredAmount: string): Promise<boolean> {
    const { wallet } = await this.getAdminWallet();
    const balance = await WalletService.getBalance(wallet.accountAddress);

    const required = parseEther(requiredAmount);

    const available = BigInt(balance.balanceWei);

    return available >= required;
  }

  /**
   * Log funding transaction to database
   */
  private static async logTransaction(params: {
    fromAddress: string;
    toAddress: string;
    toUserId: string;
    amount: string;
    status: "pending" | "success" | "failed";
    transactionHash?: string;
    errorMessage?: string;
  }) {
    const supabase = getSupabaseClient();

    await supabase.from("funding_transactions").insert({
      from_wallet_address: params.fromAddress,
      to_wallet_address: params.toAddress,
      to_user_id: params.toUserId,
      amount: params.amount,
      status: params.status,
      transaction_hash: params.transactionHash,
      error_message: params.errorMessage,
    });
  }

  /**
   * Fund a newly created wallet
   * This is called inline during user registration
   */
  static async fundNewWallet(
    recipientUserId: string,
    recipientWalletAddress: string
  ): Promise<{
    success: boolean;
    amount: string;
    transactionHash?: string;
    error?: string;
  }> {
    // Check if auto-funding is enabled
    if (!FUNDING_CONFIG.enableAutoFunding) {
      console.log("🔕 Auto-funding disabled, skipping");
      return {
        success: false,
        error: "Auto-funding disabled",
        amount: "0",
      };
    }

    const fundingAmount = FUNDING_CONFIG.defaultFundingAmount;

    try {
      console.log(`💸 Funding new wallet: ${recipientWalletAddress}`);

      // Get admin wallet
      const { user: adminUser, wallet: adminWallet } =
        await this.getAdminWallet();

      // Check admin balance
      const hasSufficientBalance = await this.checkAdminBalance(fundingAmount);

      if (!hasSufficientBalance) {
        const error = "Admin wallet has insufficient balance";
        console.error(`❌ ${error}`);

        // Log failed attempt
        await this.logTransaction({
          fromAddress: adminWallet.accountAddress,
          toAddress: recipientWalletAddress,
          toUserId: recipientUserId,
          amount: fundingAmount,
          status: "failed",
          errorMessage: error,
        });

        return { success: false, error, amount: fundingAmount };
      }

      // Log pending transaction
      await this.logTransaction({
        fromAddress: adminWallet.accountAddress,
        toAddress: recipientWalletAddress,
        toUserId: recipientUserId,
        amount: fundingAmount,
        status: "pending",
      });

      const result = await zerodevService.sendSponsoredTransaction({
        to: recipientWalletAddress,
        value: parseEther(fundingAmount).toString(),
        walletAddress: adminWallet.accountAddress,
        userEmail: adminUser.email,
      });

      // Update transaction log with success
      await this.logTransaction({
        fromAddress: adminWallet.accountAddress,
        toAddress: recipientWalletAddress,
        toUserId: recipientUserId,
        amount: fundingAmount,
        status: "success",
        transactionHash: result.transactionHash,
      });

      console.log(
        `✅ Funded ${recipientWalletAddress} with ${fundingAmount} ETH`
      );
      console.log(`📝 Transaction: ${result.transactionHash}`);

      return {
        success: true,
        transactionHash: result.transactionHash,
        amount: fundingAmount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Failed to fund wallet: ${errorMessage}`);

      // Try to log the error (best effort)
      try {
        const { wallet: adminWallet } = await this.getAdminWallet();
        await this.logTransaction({
          fromAddress: adminWallet.accountAddress,
          toAddress: recipientWalletAddress,
          toUserId: recipientUserId,
          amount: fundingAmount,
          status: "failed",
          errorMessage,
        });
      } catch (logError) {
        console.error("Failed to log funding error:", logError);
      }

      return { success: false, error: errorMessage, amount: fundingAmount };
    }
  }
}
