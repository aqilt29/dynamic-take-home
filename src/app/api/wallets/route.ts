import { UserService } from "@/services/user.service";
import { WalletService } from "@/services/wallet.service";
import {
  withAuth,
  apiSuccess,
  CommonErrors,
  validateDynamicConfig,
} from "@/lib/api";

/**
 * GET /api/wallets - Get authenticated user's wallet
 */
export const GET = withAuth(async (_, { session }) => {
  validateDynamicConfig();
  try {
    // Get user from database
    const user = await UserService.getByEmail(session.user.email);

    if (!user) {
      return CommonErrors.notFound("User not found");
    }

    // Get wallet for user
    const wallet = await WalletService.walletByUserId(user.id);

    if (!wallet) {
      return CommonErrors.notFound(
        `Failed to fetch wallet for user: ${user.id}`
      );
    }

    return apiSuccess({
      address: wallet.accountAddress,
      publicKey: wallet.publicKeyHex,
      walletId: wallet.walletId,
    });
  } catch (error) {
    console.error("Failed to fetch wallet:", error);

    return CommonErrors.internalError("Failed to fetch wallet");
  }
});
