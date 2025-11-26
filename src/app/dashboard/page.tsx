import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserService, WalletService } from "@/services";

import { UserWalletSummary } from "@/components/user-wallet-summary";
import { TransactionHistory } from "@/components/transaction-history";

export default async function DashboardHome() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const user = await UserService.getByEmail(session.user.email);
  if (!user) redirect("/signup");

  const walletWithBalance = await WalletService.listByUserIdWithBalances(
    user.id
  );

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
        <UserWalletSummary {...walletWithBalance} user={user} />

        {/* Transaction History */}
        <TransactionHistory
          walletAddress={walletWithBalance.wallet.accountAddress}
        />
      </div>
    </div>
  );
}
