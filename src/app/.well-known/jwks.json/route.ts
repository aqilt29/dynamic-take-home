import { NextResponse } from "next/server";
import * as jose from "jose";

/**
 * JWKS (JSON Web Key Set) endpoint
 * Standard location for public keys used to verify JWTs
 * Required by Dynamic's external authentication feature
 */
export async function GET() {
  try {
    // Get the public key from environment
    const publicKeyBase64 = process.env.NEXTAUTH_JWT_PUBLIC_KEY;

    if (!publicKeyBase64) {
      return NextResponse.json(
        { error: "Public key not configured" },
        { status: 500 }
      );
    }

    // Decode the base64 public key
    const publicKeyPem = Buffer.from(publicKeyBase64, "base64").toString("utf-8");

    // Import the public key
    const publicKey = await jose.importSPKI(publicKeyPem, "RS256");

    // Export as JWK (JSON Web Key)
    const jwk = await jose.exportJWK(publicKey);

    // Create JWKS response with standard fields
    const jwks = {
      keys: [
        {
          ...jwk,
          alg: "RS256",
          use: "sig",
          kid: "nextauth-rsa-key",
        },
      ],
    };

    // Return JWKS with proper headers
    return NextResponse.json(jwks, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating JWKS:", error);
    return NextResponse.json(
      { error: "Failed to generate JWKS" },
      { status: 500 }
    );
  }
}
