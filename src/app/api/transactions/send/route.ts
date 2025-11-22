import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedEvmClient } from "@/lib/dynamic";
import { createZerodevClient } from "@dynamic-labs-wallet/node-evm";

// POST /api/transactions/send - Send a sponsored transaction using ZeroDev
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, value, walletAddress } = body;

    // Validate required fields
    if (!to || !value || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: to, value, walletAddress" },
        { status: 400 }
      );
    }

    console.log("Sending transaction:", { to, value, from: walletAddress });

    // Get authenticated EVM client
    const evmClient = await getAuthenticatedEvmClient();

    // Fetch wallet details to get externalServerKeyShares
    const DYNAMIC_API_BASE = "https://app.dynamic.xyz/api/v0";
    const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID;
    const authToken = process.env.DYNAMIC_AUTH_TOKEN;

    const createWalletUrl = `${DYNAMIC_API_BASE}/environments/${environmentId}/waas/create`;

    console.log("Fetching wallet with key shares for:", session.user.email);
    const walletResponse = await fetch(createWalletUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: session.user.email,
        type: "email",
        chains: ["EVM"],
        environmentId: environmentId,
      }),
    });

    if (!walletResponse.ok) {
      const errorText = await walletResponse.text();
      throw new Error(`Failed to fetch wallet: ${errorText}`);
    }

    const walletData = await walletResponse.json();

    const wallet = walletData.user.wallets?.[0];
    console.log(
      "🚀 ~ POST ~ Full wallet object:",
      JSON.stringify(wallet, null, 2)
    );

    if (!wallet) {
      throw new Error("No wallet found for user");
    }

    // Create ZeroDev client
    console.log("Creating ZeroDev client...");
    const zerodevClient = await createZerodevClient(evmClient);

    // Create kernel client with gas sponsorship enabled
    console.log("Creating kernel client with sponsorship...");

    // Attempt to create kernel client
    // Note: externalServerKeyShares might not be needed if Dynamic handles signing internally
    console.log("Creating kernel client for address:", walletAddress);

    const kernelClientOptions: any = {
      address: walletAddress as `0x${string}`,
      networkId: "84532", // Base Sepolia chain ID
      withSponsorship: true,
    };

    // Include externalServerKeyShares if available
    if (wallet.externalServerKeyShares) {
      console.log("Using externalServerKeyShares for signing");
      kernelClientOptions.externalServerKeyShares =
        wallet.externalServerKeyShares;
    } else {
      console.log(
        "No externalServerKeyShares - attempting to create client without them"
      );
      console.log(
        "Dynamic may handle signing through their MPC infrastructure"
      );
    }

    const kernelClient = await zerodevClient.createKernelClientForAddress(
      kernelClientOptions
    );

    // Send the sponsored transaction
    console.log("Sending sponsored transaction...");
    const txHash = await kernelClient.sendTransaction({
      to: to as `0x${string}`,
      value: BigInt(value),
    });

    console.log("Transaction sent successfully:", txHash);

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      message: "Transaction sent with gas sponsorship via ZeroDev",
    });
  } catch (error) {
    console.error("Transaction error:", error);

    // Provide helpful error messages
    let errorMessage = "Failed to send transaction";
    let errorDetails = error instanceof Error ? error.message : "Unknown error";

    if (errorDetails.includes("sponsorship")) {
      errorMessage = "Gas sponsorship failed - check ZeroDev configuration";
    } else if (errorDetails.includes("insufficient")) {
      errorMessage = "Insufficient balance or gas";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
