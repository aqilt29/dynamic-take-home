/**
 * Dynamic Client
 * Wrapper for Dynamic Labs API and SDK
 */

import { DYNAMIC_CONFIG } from "@/lib/config";
import { DynamicEvmWalletClient } from "@dynamic-labs-wallet/node-evm";
import { saveWallet } from "@/lib/wallets";
import type {
  DBWallet,
  ExternalServerKeyShareJSON,
} from "@/types/wallet.types";

export interface DynamicWallet {
  id: string;
  publicKey: string;
  chain: string;
  externalServerKeyShares?: ExternalServerKeyShareJSON; // Dynamic returns this in various formats
}

export interface DynamicUserWallet {
  user: {
    id: string;
    email: string;
    wallets?: DynamicWallet[];
  };
}

enum ThresholdSignatureScheme {
  TWO_OF_TWO = "TWO_OF_TWO",
  TWO_OF_THREE = "TWO_OF_THREE",
  THREE_OF_FIVE = "THREE_OF_FIVE",
}

/**
 * DynamicClient - Handles Dynamic Labs API and SDK interactions
 */
export class DynamicClient {
  private apiBase: string;
  private environmentId: string;
  private authToken: string;
  private evmClient: DynamicEvmWalletClient | null = null;

  constructor() {
    this.apiBase = DYNAMIC_CONFIG.apiBase;
    this.environmentId = DYNAMIC_CONFIG.environmentId;
    this.authToken = DYNAMIC_CONFIG.authToken;

    if (!this.environmentId || !this.authToken) {
      throw new Error("Dynamic credentials not configured");
    }
  }

  /**
   * Get authenticated EVM client (singleton)
   */
  private async getEvmClient(): Promise<DynamicEvmWalletClient> {
    if (!this.evmClient) {
      this.evmClient = new DynamicEvmWalletClient({
        environmentId: this.environmentId,
      });
      await this.evmClient.authenticateApiToken(this.authToken);
    }
    return this.evmClient;
  }

  /**
   * Make authenticated request to Dynamic API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiBase}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Dynamic API request failed: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Get wallet by user ID
   */
  async getWallet(userId: string): Promise<DynamicUserWallet> {
    const endpoint = `/environments/${this.environmentId}/users/${userId}/wallets`;
    return await this.request<DynamicUserWallet>(endpoint);
  }

  /**
   * Create embedded wallet for user
   */
  async createEmbeddedWallet(userId: string): Promise<DBWallet> {
    console.log(`Creating embedded wallet for user: ${userId}`);

    const evmClient = await this.getEvmClient();

    const wallet = await evmClient.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      backUpToClientShareService: false,
    });

    try {
      return await saveWallet({
        userId,
        ...wallet,
      });
    } catch (error) {
      console.log("🚀 ~ generating dynamic user wallet error:", userId, error);
      throw new Error(`Dynamic API Fail, for wallet: ${userId}`);
    }
  }
}

/**
 * Singleton instance
 */
export const dynamicClient = new DynamicClient();
