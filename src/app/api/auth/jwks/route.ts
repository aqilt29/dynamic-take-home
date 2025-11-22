import { NextResponse } from "next/server";
import * as jose from "jose";

// This endpoint exposes the public key used to verify NextAuth JWTs
// Required by Dynamic's external authentication feature
export async function GET() {
  try {
    // Get the secret used by NextAuth for signing JWTs
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "AUTH_SECRET not configured" },
        { status: 500 }
      );
    }

    // Create a key from the secret
    const secretKey = new TextEncoder().encode(secret);

    // Generate JWK (JSON Web Key) from the secret
    // Note: NextAuth uses HS256 (HMAC with SHA-256) by default
    const jwk = await jose.exportJWK(secretKey);

    // Add required fields for JWKS
    const jwks = {
      keys: [
        {
          ...jwk,
          alg: "HS256",
          use: "sig",
          kid: "nextauth-key",
        },
      ],
    };

    return NextResponse.json(jwks);
  } catch (error) {
    console.error("Error generating JWKS:", error);
    return NextResponse.json(
      { error: "Failed to generate JWKS" },
      { status: 500 }
    );
  }
}
