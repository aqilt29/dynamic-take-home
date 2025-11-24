"use client";

import { useState } from "react";
import { IconSend, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSendTransaction } from "@/hooks/use-send-transaction";

export function SendTransaction() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { sendTransaction, isPending } = useSendTransaction();

  const handleSendTransaction = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validate inputs
      if (!recipientAddress || !amount) {
        setError("Please fill in all fields");
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Invalid amount");
        return;
      }

      console.log("Sending transaction:", {
        to: recipientAddress,
        value: amount,
      });

      // Send transaction using the hook
      const txHash = await sendTransaction({
        to: recipientAddress,
        value: amount,
      });

      setSuccess(`Transaction sent! Hash: ${txHash}`);
      setRecipientAddress("");
      setAmount("");
    } catch (err) {
      console.error("Transaction error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send transaction"
      );
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconSend className="size-5" />
          Send ETH
        </CardTitle>
        <CardDescription>
          Send Base Sepolia ETH with gas sponsorship via ZeroDev
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
          />
        </div>

        {/* Gas Sponsorship Info */}
        <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3">
          <p className="text-xs text-green-800 dark:text-green-200">
            ⚡ Gas fees are sponsored - you don&apos;t need to pay for gas!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <IconAlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <IconCheck className="size-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200 wrap-anywhere">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendTransaction}
          disabled={isPending || !recipientAddress || !amount}
          className="w-full"
        >
          {isPending ? (
            <>
              <div className="mr-2 size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <IconSend className="mr-2 size-4" />
              Send Transaction
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
