"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { IconWallet, IconCopy, IconCheck } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface WalletData {
  address: string;
  walletId: string;
  isNew: boolean;
}

export function UserWalletSummary() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallets");
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-lg">
              {getInitials(session?.user?.name, session?.user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {session?.user?.name && (
              <p className="text-lg font-semibold">{session.user.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {session?.user?.email}
            </p>
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
                {wallet.address}
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
