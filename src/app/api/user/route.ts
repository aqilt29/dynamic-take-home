/**
 * GET /api/user
 * Returns the current authenticated user's information
 */

import { withAuth, apiSuccess, CommonErrors, validateDynamicConfig } from "@/lib/api";
import { getUserByEmail } from "@/lib/users";

export const GET = withAuth(async (req, { session }) => {
  // Validate environment configuration
  validateDynamicConfig();

  // Fetch user from database
  const user = await getUserByEmail(session.user.email);

  if (!user) {
    return CommonErrors.notFound("User not found");
  }

  console.log("✅ User retrieved:", user.email);

  return apiSuccess(user);
});
