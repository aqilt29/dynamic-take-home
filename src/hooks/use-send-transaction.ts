import { useState } from "react";
import {
  useDynamicContext,
  isEthereumWallet,
  isZeroDevConnector,
} from "@/lib/dynamic";
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
 */
export function useSendTransaction() {
  // Get the user's primary wallet from Dynamic's context
  const { primaryWallet } = useDynamicContext();
  console.log("🚀 ~ useSendTransaction ~ primaryWallet:", primaryWallet);

  // Track loading state during transaction
  const [isLoading, setIsLoading] = useState(false);
  // Store the transaction hash after successful send
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Sends ETH to a recipient using gasless transactions
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

      // Ensure we have a valid Ethereum wallet connected
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        throw new Error("Wallet not connected or not EVM compatible");
      }

      // Get the wallet client to interact with the blockchain
      const walletClient = await primaryWallet.getWalletClient();

      // Convert ETH amount to Wei
      const valueInWei = parseEther(value);

      // Send the transaction
      // This creates a user operation that will be sponsored (gasless)
      const operationHash = await walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: valueInWei,
      });

      // Get the ZeroDev connector to access account abstraction features
      const connector = primaryWallet.connector;
      if (!connector || !isZeroDevConnector(connector)) {
        throw new Error("Connector is not a ZeroDev connector");
      }

      // Get the kernel client (ZeroDev's account abstraction provider)
      const kernelClient = connector.getAccountAbstractionProvider();
      if (!kernelClient) throw new Error("Kernel client not found");

      // Wait for the user operation to be processed and get the receipt
      // This is different from regular transactions as it's a user operation
      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: operationHash,
      });

      // Store the transaction hash for UI display and return it
      const transactionHash = receipt.receipt.transactionHash;
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
