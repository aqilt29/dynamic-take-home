/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createZerodevClient,
  DynamicEvmWalletClient,
  KernelClient,
} from "@dynamic-labs-wallet/node-evm";

import { getUserWalletByUserId, saveWallet } from "./wallets";
import { DBWallet } from "@/types/wallet.types";
import { environmentId, authToken } from "./constants";
import { UserService } from "@/services";
import { AuthProviders } from "@/types/users.types";

interface ClientProps {
  authToken: string;
  environmentId: string;
}

interface SmartAccountClientProps {
  evmClient: DynamicEvmWalletClient;
  networkId: string;
  address: `0x${string}`;
  externalServerKeyShares?: string[] | any;
  password?: string;
}

enum ThresholdSignatureScheme {
  TWO_OF_TWO = "TWO_OF_TWO",
  TWO_OF_THREE = "TWO_OF_THREE",
  THREE_OF_FIVE = "THREE_OF_FIVE",
}

export const authenticatedEvmClient = async ({
  authToken,
  environmentId,
}: ClientProps) => {
  const client = new DynamicEvmWalletClient({ environmentId });

  await client.authenticateApiToken(authToken);
  return client;
};

export const smartAccountClient = async (
  args: SmartAccountClientProps
): Promise<KernelClient> => {
  const zerodevClient = await createZerodevClient(args.evmClient);

  return await zerodevClient.createKernelClientForAddress({
    withSponsorship: true,
    address: args.address,
    networkId: args.networkId,
    ...(args.externalServerKeyShares && {
      externalServerKeyShares: args.externalServerKeyShares,
    }),
    ...(args.password && { password: args.password }),
  });
};

export const createEmbeddedWallet = async (
  userId: string
): Promise<DBWallet> => {
  console.error(`❌ Wallet not found: ${userId}`);

  const dynamicEvmClient = await authenticatedEvmClient({
    environmentId,
    authToken,
  });

  const wallet = await dynamicEvmClient.createWalletAccount({
    thresholdSignatureScheme:
      "TWO_OF_TWO" as ThresholdSignatureScheme.TWO_OF_TWO,
    backUpToClientShareService: false,
  });

  try {
    return await saveWallet({
      userId,
      ...wallet,
    });
  } catch (error) {
    console.log("🚀 ~ generating dynamic user wallet error:", userId, error);
    throw new Error(`Dynamic API Fail, for wallet: ${userId}`);
  }
};

/**
 * Ensures a Dynamic user exists, and ensures they have an embedded wallet.
 */
export const ensureDynamicUserAndWallet = async (
  email: string,
  authprovider: AuthProviders = AuthProviders.CREDENTIALS,
  hashedPassword: string | null = null
) => {
  const existingUser = await UserService.getByEmail(email);

  if (!existingUser) {
    const dynamicUser = await UserService.create(
      email,
      authprovider,
      hashedPassword
    );

    await createEmbeddedWallet(dynamicUser.id);

    return dynamicUser;
  }

  // 3) User exists — check if a wallet exists in DB
  const wallet = await getUserWalletByUserId(existingUser.id);

  if (!wallet) {
    // User exists but has NO wallet → create one
    await createEmbeddedWallet(existingUser.id);
  }

  // 4) Return the existing user, wallet is guaranteed to exist now
  return existingUser;
};
