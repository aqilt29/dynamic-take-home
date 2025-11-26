"use client";

import { IconWallet, IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletCardErrorProps {
  error: Error;
  resetError: () => void;
}

export function WalletCardError({ error, resetError }: WalletCardErrorProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <IconWallet className="size-5" />
          Wallet Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
          <IconAlertTriangle className="size-5 shrink-0 text-destructive" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-destructive">
              Failed to load wallet information
            </p>
            <p className="text-xs text-muted-foreground">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={resetError}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <IconRefresh className="mr-2 size-4" />
            Retry
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
