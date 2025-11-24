"use client";

import { useEffect, useState } from "react";
import {
  IconExternalLink,
  IconArrowDown,
  IconArrowUp,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  type?: "external" | "internal";
}

interface TransactionHistoryProps {
  walletAddress: string;
}

export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call our server-side API route to keep API key secure
      const response = await fetch(`/api/transactions/${walletAddress}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      if (data.transactions) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatValue = (value: string) => {
    const eth = parseFloat(value) / 1e18;
    return eth.toFixed(7);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent transactions on Base Sepolia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent transactions on Base Sepolia</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent transactions on Base Sepolia
          {transactions.length > 0 && ` (${transactions.length} transactions)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No transactions yet. Your wallet is ready to use!
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>From/To</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isOutgoing =
                    tx.from.toLowerCase() === walletAddress.toLowerCase();
                  return (
                    <TableRow key={tx.hash}>
                      <TableCell>
                        <div className="flex justify-between gap-1">
                          <div className="flex items-center gap-2">
                            {isOutgoing ? (
                              <IconArrowUp className="size-4 text-red-500" />
                            ) : (
                              <IconArrowDown className="size-4 text-green-500" />
                            )}
                            <span className="text-xs font-medium">
                              {isOutgoing ? "Sent" : "Received"}
                            </span>
                          </div>
                          {tx.type && (
                            <span
                              className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 text-xs ${
                                tx.type === "internal"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                              }`}
                            >
                              {tx.type === "internal" ? "Internal" : "External"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{truncateHash(tx.hash)}</code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">
                          {isOutgoing
                            ? truncateAddress(tx.to)
                            : truncateAddress(tx.from)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {formatValue(tx.value)} ETH
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(tx.timeStamp)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            tx.isError === "0"
                              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                          }`}
                        >
                          {tx.isError === "0" ? "Success" : "Failed"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <IconExternalLink className="size-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
