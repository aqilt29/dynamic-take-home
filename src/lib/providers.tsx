"use client";

import { SessionProvider } from "next-auth/react";
import {
  DynamicContextProvider,
  EthereumWalletConnectors,
  ZeroDevSmartWalletConnectors,
} from "@/lib/dynamic";
import { DynamicAuthBridge } from "@/components/dynamic-auth-bridge";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      theme="light"
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [
          EthereumWalletConnectors,
          ZeroDevSmartWalletConnectors,
        ],
      }}
    >
      <SessionProvider>
        <DynamicAuthBridge />
        {children}
      </SessionProvider>
    </DynamicContextProvider>
  );
}
