import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedEvmClient } from "@/lib/dynamic-client";
import { walletStorage } from "@/lib/wallet-store";
import { ThresholdSignatureScheme } from "@dynamic-labs-wallet/core";

// GET /api/wallets - Get or create wallet for authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a wallet
    const existingWallet = walletStorage.getByUserId(session.user.id);

    if (existingWallet) {
      return NextResponse.json({
        address: existingWallet.address,
        createdAt: existingWallet.createdAt,
        isNew: false,
      });
    }

    // Create new pre-generated wallet
    const evmClient = await getAuthenticatedEvmClient();

    // Generate a password for the wallet (in production, this should be more secure)
    const password = `wallet-${session.user.id}-${Date.now()}`;

    const evmWallet = await evmClient.createWalletAccount({
      thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
      password,
      onError: (error: Error) => {
        console.error("EVM wallet creation error:", error);
        throw error;
      },
      backUpToClientShareService: true,
    });

    // Store wallet information with key shares
    const walletData = {
      userId: session.user.id,
      walletId: evmWallet.walletId,
      address: evmWallet.accountAddress,
      password,
      externalServerKeyShares: evmWallet.externalServerKeyShares || [],
      createdAt: new Date(),
    };

    walletStorage.save(walletData);

    return NextResponse.json({
      address: evmWallet.accountAddress,
      walletId: evmWallet.walletId,
      createdAt: walletData.createdAt,
      isNew: true,
    });
  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
