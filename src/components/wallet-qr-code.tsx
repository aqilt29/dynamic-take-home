"use client";

import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";

export default function WalletQR({
  accountAddress,
  className,
}: {
  accountAddress: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <QRCode
        value={accountAddress}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      />
    </div>
  );
}
