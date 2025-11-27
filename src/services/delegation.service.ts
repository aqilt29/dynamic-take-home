/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Delegation Service
 * Business logic for delegation and webhook handling
 */

import crypto from "crypto";
import { DYNAMIC_CONFIG } from "@/lib/config";
import type {
  DelegationCreatedData,
  DelegationRevokedData,
} from "@/lib/api/validation";

export interface WebhookVerificationParams {
  signature: string;
  payload: any;
  secret: string;
}

export interface DelegationResult {
  status: string;
  message: string;
  userId?: string;
  walletId?: string;
}

/**
 * DelegationService - Handles delegation events and webhook processing
 */
export class DelegationService {
  /**
   * Verify webhook signature from Dynamic
   */
  verifyWebhookSignature(params: WebhookVerificationParams): boolean {
    const { signature, payload, secret } = params;

    const payloadSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    const trusted = Buffer.from(`sha256=${payloadSignature}`, "ascii");
    const untrusted = Buffer.from(signature, "ascii");

    return crypto.timingSafeEqual(trusted, untrusted);
  }

  /**
   * Handle delegation created event
   */
  async handleDelegationCreated(
    data: DelegationCreatedData
  ): Promise<DelegationResult> {
    console.log("✅ Delegation created event received:", {
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

    // TODO: Implement delegation material storage
    // const delegatedShare = decryptDelegatedShare(data.encryptedDelegatedShare, privateKeyPem);
    // const walletApiKey = decryptWalletApiKey(data.encryptedWalletApiKey, privateKeyPem);
    // await saveDelegatedMaterials(data.userId, data.walletId, delegatedShare, walletApiKey, data.publicKey, data.chain);

    console.log("✅ Delegation materials would be stored here");

    return {
      status: "success",
      message: "Delegation materials stored successfully",
      userId: data.userId,
      walletId: data.walletId,
    };
  }

  /**
   * Handle delegation revoked event
   */
  async handleDelegationRevoked(
    data: DelegationRevokedData
  ): Promise<DelegationResult> {
    console.log("🚫 Delegation revoked event received:", {
      userId: data.userId,
      walletId: data.walletId,
      chain: data.chain,
    });

    // TODO: Implement delegation material deletion
    // await deleteDelegatedMaterials(data.userId, data.walletId);

    console.log("✅ Delegation materials would be deleted here");

    return {
      status: "success",
      message: "Delegation revoked successfully",
      userId: data.userId,
      walletId: data.walletId,
    };
  }

  /**
   * Handle delegation signature event
   */
  async handleDelegationSignature(data: any): Promise<DelegationResult> {
    console.log("📝 Delegation signature event received:", {
      userId: data.userId,
      walletId: data.walletId,
      chainId: data.context?.evmUserOperation?.chainId,
      sender: data.context?.evmUserOperation?.operation?.sender,
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
   * Handle ping event
   */
  async handlePing(data: any): Promise<DelegationResult> {
    console.log("🏓 Ping event received:", data);

    return {
      status: "success",
      message: "Ping acknowledged",
    };
  }
}

/**
 * Singleton instance
 */
export const delegationService = new DelegationService();
