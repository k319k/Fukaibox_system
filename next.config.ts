import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OpenNext/Cloudflare用にサーバーレスモードを使用
  // Turbopackは開発モード専用のため、本番ビルドではWebpackを使用
  experimental: {
    // @ts-ignore - Next.js 16でTurbopackを無効化
    turbo: false,
  },
};

export default nextConfig;


