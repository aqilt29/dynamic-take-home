import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

/**
 * Hook that syncs NextAuth authentication with Dynamic SDK
 * Automatically connects/disconnects wallet based on NextAuth session
 */
export function useDynamicAuthSync() {
  const { data: session, status } = useSession();
  console.log("🚀 ~ useDynamicAuthSync ~ session:", session);
  const { sdkHasLoaded, user, setShowAuthFlow } = useDynamicContext();

  useEffect(() => {
    // Wait for both NextAuth and Dynamic SDK to be ready
    if (!sdkHasLoaded || status === "loading") {
      return;
    }

    const syncAuth = async () => {
      // User is authenticated with NextAuth
      if (status === "authenticated" && session?.user?.email) {
        // If not authenticated with Dynamic, trigger auth flow
        if (!user) {
          console.log("NextAuth authenticated, connecting to Dynamic...");
          // Note: This will show Dynamic's embedded wallet creation/connection flow
          setShowAuthFlow(true);
        }
      }
    };

    syncAuth();
  }, [sdkHasLoaded, status, session, user, setShowAuthFlow]);

  return {
    isNextAuthAuthenticated: status === "authenticated",
    isDynamicAuthenticated: !!user,
    isSynced: status === "authenticated" && !!user,
  };
}
