/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * ZeroDev Service
 * Business logic for ZeroDev operations
 */

import { createZerodevClient } from "@dynamic-labs-wallet/node-evm";
import { DYNAMIC_CONFIG, ZERODEV_CONFIG } from "@/lib/config";
import type { ZeroDevKernelOptions } from "@/types/zerodev.types";
import { UserService } from "./user.service";
import { WalletService } from "./wallet.service";
import { ExternalServerKeyShareJSON } from "@/types/wallet.types";
import { getAuthenticatedEvmClient } from "@/lib/dynamic";

export interface SendTransactionParams {
  to: string;
  value: string;
  walletAddress: string;
  userEmail: string;
  data?: string;
}

export interface TransactionResult {
  transactionHash: string;
  success: boolean;
  message: string;
}

/**
 * ZeroDevService - Handles ZeroDev client creation and sponsored transactions
 */
export class ZeroDevService {
  private environmentId: string;
  private authToken: string;

  constructor() {
    this.environmentId = DYNAMIC_CONFIG.environmentId;
    this.authToken = DYNAMIC_CONFIG.authToken;

    if (!this.environmentId || !this.authToken) {
      throw new Error("Dynamic credentials not configured");
    }
  }

  /**
   * Create kernel client with sponsorship enabled
   */
  async createKernelClient(
    walletAddress: string,
    externalServerKeyShares: ExternalServerKeyShareJSON | ExternalServerKeyShareJSON[]
  ) {
    const authenticatedEvmClient = await getAuthenticatedEvmClient({
      authToken: this.authToken,
      environmentId: this.environmentId,
    });
    const zerodevClient = await createZerodevClient(authenticatedEvmClient);

    // Handle both single object and array formats
    const keyShares = Array.isArray(externalServerKeyShares)
      ? externalServerKeyShares[0]
      : externalServerKeyShares;

    const kernelOptions: ZeroDevKernelOptions = {
      withSponsorship: ZERODEV_CONFIG.withSponsorship,
      networkId: ZERODEV_CONFIG.defaultNetworkId,
      address: walletAddress as `0x${string}`,
      // @ts-expect-error
      externalServerKeyShares: keyShares,
    };

    return await zerodevClient.createKernelClientForAddress(kernelOptions);
  }

  /**
   * Send sponsored transaction
   */
  async sendSponsoredTransaction(
    params: SendTransactionParams
  ): Promise<TransactionResult> {
    const { to, value, walletAddress, userEmail } = params;

    // Get user by email
    const user = await UserService.getByEmail(userEmail);
    if (!user) {
      throw new Error("User not found");
    }

    // Get wallet with key shares from database
    const wallet = await WalletService.walletByUserId(user.id);

    if (!wallet) {
      throw new Error("No wallet found for user");
    }

    console.log("✅ Wallet found:", wallet.publicKeyHex);
    console.log("🔑 Has key shares:", !!wallet.externalServerKeyShares);

    // Create kernel client with sponsorship
    const kernelClient = await this.createKernelClient(
      walletAddress,
      wallet.externalServerKeyShares
    );

    // Send the sponsored transaction
    console.log("💸 Sending sponsored transaction...");
    const txHash = await kernelClient.sendTransaction({
      to: to as `0x${string}`,
      value: BigInt(value),
      data: params.data as `0x${string}` | undefined,
    });

    console.log("✅ Transaction sent:", txHash);

    return {
      transactionHash: txHash,
      success: true,
      message: "Transaction sent with gas sponsorship via ZeroDev",
    };
  }
}

/**
 * Singleton instance
 */
export const zerodevService = new ZeroDevService();
