"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

/**
 * Bridge component that connects NextAuth session to Dynamic SDK
 * Automatically shows Dynamic's wallet connection after NextAuth login
 */
export function DynamicAuthBridge() {
  const { data: session, status } = useSession();
  const { setShowAuthFlow, primaryWallet, handleLogOut, sdkHasLoaded } =
    useDynamicContext();
  const [hasTriggeredAuth, setHasTriggeredAuth] = useState(false);

  useEffect(() => {
    // Wait for Dynamic SDK to load
    if (!sdkHasLoaded) return;

    const connectWallet = async () => {
      // Only proceed if:
      // 1. User is authenticated with NextAuth
      // 2. No wallet is connected yet
      // 3. Haven't triggered auth flow already
      if (
        status === "authenticated" &&
        session?.user?.email &&
        !primaryWallet &&
        !hasTriggeredAuth
      ) {
        console.log(
          "User authenticated with NextAuth, connecting Dynamic wallet..."
        );
        // Mark as triggered to prevent loops
        setHasTriggeredAuth(true);

        // Small delay to ensure UI is ready
        setTimeout(() => {
          setShowAuthFlow(true);
        }, 500);
      }
    };

    connectWallet();
  }, [
    status,
    session,
    primaryWallet,
    setShowAuthFlow,
    hasTriggeredAuth,
    sdkHasLoaded,
  ]);

  // Handle logout - disconnect from Dynamic when NextAuth session ends
  useEffect(() => {
    if (status === "unauthenticated" && primaryWallet) {
      console.log("NextAuth session ended, disconnecting Dynamic wallet...");
      handleLogOut();
      setHasTriggeredAuth(false);
    }
  }, [status, primaryWallet, handleLogOut]);

  // Reset trigger flag when wallet connects
  useEffect(() => {
    if (primaryWallet && hasTriggeredAuth) {
      console.log("Dynamic wallet connected successfully");
    }
  }, [primaryWallet, hasTriggeredAuth]);

  return null; // This is a logic-only component
}
