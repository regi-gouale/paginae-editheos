import type { NextConfig } from "next";

const withBundleAnalyzer = require("next-bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
};

export default withBundleAnalyzer(nextConfig);
