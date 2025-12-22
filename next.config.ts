import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude duckdb from webpack bundling on server-side
      config.externals = config.externals || [];
      config.externals.push("duckdb", "duckdb-async");
    }
    return config;
  },
};

export default nextConfig;
