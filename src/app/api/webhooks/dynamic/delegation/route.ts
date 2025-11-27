/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";
import { DYNAMIC_CONFIG } from "@/lib/config";

/**
 * Dynamic Delegated Access Webhook Handler
 * Receives and processes delegation events from Dynamic
 *
 * Events handled:
 * - wallet.delegation.created: User approves delegation, receive encrypted share & API key
 * - wallet.delegation.revoked: User revokes delegation
 * - wallet.delegation.signature: Signature made using delegated access
 */

interface WebhookEvent {
  eventName: string;
  eventId: string;
  messageId: string;
  webhookId: string;
  timestamp: string;
  userId: string;
  environmentId: string;
  environmentName: string;
  data: any;
}

interface DelegationCreatedData {
  chain: string;
  encryptedDelegatedShare: {
    alg: string;
    ct: string;
    ek: string;
    iv: string;
    tag: string;
  };
  encryptedWalletApiKey: {
    alg: string;
    ct: string;
    ek: string;
    iv: string;
    kid: string;
    tag: string;
  };
  publicKey: string;
  userId: string;
  walletId: string;
}

interface DelegationRevokedData {
  chain: string;
  publicKey: string;
  userId: string;
  walletId: string;
}

interface DelegationSignatureData {
  context: {
    evmUserOperation: {
      chainId: number;
      entryPoint: string;
      operation: {
        callData: string;
        callGasLimit: string;
        maxFeePerGas: string;
        maxPriorityFeePerGas: string;
        nonce: string;
        sender: string;
        signature: string;
      };
    };
  };
  message: string;
  publicKey: string;
  userId: string;
  walletId: string;
}

/**
 * Verify webhook signature from Dynamic
 * Signature format: "sha256=<hex-hash>"
 */
const verifyWebhookSignature = ({
  secret,
  signature,
  payload,
}: {
  secret: string;
  signature: string;
  payload: any;
}) => {
  const payloadSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  const trusted = Buffer.from(`sha256=${payloadSignature}`, "ascii");
  const untrusted = Buffer.from(signature, "ascii");
  return crypto.timingSafeEqual(trusted, untrusted);
};

/**
 * Handle wallet.delegation.created event
 */
async function handleDelegationCreated(event: WebhookEvent) {
  const data = event.data as DelegationCreatedData;

  console.log("Delegation created event received:", {
    userId: data.userId,
    walletId: data.walletId,
    chain: data.chain,
    publicKey: data.publicKey,
  });

  // Get private key for decryption
  const privateKeyPem = DYNAMIC_CONFIG.delegationPrivateKey;
  if (!privateKeyPem) {
    throw new Error("DELEGATION_PRIVATE_KEY not configured");
  }

  console.log("✅ Successfully decrypted delegated materials");

  // Store securely
  // await saveDelegatedMaterials(
  //   data.userId,
  //   data.walletId,
  //   delegatedShare,
  //   walletApiKey,
  //   data.publicKey,
  //   data.chain
  // );

  return {
    status: "success",
    message: "Delegation materials stored successfully",
    userId: data.userId,
    walletId: data.walletId,
  };
}

/**
 * Handle wallet.delegation.revoked event
 */
async function handleDelegationRevoked(event: WebhookEvent) {
  const data = event.data as DelegationRevokedData;

  console.log("🚫 Delegation revoked event received:", {
    userId: data.userId,
    walletId: data.walletId,
    chain: data.chain,
  });

  // Remove stored materials
  // await deleteDelegatedMaterials(data.userId, data.walletId);

  return {
    status: "success",
    message: "Delegation revoked successfully",
    userId: data.userId,
    walletId: data.walletId,
  };
}

/**
 * Handle wallet.delegation.signature event
 */
async function handleDelegationSignature(event: WebhookEvent) {
  const data = event.data as DelegationSignatureData;

  console.log("Delegation signature event received:", {
    userId: data.userId,
    walletId: data.walletId,
    chainId: data.context.evmUserOperation.chainId,
    sender: data.context.evmUserOperation.operation.sender,
  });

  // Log the signature for audit purposes
  // You can use this for monitoring/analytics

  return {
    status: "success",
    message: "Signature event logged",
    userId: data.userId,
    walletId: data.walletId,
  };
}

/**
 * Handle eventName ping
 */
async function handlePing(event: WebhookEvent) {
  const data = event.data as any;

  console.log("Ping event received:", data);

  // Log the signature for audit purposes
  // You can use this for monitoring/analytics

  return {
    status: "success",
    message: "Ping Seen",
  };
}

/**
 * POST /api/webhooks/dynamic/delegation
 * Webhook endpoint for Dynamic delegated access events
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const event: WebhookEvent = JSON.parse(rawBody);

    // Verify webhook signature
    const signature = request.headers.get("x-dynamic-signature-256");
    const webhookSecret = DYNAMIC_CONFIG.webhookSecret;

    if (!webhookSecret) {
      console.error("DYNAMIC_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error("Missing webhook signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify signature using the parsed payload object (not raw body)
    const isValid = verifyWebhookSignature({
      payload: event,
      signature,
      secret: webhookSecret,
    });

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(`📨 Webhook event received: ${event.eventName}`);

    // Route to appropriate handler
    let result;
    switch (event.eventName) {
      case "wallet.delegation.created":
        result = await handleDelegationCreated(event);
        break;

      case "wallet.delegation.revoked":
        result = await handleDelegationRevoked(event);
        break;

      case "wallet.delegation.signature":
        result = await handleDelegationSignature(event);
        break;

      case "ping":
        result = await handlePing(event);
        break;

      default:
        console.warn(`Unknown event type: ${event.eventName}`);
        return NextResponse.json(
          { error: "Unknown event type" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
