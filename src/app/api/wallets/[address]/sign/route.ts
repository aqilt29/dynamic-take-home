import { NextResponse } from "next/server";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{ address: string }>;
}

// POST /api/wallets/[address]/sign - Sign a transaction
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    await context.params;
    await request.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement transaction signing with Dynamic's key management
    // This requires fetching externalServerKeyShares from Dynamic's API
    // or using delegated signing approach

    return NextResponse.json(
      {
        error: "Transaction signing not yet implemented",
        message:
          "Use /api/transactions/send for sending transactions with gas sponsorship",
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
