# AGENTS.md - AI Agent Development Guide

このドキュメントは、封解Boxプロジェクトで作業する将来のAIエージェント向けのガイドです。

> **📝 Note**: このドキュメント自体も、**Antigravity (Google DeepMind製AIエージェント)** によって作成されました。

## プロジェクト概要

**封解Box（ふうかいボックス）** は、封解公儀のためのWebアプリケーション。ショート動画制作のワークフロー管理、儀員の点数管理、界域百科事典、各種ツールを提供する統合プラットフォーム。

### デプロイメント情報

- **本番URL**: <https://fukaibox.kanjousekai.jp/>
- **Vercel管理画面**: <https://vercel.com/k319ks-projects/fukai-box>
- **GitHubリポジトリ**: <https://github.com/k319k/Fukaibox_system>

- **TursoCLI**:WSLから
- **VercelCLI**:WSLから
- **Wrangler**:Shellから

## 技術スタック

### コア技術

- **フレームワーク**: Next.js 16.1.1 (App Router)
- **バンドラー**: Turbopack（デフォルト有効）
- **言語**: TypeScript 5
- **ホスティング**: Vercel

### UIライブラリ

- **コンポーネント**: HeroUI 2.8.7
- **スタイリング**: Tailwind CSS 4
- **アニメーション**: Framer Motion 12.25.0

### データベース

- **メインDB**: Turso (libSQL) - ユーザー、料理、百科事典、Toolsコード
- **ORM**: Drizzle ORM 0.45.1
- **認証**: better-auth 1.4.10

### 外部サービス

- **AI**: OpenRouter (GLM-4.6V-Flash, Qwen3)
- **認証**: Discord OAuth
- **ストレージ**: Cloudflare R2

## プロジェクト構造

```
fukai-box/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証関連ページ（ログイン等）
│   ├── (main)/              # メインアプリページ
│   ├── api/                 # API Routes
│   └── layout.tsx           # ルートレイアウト
├── lib/                     # ユーティリティ・ヘルパー
│   ├── db/                  # データベース接続・スキーマ
│   └── auth/                # 認証設定
├── components/              # Reactコンポーネント
├── docs/                    # ドキュメント
│   ├── requirement.md       # 要件定義書
│   ├── task.md             # タスクリスト
│   └── 封解Box計画.mmd      # プロジェクト計画
├── scripts/                 # ユーティリティスクリプト
└── .env                     # 環境変数（ローカル）
```

## 重要な設置ファイル

### next.config.ts

シンプルな構成。Vercelの最適化設定が自動適用されます。

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel最適化設定
};

export default nextConfig;
```

### package.json - スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm start` - 本番サーバー起動（ローカル）
- `npm run lint` - ESLint実行

## デプロイメント

### Vercel自動デプロイ

GitHubの`master`ブランチにプッシュすると自動的にVercelで本番デプロイされます。

### 手動デプロイ（必要な場合）

```bash
vercel --prod
```

### 環境変数

Vercelダッシュボードで以下の環境変数を設定：

- `DATABASE_URL` - Tursoデータベース接続URL
- `DATABASE_AUTH_TOKEN` - Turso認証トークン
- `BETTER_AUTH_SECRET` - better-auth秘密鍵
- `BETTER_AUTH_URL` - 認証コールバックURL
- `DISCORD_CLIENT_ID` - Discord OAuth クライアントID
- `DISCORD_CLIENT_SECRET` - Discord OAuth シークレット

## 開発ガイドライン

### コーディングスタイル

1. **TypeScript優先**: すべての新しいコードはTypeScriptで書く
2. **Zod使用**: すべての新しいコードはZodで型定義する
3. **HeroUIコンポーネント使用**: UIにはHeroUIコンポーネントを優先的に使用
4. **App Router準拠**: ファイルベースルーティング、Server Components優先
5. **Tailwind CSS**: スタイリングはTailwind CSS classesを使用
6. **ローカル開発サーバー禁止**: ローカル開発サーバーは禁止。Vercelのみ。

### データベース操作

```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// Drizzle ORMを使用
const allUsers = await db.select().from(users);
```

### 認証チェック

```typescript
import { auth } from "@/lib/auth";

// Server Component or API Route
const session = await auth();
if (!session) {
  // 未認証処理
}
```

### HeroUI使用例

```tsx
import { Button, Card, CardBody } from "@heroui/react";

export default function MyComponent() {
  return (
    <Card>
      <CardBody>
        <Button color="primary">Click me</Button>
      </CardBody>
    </Card>
  );
}
```

## 重要な注意事項

### コードを更新する際、毎回以下の手順を実行すること

1. コードを更新する
   - 何回も何回もできるまで終わるまで完璧になるまで複数回以上PDCA回してください。途中で勝手にスタックしたり止まったらしないでください。

2. GitHubにプッシュする
   - <https://github.com/k319k/Fukaibox_system>
   - GitHubにプッシュすると自動的にVercelで本番デプロイされます。

3. Vercelダッシュボードでビルドログを見守る。
   - <https://vercel.com/k319ks-projects/fukai-box/deployments>

### ❌ やってはいけないこと

1. **Turbopackの無効化**
   - Next.js 16ではTurbopackがデフォルトで有効
   - Vercelは完全対応しているため無効化不要

2. **直接的なWebpack設定**
   - Next.js 16 + Vercelでは不要

3. **ローカルでのビルド**
   - ローカルでやると重くなるので禁止。Vercelでやること。

4. **標準HTMLの原則使用禁止**
   - `<input>`, `<textarea>`, `<button>` などの標準HTMLは使用禁止
   - 代わりにHeroUIの `Input`, `Textarea`, `Button` 等を使用すること
   - モーダル、カード、チップ等もすべてHeroUIコンポーネントを使用
   - 標準HTMLが必要になったらユーザーに許可をもらうこと

5. **200行以上のコード禁止**
   - 200行以上のコードを書く場合は分割して200行以下にすること。

### ✅ 推奨事項

1. **Server Componentsを優先**
   - データフェッチはServer Componentsで
   - "use client"は必要最小限に

2. **HeroUIコンポーネント活用**
   - デザイン一貫性のため既存コンポーネントを使用
   - カスタムスタイルよりHeroUI variantsを優先

3. **環境変数の適切な管理**
   - 本番: Vercelダッシュボード

4. **型安全性の維持**
   - Drizzle ORMスキーマから型を自動生成
   - `any`型の使用を避ける

5. **UIを統一**
   - Design definition documentを厳守し、HeroUIコンポーネントを使用すること。

## トラブルシューティング

### ビルドエラー

```bash
# 依存関係の再インストール
npm install

# キャッシュクリア
rm -rf .next
npm run build

```

### Vercelデプロイエラー

1. Vercelダッシュボードでビルドログを確認
2. 環境変数が正しく設定されているか確認
3. `package.json`の依存関係を確認

## 参考リソース

- [Next.js 16 ドキュメント](https://nextjs.org/docs)
- [HeroUI ドキュメント](https://heroui.com)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team)
- [better-auth ドキュメント](https://www.better-auth.com)
- [Vercel ドキュメント](https://vercel.com/docs)

## 履歴

- **2026-01-17**: ユーザーによっていろいろ編集
- **2026-01-11**: CloudflareからVercelに移行、Next.js 16 + Turbopack対応
- **2025-12-XX**: プロジェクト開始、初期セットアップ

---

**最終更新**: 2026-01-17
**担当エージェント**: Antigravity by Google DeepMind
