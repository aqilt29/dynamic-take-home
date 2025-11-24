/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { baseSepolia } from "viem/chains";
import { formatEther, createPublicClient, http } from "viem";

interface RouteContext {
  params: Promise<{ address: string }>;
}

// GET /api/wallets/[address] - Get wallet details and balance
// @ts-expect-error
export async function GET(_, context: RouteContext) {
  try {
    const session = await auth();
    const { address } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get wallet balance from blockchain using viem
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });

    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    return NextResponse.json({
      address,
      balance: formatEther(balance),
      balanceWei: balance.toString(),
      chain: baseSepolia.name,
      chainId: baseSepolia.id,
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet details" },
      { status: 500 }
    );
  }
}
