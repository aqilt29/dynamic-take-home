import { NextResponse } from "next/server";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{ address: string }>;
}

// GET /api/transactions/[address] - Get transaction history for a wallet
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const { address } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const API_KEY = process.env.BASESCAN_API_KEY;
    if (!API_KEY) {
      console.error("BASESCAN_API_KEY not configured");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Base Sepolia Basescan API
    const API_URL = "https://api.etherscan.io/v2/api";
    const url = `${API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}&chainid=84532`;

    https: console.log("Fetching transactions for address:", address);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch transactions from Basescan");
    }

    const data = await response.json();
    console.log("🚀 ~ GET ~ data:", data);

    if (data.status === "1" && data.result) {
      return NextResponse.json({
        transactions: data.result,
        count: data.result.length,
      });
    } else {
      return NextResponse.json({
        transactions: [],
        count: 0,
      });
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
