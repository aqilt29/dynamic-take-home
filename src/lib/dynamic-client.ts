import { DynamicEvmWalletClient } from "@dynamic-labs-wallet/node-evm";

let evmClientInstance: DynamicEvmWalletClient | null = null;

export async function getAuthenticatedEvmClient() {
  if (!process.env.DYNAMIC_AUTH_TOKEN || !process.env.DYNAMIC_ENVIRONMENT_ID) {
    throw new Error("Dynamic API credentials not configured");
  }

  if (evmClientInstance) {
    return evmClientInstance;
  }

  const client = new DynamicEvmWalletClient({
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID,
  });

  await client.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN);
  evmClientInstance = client;

  return client;
}
