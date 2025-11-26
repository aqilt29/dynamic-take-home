/**
 * GET /api/user
 * Returns the current authenticated user's information
 */

import {
  withAuth,
  apiSuccess,
  CommonErrors,
  validateDynamicConfig,
} from "@/lib/api";
import { UserService } from "@/services";

export const GET = withAuth(async (req, { session }) => {
  // Validate environment configuration
  validateDynamicConfig();

  // Fetch user from database
  const user = await UserService.getByEmail(session.user.email);

  if (!user) {
    return CommonErrors.notFound("User not found");
  }

  return apiSuccess(user);
});
