interface ExternalServerKeyShare {
  chainName: string;
  keyShare: string;
}

interface WalletData {
  userId: string;
  walletId: string;
  address: string;
  password: string;
  externalServerKeyShares: ExternalServerKeyShare[];
  createdAt: Date;
}

// In-memory wallet storage (similar to user credentials)
const walletStore = new Map<string, WalletData>();

export const walletStorage = {
  // Get wallet by user ID
  getByUserId(userId: string): WalletData | undefined {
    return Array.from(walletStore.values()).find(
      (wallet) => wallet.userId === userId
    );
  },

  // Get wallet by address
  getByAddress(address: string): WalletData | undefined {
    return walletStore.get(address);
  },

  // Save wallet
  save(wallet: WalletData): void {
    walletStore.set(wallet.address, wallet);
  },

  // Check if user has wallet
  hasWallet(userId: string): boolean {
    return Array.from(walletStore.values()).some(
      (wallet) => wallet.userId === userId
    );
  },

  // Get all wallets (for debugging)
  getAll(): WalletData[] {
    return Array.from(walletStore.values());
  },
};
