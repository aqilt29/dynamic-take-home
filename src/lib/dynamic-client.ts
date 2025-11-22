import { DynamicEvmWalletClient } from "@dynamic-labs-wallet/node-evm";

let evmClientInstance: DynamicEvmWalletClient | null = null;

export async function getAuthenticatedEvmClient() {
  if (!process.env.DYNAMIC_AUTH_TOKEN || !process.env.DYNAMIC_ENVIRONMENT_ID) {
    console.error("Missing Dynamic credentials:", {
      hasAuthToken: !!process.env.DYNAMIC_AUTH_TOKEN,
      hasEnvId: !!process.env.DYNAMIC_ENVIRONMENT_ID,
    });
    throw new Error("Dynamic API credentials not configured");
  }

  if (evmClientInstance) {
    console.log("Reusing existing EVM client instance");
    return evmClientInstance;
  }

  const client = new DynamicEvmWalletClient({
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID,
  });

  console.log("Authenticating with API token...");
  await client.authenticateApiToken(process.env.DYNAMIC_AUTH_TOKEN);
  console.log("Authentication successful");

  evmClientInstance = client;

  return client;
}
