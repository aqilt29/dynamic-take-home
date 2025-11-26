"use client";

import { useState } from "react";
import {
  IconWallet,
  IconCopy,
  IconCheck,
  IconCoin,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoredUser } from "@/types/users.types";
import { DBWallet } from "@/types/wallet.types";
import { WalletBalance } from "@/lib/clients";

export function UserWalletSummary({
  wallet,
  user,
  balance = null,
}: {
  wallet: DBWallet;
  user: StoredUser;
  balance?: WalletBalance | null;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (wallet.accountAddress) {
      await navigator.clipboard.writeText(wallet.accountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex w-full items-start justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.name || user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {user?.name && (
                <p className="text-lg font-semibold">{user.name}</p>
              )}
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCoin className="size-4" />
              <span>Balance</span>
            </div>
            {balance ? (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {balance.balance}
                </p>
                <p className="text-xs text-muted-foreground">
                  {balance.chain}
                </p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Info */}
        {wallet && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconWallet className="size-4" />
              <span>Wallet Address</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
                {wallet.accountAddress}
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
        )}
      </CardContent>
    </Card>
  );
}
