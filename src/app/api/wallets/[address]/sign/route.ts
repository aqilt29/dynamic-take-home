import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedEvmClient } from "@/lib/dynamic-client";
import { walletStorage } from "@/lib/wallet-store";
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

    // Verify the wallet belongs to the user
    const wallet = walletStorage.getByAddress(address);

    if (!wallet || wallet.userId !== session.user.id) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
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

    // Sign transaction with external server key shares
    const signedTx = await evmClient.signTransaction({
      senderAddress: address,
      transaction: tx,
      password: wallet.password,
      externalServerKeyShares: wallet.externalServerKeyShares,
    });

    // Send transaction
    const txHash = await publicClient.sendRawTransaction({
      serializedTransaction: signedTx as `0x${string}`,
    });

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
    });
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
