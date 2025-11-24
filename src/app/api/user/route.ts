import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/users";

const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID || "";
const authToken = process.env.DYNAMIC_AUTH_TOKEN || "";

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!environmentId || !authToken) {
    console.error("Missing Dynamic credentials");
    return NextResponse.json(
      { error: "Dynamic credentials not configured" },
      { status: 500 }
    );
  }

  const userEmail = session.user.email;

  try {
    const existingUser = await getUserByEmail(userEmail);
    console.log("🚀 ~ GET ~ existingUser:", existingUser);

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("User lookup failed:", error);
    return NextResponse.json(
      {
        error: `Failed to get or create user by email, ${userEmail}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
