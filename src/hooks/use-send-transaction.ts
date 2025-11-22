import { useState } from "react";
import { parseEther } from "viem";

/**
 * Configuration options for sending transactions
 */
export interface SendTransactionOptions {
  to: string; // Recipient address
  value: string; // Amount in ETH
}

/**
 * Custom hook for sending ETH using ZeroDev gasless transactions
 *
 * This hook provides functionality to send ETH without requiring
 * users to pay gas fees, leveraging ZeroDev's account abstraction infrastructure.
 *
 * All operations are handled server-side - no client-side Dynamic SDK needed!
 */
export function useSendTransaction() {
  // Track loading state during transaction
  const [isLoading, setIsLoading] = useState(false);
  // Store the transaction hash after successful send
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Sends ETH to a recipient using gasless transactions (server-side)
   *
   * @param options - Configuration for the send operation
   * @returns Promise<string> - The transaction hash of the successful send
   */
  const sendTransaction = async (
    options: SendTransactionOptions
  ): Promise<string> => {
    const { to, value } = options;

    // Validate parameters
    if (!to || !value) {
      throw new Error("Recipient address and amount are required");
    }

    if (!to.startsWith("0x") || to.length !== 42) {
      throw new Error("Invalid recipient address");
    }

    try {
      // Set loading state to show user that operation is in progress
      setIsLoading(true);

      // First get the user's wallet address
      const walletResponse = await fetch("/api/wallets");
      if (!walletResponse.ok) {
        throw new Error("Failed to get wallet");
      }
      const walletData = await walletResponse.json();
      const walletAddress = walletData.address;

      // Convert ETH amount to Wei
      const valueInWei = parseEther(value).toString();

      // Send transaction via server-side API
      const response = await fetch("/api/transactions/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          value: valueInWei,
          walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Transaction failed");
      }

      const result = await response.json();
      const transactionHash = result.transactionHash;

      // Store the transaction hash for UI display and return it
      setTxHash(transactionHash);
      return transactionHash;
    } catch (e: unknown) {
      console.error("Transaction failed:", e);
      throw e; // Re-throw to allow caller to handle the error
    } finally {
      // Always reset loading state, whether success or failure
      setIsLoading(false);
    }
  };

  /**
   * Resets the transaction state to initial values
   * Useful for clearing previous transaction data before new operations
   */
  const resetTransaction = () => {
    setTxHash(null);
    setIsLoading(false);
  };

  // Return the hook's public API
  return {
    isPending: isLoading, // Whether a transaction is currently in progress
    txHash, // Transaction hash of the last successful send (null if none)
    sendTransaction, // Function to initiate ETH transfer
    resetTransaction, // Function to reset the hook's state
  };
}
