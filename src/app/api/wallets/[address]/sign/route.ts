import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedEvmClient } from "@/lib/dynamic";
import { baseSepolia } from "viem/chains";
import { parseEther } from "viem";

interface RouteContext {
  params: Promise<{ address: string }>;
}

// POST /api/wallets/[address]/sign - Sign a transaction
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const { address } = await context.params;
    const body = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, value } = body;

    if (!to || !value) {
      return NextResponse.json(
        { error: "Missing required fields: to, value" },
        { status: 400 }
      );
    }

    // Initialize clients
    const evmClient = await getAuthenticatedEvmClient();

    const publicClient = evmClient.createViemPublicClient({
      chain: baseSepolia,
      rpcUrl: "https://sepolia.base.org",
    });

    // Prepare transaction
    const transactionRequest = {
      to: to as `0x${string}`,
      value: parseEther(value),
    };

    const tx = await publicClient.prepareTransactionRequest({
      ...transactionRequest,
      chain: baseSepolia,
      account: address as `0x${string}`,
    });

    // TODO: Implement transaction signing with Dynamic's key management
    // This requires fetching externalServerKeyShares from Dynamic's API
    // or using delegated signing approach

    return NextResponse.json(
      {
        error: "Transaction signing not yet implemented",
        message:
          "Server-side transaction signing requires additional key management setup",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Transaction signing error:", error);
    return NextResponse.json(
      {
        error: "Failed to sign transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
