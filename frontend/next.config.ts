import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // S3 + CloudFront への静的エクスポート
  output: "export",
  trailingSlash: true,
  images: {
    // 静的エクスポート時は next/image の最適化を無効化
    unoptimized: true,
  },
};

export default nextConfig;
