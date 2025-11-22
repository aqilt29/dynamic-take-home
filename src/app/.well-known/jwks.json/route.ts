import { NextResponse } from "next/server";
import * as jose from "jose";

/**
 * JWKS (JSON Web Key Set) endpoint
 * Exposes the public key for JWT signature verification
 * Used by external services (like Dynamic) to verify JWT tokens
 */
export async function GET() {
  try {
    const publicKeyBase64 = process.env.NEXTAUTH_JWT_PUBLIC_KEY;

    if (!publicKeyBase64) {
      return NextResponse.json(
        { error: "Public key not configured" },
        { status: 500 }
      );
    }

    // Decode the base64 public key
    const publicKeyPem = Buffer.from(publicKeyBase64, "base64").toString(
      "utf-8"
    );

    // Import the public key
    const publicKey = await jose.importSPKI(publicKeyPem, "RS256");

    // Export as JWK (JSON Web Key)
    const jwk = await jose.exportJWK(publicKey);

    // Return JWKS format
    return NextResponse.json({
      keys: [
        {
          ...jwk,
          alg: "RS256",
          use: "sig",
          kid: "nextauth-rsa-key",
        },
      ],
    });
  } catch (error) {
    console.error("Error generating JWKS:", error);
    return NextResponse.json(
      { error: "Failed to generate JWKS" },
      { status: 500 }
    );
  }
}
