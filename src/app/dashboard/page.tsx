import { WalletCard } from "@/components/wallet-card";

export default async function DashboardHome() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome</h2>
        <p className="text-muted-foreground">
          Your embedded wallet is ready to use instantly
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WalletCard />
      </div>
    </div>
  );
}
