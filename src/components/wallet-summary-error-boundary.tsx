"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconRefresh,
  IconWallet,
} from "@tabler/icons-react";

interface WalletErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function WalletErrorFallback({
  error,
  resetError,
}: WalletErrorFallbackProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconWallet className="size-5 text-muted-foreground" />
          <CardTitle>Wallet Unavailable</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
          <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Failed to load wallet</p>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "An unexpected error occurred while loading your wallet information."}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetError}
            className="flex-1"
          >
            <IconRefresh className="mr-2 size-4" />
            Retry
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Refresh Page
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="rounded-md bg-muted p-3">
            <summary className="cursor-pointer text-xs font-semibold">
              Debug Info
            </summary>
            <pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
