/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  withAuth,
  apiSuccess,
  CommonErrors,
  validateDynamicConfig,
} from "@/lib/api";
import { UserService, WalletService } from "@/services";
import { basescanClient } from "@/lib/clients";

// GET /api/transactions/[address] - Get transaction history for a wallet
export const GET = withAuth(async (_, { session }) => {
  validateDynamicConfig();

  const user = await UserService.getByEmail(session.user.email);

  if (!user) {
    return CommonErrors.notFound("User not found");
  }

  // Get wallet for user
  const wallet = await WalletService.walletByUserId(user.id);

  if (!wallet) {
    return CommonErrors.notFound(`Failed to fetch wallet for user: ${user.id}`);
  }

  try {
    const { transactions } = await basescanClient.getAllTransactions(
      wallet.accountAddress
    );

    return apiSuccess(transactions);
  } catch (error) {
    console.log("🚀 ~ route.ts:36 ~ error:", error);

    return CommonErrors.serviceUnavailable("Basescan API Error");
  }
});
