import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  // Exclude Dynamic SDK from webpack bundling (contains native Node modules)
  serverExternalPackages: [
    "@dynamic-labs-wallet/node-evm",
    "@dynamic-labs-wallet/core",
  ],
};

export default nextConfig;
