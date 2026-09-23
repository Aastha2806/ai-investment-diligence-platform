import type { NextConfig } from "next";

// GitHub Pages serves this project at https://<user>.github.io/ai-investment-diligence-platform/
// so every asset and route must be prefixed with that repo name. Set NEXT_PUBLIC_BASE_PATH=""
// (empty) for local dev / a custom domain, and leave it as the repo name for Pages builds.
const repoName = "ai-investment-diligence-platform";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? `/${repoName}` : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
