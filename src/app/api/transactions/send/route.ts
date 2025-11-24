import { NextResponse } from "next/server";
import { auth } from "@/auth";

import {
  DynamicEvmWalletClient,
  createZerodevClient,
  createDelegatedEvmWalletClient,
} from "@dynamic-labs-wallet/node-evm";
import { ZeroDevKernelOptions } from "@/types/zerodev.types";
import { DYNAMIC_API_BASE } from "@/lib/constants";

// POST /api/transactions/send - Send a sponsored transaction using ZeroDev
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, value, walletAddress } = body;
    console.log("🚀 ~ POST ~ walletAddress:", walletAddress);

    // Validate required fields
    if (!to || !value || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: to, value, walletAddress" },
        { status: 400 }
      );
    }

    const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID;
    const authToken = process.env.DYNAMIC_AUTH_TOKEN;

    if (!environmentId || !authToken) {
      console.error("Missing Dynamic credentials");
      return NextResponse.json(
        { error: "Dynamic credentials not configured" },
        { status: 500 }
      );
    }
    const evmClient = new DynamicEvmWalletClient({
      environmentId,
    });

    await evmClient.authenticateApiToken(authToken);

    // Fetch wallet details to get externalServerKeyShares
    const createWalletUrl = `${DYNAMIC_API_BASE}/environments/${environmentId}/waas/create`;

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
      console.error("Failed to fetch wallet:", errorText);
      throw new Error(`Failed to fetch wallet: ${errorText}`);
    }

    const walletData = await walletResponse.json();

    const wallet = walletData.user.wallets?.[0];
    console.log("🚀 ~ POST ~ wallet:", wallet);

    if (!wallet) {
      throw new Error("No wallet found for user");
    }

    console.log("✅ Wallet found:", wallet.publicKey);
    console.log("🔑 Has key shares:", !!wallet.externalServerKeyShares);

    // Check for delegated materials first
    // TODO: Implement delegation storage to enable server-side signing
    const delegatedMaterials: {
      delegatedShare: string;
      walletApiKey: string;
      publicKey: string;
      chain: string;
    } | null = null;
    // const delegatedMaterials = await getDelegatedMaterials(
    //   session.user.email,
    //   wallet.id
    // );

    // create delegatedEVMClient
    const delegatedClient = createDelegatedEvmWalletClient({
      environmentId: environmentId,
      apiKey: authToken,
    });

    // Create ZeroDev client
    console.log("⚡ Creating ZeroDev client...");
    const zerodevClient = await createZerodevClient(delegatedClient);

    // Create kernel client with gas sponsorship enabled
    console.log("🔧 Creating kernel client with sponsorship...");

    const kernelClientOptions: ZeroDevKernelOptions = {
      address: walletAddress as `0x${string}`,
      networkId: "84532", // Base Sepolia chain ID
      withSponsorship: true,
      delegated: {
        delegatedClient,
        walletId: wallet.id,
        walletApiKey: "",
        keyShare: "",
      },
    };

    // Determine signing method
    if (delegatedMaterials) {
      console.log("✅ Using delegated materials for server-side signing");
      // console.log("   Chain:", delegatedMaterials.chain);
      // console.log("   Public Key:", delegatedMaterials.publicKey);
    } else if (wallet.externalServerKeyShares) {
      console.log("Using externalServerKeyShares for signing");
      kernelClientOptions.externalServerKeyShares =
        wallet.externalServerKeyShares;
    } else {
      console.log(
        "⚠️  No delegated materials or externalServerKeyShares available"
      );
      console.log(
        "   Server-side signing may fail - consider setting up delegation webhook"
      );
    }

    const kernelClient = await zerodevClient.createKernelClientForAddress(
      kernelClientOptions
    );

    // Send the sponsored transaction
    console.log("💸 Sending sponsored transaction...");
    const txHash = await kernelClient.sendTransaction({
      to: to as `0x${string}`,
      value: BigInt(value),
    });

    console.log("✅ Transaction sent successfully:", txHash);

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      message: "Transaction sent with gas sponsorship via ZeroDev",
    });
  } catch (error) {
    console.error("Transaction error:", error);

    // Provide helpful error messages
    let errorMessage = "Failed to send transaction";
    const errorDetails =
      error instanceof Error ? error.message : "Unknown error";

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
