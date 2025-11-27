import {
  withAuth,
  apiSuccess,
  CommonErrors,
  validateDynamicConfig,
} from "@/lib/api";
import { zerodevService } from "@/services";

// POST /api/transactions/send - Send a sponsored transaction using ZeroDev
export const POST = withAuth(async (req, { session }) => {
  // Validate environment configuration
  validateDynamicConfig();

  const { to, value, walletAddress } = await req.json();

  try {
    const txData = await zerodevService.sendSponsoredTransaction({
      to,
      value,
      walletAddress,
      userEmail: session.user.email,
    });

    return apiSuccess(txData);
  } catch (error) {
    console.log("🚀 ~ route.ts:32 ~ error:", error);
    return CommonErrors.internalError(`Error sending tx`);
  }
});
