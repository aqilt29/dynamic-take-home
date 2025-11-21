import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedEvmClient } from "@/lib/dynamic-client";
import { walletStorage } from "@/lib/wallet-store";
import { baseSepolia } from "viem/chains";
import { formatEther } from "viem";

interface RouteContext {
  params: Promise<{ address: string }>;
}

// GET /api/wallets/[address] - Get wallet details and balance
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const { address } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the wallet belongs to the user
    const wallet = walletStorage.getByAddress(address);

    if (!wallet || wallet.userId !== session.user.id) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Get wallet balance
    const evmClient = await getAuthenticatedEvmClient();

    const publicClient = evmClient.createViemPublicClient({
      chain: baseSepolia,
      rpcUrl: "https://sepolia.base.org",
    });

    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    return NextResponse.json({
      address: wallet.address,
      balance: formatEther(balance),
      balanceWei: balance.toString(),
      chain: baseSepolia.name,
      chainId: baseSepolia.id,
      createdAt: wallet.createdAt,
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet details" },
      { status: 500 }
    );
  }
}
