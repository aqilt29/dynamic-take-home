import { WalletCard } from "@/components/wallet-card";
import { SendTransaction } from "@/components/send-transaction";
import { auth } from "@/auth";
import { UserService, WalletService } from "@/services";
import { redirect } from "next/navigation";

export default async function Wallets() {
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
        <h2 className="text-2xl font-bold tracking-tight">Your Wallet</h2>
        <p className="text-muted-foreground">
          Manage your embedded wallet and send transactions
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <WalletCard
            wallet={walletWithBalance.wallet}
            balance={walletWithBalance.balance}
          />
        </div>
        <div className="space-y-6">
          <SendTransaction />
        </div>
      </div>
    </div>
  );
}
