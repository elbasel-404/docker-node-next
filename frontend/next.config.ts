import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty.js" },
      path: { browser: "./empty.js" },
    },
  },
  reactCompiler: true,
};

export default nextConfig;
