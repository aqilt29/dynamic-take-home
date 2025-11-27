/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Basescan Client
 * Wrapper for Basescan API with automatic rate limiting
 */

import { EXTERNAL_API_CONFIG, RATE_LIMIT_CONFIG } from "@/lib/config";

export interface BasescanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  type?: "external" | "internal";
}

export interface TransactionResponse {
  transactions: BasescanTransaction[];
  count: number;
  external: number;
  internal: number;
}

/**
 * BasescanClient - Handles Basescan API interactions with rate limiting
 */
export class BasescanClient {
  private apiUrl: string;
  private apiKey: string;
  private chainId: string;
  private lastRequestTime: number = 0;
  private delayMs: number;

  constructor() {
    const config = EXTERNAL_API_CONFIG.basescan;
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.chainId = config.chainId;
    this.delayMs = RATE_LIMIT_CONFIG.basescan.delayMs;

    if (!this.apiKey) {
      throw new Error("BASESCAN_API_KEY not configured");
    }
  }

  /**
   * Delay execution to respect rate limits
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.delayMs) {
      const waitTime = this.delayMs - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make a request to Basescan API
   */
  private async request(params: Record<string, string>): Promise<any> {
    await this.rateLimit();

    const queryParams = new URLSearchParams({
      ...params,
      apikey: this.apiKey,
      chainid: this.chainId,
    });

    const url = `${this.apiUrl}?${queryParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Basescan API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get external transactions for an address
   */
  async getExternalTransactions(
    address: string,
    page: number = 1,
    offset: number = 20
  ): Promise<BasescanTransaction[]> {
    const data = await this.request({
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "99999999",
      page: page.toString(),
      offset: offset.toString(),
      sort: "desc",
    });

    if (data.status !== "1" || !data.result) {
      return [];
    }

    return data.result.map((tx: BasescanTransaction) => ({
      ...tx,
      type: "external" as const,
    }));
  }

  /**
   * Get internal transactions for an address
   */
  async getInternalTransactions(
    address: string,
    page: number = 1,
    offset: number = 20
  ): Promise<BasescanTransaction[]> {
    const data = await this.request({
      module: "account",
      action: "txlistinternal",
      address,
      startblock: "0",
      endblock: "99999999",
      page: page.toString(),
      offset: offset.toString(),
      sort: "desc",
    });

    if (data.status !== "1" || !data.result) {
      return [];
    }

    return data.result.map((tx: BasescanTransaction) => ({
      ...tx,
      type: "internal" as const,
    }));
  }

  /**
   * Get all transactions (external + internal) for an address
   */
  async getAllTransactions(
    address: string,
    page: number = 1,
    offset: number = 20
  ): Promise<TransactionResponse> {
    // Fetch both types concurrently but with rate limiting
    const external = await this.getExternalTransactions(address, page, offset);
    const internal = await this.getInternalTransactions(address, page, offset);

    // Combine and sort by timestamp
    const allTransactions = [...external, ...internal].sort(
      (a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp)
    );

    return {
      transactions: allTransactions,
      count: allTransactions.length,
      external: external.length,
      internal: internal.length,
    };
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(
    hash: string
  ): Promise<BasescanTransaction | null> {
    const data = await this.request({
      module: "proxy",
      action: "eth_getTransactionByHash",
      txhash: hash,
    });

    return data.result || null;
  }
}

/**
 * Singleton instance
 */
export const basescanClient = new BasescanClient();
