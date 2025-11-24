import type { ServerKeyShare } from "@dynamic-labs-wallet/node";
import {
  createDelegatedEvmWalletClient,
  DelegatedEvmWalletClient,
  DynamicEvmWalletClient,
} from "@dynamic-labs-wallet/node-evm";
import type { ZerodevBundlerProvider } from "@dynamic-labs/sdk-api-core";
import type { KernelAccountClient } from "@zerodev/sdk";
import type { Chain, Client, Hex, RpcSchema, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";

export type ZeroDevKernelOptions = {
  address: `0x${string}`;
  networkId: string;
  password?: string;
  externalServerKeyShares?: ServerKeyShare[];
  delegated?: {
    delegatedClient: ReturnType<typeof createDelegatedEvmWalletClient>;
    walletId: string;
    walletApiKey: string;
    keyShare: ServerKeyShare;
  };
  withSponsorship?: boolean;
  bundlerProvider?: ZerodevBundlerProvider;
  bundlerRpc?: string;
  paymasterRpc?: string;
  gasTokenAddress?: Hex;
};

export type KernelClient = KernelAccountClient<
  Transport,
  Chain,
  SmartAccount,
  Client,
  RpcSchema
>;
export type EvmClientBase = DynamicEvmWalletClient | DelegatedEvmWalletClient;
