"use client";

import { useEffect, useState } from "react";
import {
  IconWallet,
  IconCopy,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletData {
  address: string;
  walletId: string;
  balance?: string;
  chain?: string;
  isNew: boolean;
}

export function WalletCard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrCreateWallet();
  }, []);

  const fetchOrCreateWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch or create wallet
      const walletResponse = await fetch("/api/wallets");
      if (!walletResponse.ok) {
        throw new Error("Failed to fetch wallet");
      }
      const walletData = await walletResponse.json();

      // Fetch wallet balance
      const balanceResponse = await fetch(`/api/wallets/${walletData.address}`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setWallet({
          ...walletData,
          balance: balanceData.balance,
          chain: balanceData.chain,
        });
      } else {
        setWallet(walletData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (wallet?.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWallet className="size-5" />
            Your Wallet
          </CardTitle>
          <CardDescription>
            Loading your pre-generated wallet...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <IconAlertCircle className="size-5" />
            Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchOrCreateWallet} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconWallet className="size-5" />
          Your Embedded Wallet
        </CardTitle>
        <CardDescription>
          {wallet?.isNew
            ? "✨ Your wallet was instantly created and is ready to use!"
            : "Your pre-generated wallet"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {wallet?.address ? truncateAddress(wallet.address) : "Loading..."}
            </code>
            <Button
              size="icon"
              variant="outline"
              onClick={copyAddress}
              title="Copy address"
            >
              {copied ? (
                <IconCheck className="size-4" />
              ) : (
                <IconCopy className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance */}
        {wallet?.balance !== undefined && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Balance
            </label>
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-2xl font-bold">{wallet.balance} ETH</p>
              <p className="text-xs text-muted-foreground">{wallet.chain}</p>
            </div>
          </div>
        )}

        {/* Account Abstraction Info */}
        <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            💡 Account Abstraction Enabled
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Your wallet uses account abstraction, which means you don&apos;t
            need to worry about gas fees or managing private keys. Transactions
            are simplified and secured automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
