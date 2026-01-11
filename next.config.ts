import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpenNext/Cloudflare用にサーバーレスモードを使用
  // Turbopackは開発モード専用のため、本番ビルドではWebpackを使用
  // Next.js 16でTurbopackを完全に無効化
  webpack: (config) => {
    return config;
  },
  experimental: {
    // @ts-ignore - Next.js 16でTurbopackを無効化
    turbo: false,
    turbopack: false,
  },
};

export default nextConfig;


