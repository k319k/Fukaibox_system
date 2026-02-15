import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/components/providers/antd-provider";
import { AccessLogger } from "@/components/providers/access-logger";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "封解Box",
  description: "封解公儀のための統合プラットフォーム",
  icons: {
    icon: "/icon.avif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <Providers>
          <AccessLogger />
          {children}
        </Providers>
      </body>
    </html>
  );
}
