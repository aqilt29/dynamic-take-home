"use client";

import { useState } from "react";
import { IconWallet, IconCopy, IconCheck } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DBWallet } from "@/types/wallet.types";
import { WalletBalance } from "@/lib/clients";
import WalletQR from "./wallet-qr-code";
import { ErrorBoundary } from "@/components/error-boundary";
import { WalletCardError } from "@/components/wallet-card-error";

interface WalletCardProps {
  wallet: DBWallet;
  balance?: WalletBalance | null;
  isNew?: boolean;
}

// Internal component without error boundary
function WalletCardContent({ wallet, balance }: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (wallet?.accountAddress) {
      await navigator.clipboard.writeText(wallet.accountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <div className="flex items-center gap-2">
            <IconWallet className="size-5" />
            Your Embedded Wallet
          </div>
          <WalletQR className="w-1/3" accountAddress={wallet.accountAddress} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {wallet?.accountAddress ? wallet.accountAddress : "Loading..."}
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
        {balance && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Balance
            </label>
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-2xl font-bold">{balance.balance}</p>
              <p className="text-xs text-muted-foreground">{balance.chain}</p>
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

// Exported component with built-in error boundary
export function WalletCard(props: WalletCardProps) {
  const [errorResetKey, setErrorResetKey] = useState(0);

  const handleReset = () => {
    setErrorResetKey((prev) => prev + 1);
  };

  return (
    <ErrorBoundary
      key={errorResetKey}
      fallback={
        <WalletCardError
          error={new Error("Unable to load wallet card")}
          resetError={handleReset}
        />
      }
      onError={(error, errorInfo) => {
        console.error("Wallet card error:", error, errorInfo);
      }}
    >
      <WalletCardContent {...props} />
    </ErrorBoundary>
  );
}
