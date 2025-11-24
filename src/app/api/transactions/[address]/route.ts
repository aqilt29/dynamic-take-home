/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { TransactionType } from "viem";

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
    const chainId = "84532"; // Base Sepolia

    console.log("Fetching transactions for address:", address);

    // Helper function to delay execution
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Fetch external transactions first
    const externalTxUrl = `${API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${API_KEY}&chainid=${chainId}`;

    console.log("Fetching external transactions...");
    const externalResponse = await fetch(externalTxUrl);

    if (!externalResponse.ok) {
      throw new Error("Failed to fetch external transactions from Basescan");
    }

    const externalData = await externalResponse.json();
    console.log(
      "External transactions fetched:",
      externalData.result?.length || 0
    );

    // Wait 2 seconds before making the next API call to avoid rate limits
    console.log("Waiting 2 seconds before fetching internal transactions...");
    await delay(2000);

    // Fetch internal transactions
    const internalTxUrl = `${API_URL}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${API_KEY}&chainid=${chainId}`;

    console.log("Fetching internal transactions...");
    const internalResponse = await fetch(internalTxUrl);

    if (!internalResponse.ok) {
      throw new Error("Failed to fetch internal transactions from Basescan");
    }

    const internalData = await internalResponse.json();
    console.log(
      "Internal transactions fetched:",
      internalData.result?.length || 0
    );

    // Combine both transaction types
    const externalTransactions: TransactionType[] =
      externalData.status === "1" && externalData.result
        ? externalData.result
        : [];
    const internalTransactions: TransactionType[] =
      internalData.status === "1" && internalData.result
        ? internalData.result
        : [];

    // Add a type flag to distinguish between external and internal transactions
    const allTransactions = [
      ...externalTransactions.map((tx) => ({
        // @ts-ignore
        ...tx,
        type: "external",
      })),
      ...internalTransactions.map((tx) => ({
        // @ts-ignore
        ...tx,
        type: "internal",
      })),
    ];

    // Sort by timestamp (most recent first)
    allTransactions.sort(
      (a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp)
    );

    console.log("Total transactions combined:", allTransactions.length);

    return NextResponse.json({
      transactions: allTransactions,
      count: allTransactions.length,
      external: externalTransactions.length,
      internal: internalTransactions.length,
    });
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
