import { NextResponse } from "next/server";
import { auth } from "@/auth";

const DYNAMIC_API_BASE = "https://app.dynamic.xyz/api/v0";

// GET /api/wallets - Get or create pre-generated wallet for authenticated user
export async function GET() {
  try {
    const session = await auth();
    console.log("Session user email:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Create or retrieve pre-generated wallet using the correct endpoint
    // This endpoint handles both creation and retrieval based on the identifier (email)
    const createWalletUrl = `${DYNAMIC_API_BASE}/environments/${environmentId}/waas/create`;

    console.log("Creating/retrieving pre-generated wallet for:", session.user.email);
    console.log("Using endpoint:", createWalletUrl);

    const response = await fetch(createWalletUrl, {
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

    const responseText = await response.text();
    console.log("Response status:", response.status);
    console.log("Response body:", responseText);

    if (!response.ok) {
      console.error("Wallet operation failed:", response.status, responseText);

      // If wallet already exists, this might return a specific error
      // We'll need to handle that case
      if (response.status === 400 || response.status === 409) {
        console.log("Wallet might already exist - attempting alternative retrieval");
        // TODO: Implement alternative retrieval method if needed
      }

      throw new Error(`Failed to create/retrieve wallet: ${responseText}`);
    }

    const walletData = JSON.parse(responseText);
    console.log("Wallet data received:", walletData);

    // Parse the response - wallet data is nested in user object
    const user = walletData.user;
    const wallet = user.wallets && user.wallets.length > 0 ? user.wallets[0] : null;

    if (!wallet) {
      throw new Error("No wallet found in response");
    }

    const isNew = response.status === 201; // 201 = created, 200 = existing

    return NextResponse.json({
      address: wallet.publicKey,
      walletId: wallet.id,
      createdAt: user.createdAt,
      isNew: isNew,
      email: user.email,
    });
  } catch (error) {
    console.error("Wallet operation error:", error);
    return NextResponse.json(
      {
        error: "Failed to get or create wallet",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
