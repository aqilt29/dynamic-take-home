/**
 * Transaction Service
 * Business logic for transaction operations
 */

import {
  basescanClient,
  type BasescanTransaction,
  type TransactionResponse,
} from "@/lib/clients";

/**
 * TransactionService - Handles transaction-related business logic
 */
export class TransactionService {
  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    address: string,
    page: number = 1,
    limit: number = 20
  ): Promise<TransactionResponse> {
    return await basescanClient.getAllTransactions(address, page, limit);
  }

  /**
   * Get only external transactions
   */
  async getExternalTransactions(
    address: string,
    page: number = 1,
    limit: number = 20
  ): Promise<BasescanTransaction[]> {
    return await basescanClient.getExternalTransactions(address, page, limit);
  }

  /**
   * Get only internal transactions
   */
  async getInternalTransactions(
    address: string,
    page: number = 1,
    limit: number = 20
  ): Promise<BasescanTransaction[]> {
    return await basescanClient.getInternalTransactions(address, page, limit);
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<BasescanTransaction | null> {
    return await basescanClient.getTransactionByHash(hash);
  }

  /**
   * Format transactions for API response
   */
  formatTransactions(transactions: BasescanTransaction[]) {
    return transactions.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: parseInt(tx.timeStamp),
      blockNumber: parseInt(tx.blockNumber),
      type: tx.type || "external",
      isError: tx.isError === "1",
      gasUsed: tx.gasUsed,
    }));
  }
}

/**
 * Singleton instance
 */
export const transactionService = new TransactionService();
