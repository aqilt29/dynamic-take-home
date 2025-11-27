/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicEvmWalletClient } from "@dynamic-labs-wallet/node-evm";

import { saveWallet } from "./wallets";
import { DBWallet } from "@/types/wallet.types";
import { environmentId, authToken } from "./constants";

interface ClientProps {
  authToken: string;
  environmentId: string;
}

enum ThresholdSignatureScheme {
  TWO_OF_TWO = "TWO_OF_TWO",
  TWO_OF_THREE = "TWO_OF_THREE",
  THREE_OF_FIVE = "THREE_OF_FIVE",
}

export const getAuthenticatedEvmClient = async ({
  authToken,
  environmentId,
}: ClientProps) => {
  const client = new DynamicEvmWalletClient({ environmentId });

  await client.authenticateApiToken(authToken);
  return client;
};

export const createEmbeddedWallet = async (
  userId: string
): Promise<DBWallet> => {
  console.error(`❌ Wallet not found: ${userId}`);

  const dynamicEvmClient = await getAuthenticatedEvmClient({
    environmentId,
    authToken,
  });

  const baseWallet = await dynamicEvmClient.createWalletAccount({
    thresholdSignatureScheme:
      "TWO_OF_TWO" as ThresholdSignatureScheme.TWO_OF_TWO,
    backUpToClientShareService: false,
  });

  //@ts-expect-error
  const wallet: DBWallet = {
    ...baseWallet,
    userId,
  };

  try {
    return await saveWallet({
      ...wallet,
    });
  } catch (error) {
    console.log("🚀 ~ generating dynamic user wallet error:", userId, error);
    throw new Error(`Dynamic API Fail, for wallet: ${userId}`);
  }
};
