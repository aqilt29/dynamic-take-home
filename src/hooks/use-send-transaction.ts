import { useState, useCallback, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { parseEther, isAddress, getAddress } from "viem";

/**
 * Configuration options for sending transactions
 */
export interface SendTransactionOptions {
  to: string;
  value: string;
  data?: `0x${string}`;
}

/**
 * Transaction result with enhanced metadata
 */
export interface TransactionResult {
  transactionHash: string;
  timestamp: number;
  to: string;
  value: string;
}

/**
 * Hook state
 */
interface TransactionState {
  isPending: boolean;
  txHash: string | null;
  error: Error | null;
  lastTransaction: TransactionResult | null;
}

/**
 * Enhanced custom hook for sending ETH using ZeroDev gasless transactions
 */
export function useSendTransaction() {
  const [state, setState] = useState<TransactionState>({
    isPending: false,
    txHash: null,
    error: null,
    lastTransaction: null,
  });

  // Cache wallet address to avoid repeated fetches
  const walletAddressCache = useRef<string | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Prevent multiple simultaneous transactions
  const isExecutingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Safe state update that only runs if component is mounted
   */
  const safeSetState = useCallback((updater: Partial<TransactionState>) => {
    if (isMounted.current) {
      setState((prev) => ({ ...prev, ...updater }));
    }
  }, []);

  /**
   * Validate Ethereum address with checksum verification
   */
  const validateAddress = useCallback((address: string): string => {
    if (!address) {
      throw new Error("Recipient address is required");
    }

    if (!isAddress(address)) {
      throw new Error(
        "Invalid Ethereum address format. Please check and try again."
      );
    }

    // Convert to checksummed address
    return getAddress(address);
  }, []);

  /**
   * Validate transaction amount
   */
  const validateAmount = useCallback((value: string): bigint => {
    if (!value || value.trim() === "") {
      throw new Error("Amount is required");
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      throw new Error("Amount must be a valid number");
    }

    if (numValue <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Set a reasonable max limit (e.g., 100 ETH on testnet)
    if (numValue > 100) {
      throw new Error("Amount exceeds maximum limit of 100 ETH");
    }

    try {
      return parseEther(value);
    } catch (error) {
      throw new Error("Invalid amount format. Please use a valid ETH amount.");
    }
  }, []);

  /**
   * Fetch wallet address with caching
   */
  const getWalletAddress = useCallback(async (): Promise<string> => {
    // Return cached address if available
    if (walletAddressCache.current) {
      return walletAddressCache.current;
    }

    const response = await fetch("/api/wallets");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch wallet: ${errorText}`);
    }

    const {
      data: { address },
    } = await response.json();

    if (!address) {
      throw new Error(
        "No wallet address found. Please ensure you have a wallet."
      );
    }

    // Cache the address
    walletAddressCache.current = address;
    return address;
  }, []);

  /**
   * Sends ETH to a recipient using gasless transactions
   *
   */
  const sendTransaction = useCallback(
    async (options: SendTransactionOptions): Promise<string> => {
      try {
        // Validate FIRST (synchronous, fails fast)
        const checksummedAddress = validateAddress(options.to);
        const valueInWei = validateAmount(options.value);

        // Check if already executing AFTER validation passes
        if (isExecutingRef.current) {
          throw new Error("A transaction is already in progress. Please wait.");
        }

        // Set lock
        isExecutingRef.current = true;

        // Force immediate render with flushSync to show loading state
        // This ensures the UI updates before any async operations
        flushSync(() => {
          if (isMounted.current) {
            setState((prev) => ({
              ...prev,
              isPending: true,
              error: null,
              txHash: null,
            }));
          }
        });

        const walletAddress = await getWalletAddress();

        const response = await fetch("/api/transactions/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: checksummedAddress,
            value: valueInWei.toString(),
            walletAddress,
            data: options.data,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.details || errorData.error || "Transaction failed"
          );
        }

        const {
          data: { success, transactionHash },
        } = await response.json();

        if (!success) {
          throw new Error("No transaction hash returned from server");
        }

        const txResult: TransactionResult = {
          transactionHash,
          timestamp: Date.now(),
          to: checksummedAddress,
          value: options.value,
        };

        safeSetState({
          isPending: false,
          txHash: transactionHash,
          lastTransaction: txResult,
          error: null,
        });

        return transactionHash;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Transaction failed";

        safeSetState({
          isPending: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        });

        console.error("Transaction failed:", error);
        throw error;
      } finally {
        isExecutingRef.current = false;
      }
    },
    [validateAddress, validateAmount, getWalletAddress, safeSetState]
  );
  /**
   * Reset transaction state
   */
  const resetTransaction = useCallback(() => {
    safeSetState({
      isPending: false,
      txHash: null,
      error: null,
      lastTransaction: null,
    });
  }, [safeSetState]);

  /**
   * Clear wallet cache (useful after wallet changes)
   */
  const clearWalletCache = useCallback(() => {
    walletAddressCache.current = null;
  }, []);

  return {
    // State
    isPending: state.isPending,
    txHash: state.txHash,
    error: state.error,
    lastTransaction: state.lastTransaction,

    // Actions
    sendTransaction,
    resetTransaction,
    clearWalletCache,
  };
}
