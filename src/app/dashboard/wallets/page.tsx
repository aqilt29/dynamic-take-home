import { WalletCard } from "@/components/wallet-card";

export default async function Wallets() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your Wallet</h2>
        <p className="text-muted-foreground">
          Manage your embedded wallet and view details
        </p>
      </div>
      <div className="max-w-2xl">
        <WalletCard />
      </div>
    </div>
  );
}
