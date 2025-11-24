"use client";

import { useEffect, useState } from "react";
import { UserWalletSummary } from "@/components/user-wallet-summary";
import { TransactionHistory } from "@/components/transaction-history";

export default function DashboardHome() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // useEffect(() => {
  //   // Fetch wallet address for transaction history
  //   const fetchUser = async () => {
  //     try {
  //       const response = await fetch("/api/user");
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log("🚀 ~ fetchUser ~ data:", data);
  //         setWalletAddress(data.address);
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch wallet:", err);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your embedded wallet dashboard
        </p>
      </div>

      <div className="space-y-6">
        {/* User Summary Card */}
        {/* <UserWalletSummary /> */}

        {/* Transaction History */}
        {/* {walletAddress && <TransactionHistory walletAddress={walletAddress} />} */}
      </div>
    </div>
  );
}
