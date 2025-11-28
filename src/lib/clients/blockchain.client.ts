/**
 * Blockchain Client
 * Wrapper for blockchain operations using Viem
 */

import { createPublicClient, http, formatEther, type Address } from "viem";
import { BLOCKCHAIN_CONFIG } from "@/lib/config";

export interface WalletBalance {
  address: string;
  balance: string; // Formatted in ETH
  balanceWei: string; // Raw wei amount
  chain: string;
  chainId: number;
}

/**
 * BlockchainClient - Handles blockchain interactions
 */
export class BlockchainClient {
  private client;
  private chain;

  constructor(chainKey: keyof typeof BLOCKCHAIN_CONFIG.chains = "baseSepolia") {
    this.chain = BLOCKCHAIN_CONFIG.chains[chainKey];
    this.client = createPublicClient({
      chain: this.chain.chain,
      transport: http(this.chain.rpcUrl),
    });
  }

  /**
   * Get wallet balance for an address
   */
  async getBalance(address: string): Promise<WalletBalance> {
    const balance = await this.client.getBalance({
      address: address as Address,
    });

    return {
      address,
      balance: formatEther(balance),
      balanceWei: balance.toString(),
      chain: this.chain.name,
      chainId: this.chain.id,
    };
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string) {
    return await this.client.getTransaction({
      hash: hash as `0x${string}`,
    });
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: string) {
    return await this.client.getTransactionReceipt({
      hash: hash as `0x${string}`,
    });
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(hash: string) {
    return await this.client.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });
  }
}

/**
 * Singleton instance for the default chain
 */
export const blockchainClient = new BlockchainClient();
