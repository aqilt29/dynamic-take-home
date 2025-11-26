export default function Loading() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your Wallet</h2>
        <p className="text-muted-foreground">Loading your embedded wallet...</p>
        <div className="flex items-center justify-center py-8">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    </div>
  );
}
