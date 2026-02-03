# 封解Box (FukaiBox)

封解Box（ふうかいボックス）は、封解公儀のための統合Webアプリケーションです。ショート動画制作のワークフロー管理、儀員の点数管理、界域百科事典、各種ツールを提供します。

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript 5
- **UIライブラリ**: Ant Design v6
- **スタイリング**: Tailwind CSS
- **アニメーション**: Motion
- **状態管理**: Zustand
- **データフェッチ**: TanStack Query
- **フォーム**: React Hook Form
- **バンドラー**: Turbopack

### バックエンド

- **メインDB**: Turso (libSQL)
- **Tools用DB**: Supabase
- **ORM**: Drizzle ORM
- **認証**: BetterAuth (Discord OAuth)
- **ストレージ**: Cloudflare R2
- **AI**: Vercel AI SDK + OpenRouter

### デプロイメント

- **ホスティング**: Vercel
- **本番URL**: <https://fukaibox.kanjousekai.jp/>

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
npm install
```

### 環境変数

以下の環境変数をVercelダッシュボードまたは`.env.local`に設定してください：

```env
# Database
DATABASE_URL=
DATABASE_AUTH_TOKEN=

# Authentication
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# AI
OPENROUTER_API_KEY=
```

### 開発

**注意**: ローカル開発サーバーは使用禁止です。Vercelでのデプロイのみとなります。

```bash
git push origin main
```

GitHubにプッシュすると、自動的にVercelでデプロイされます。

## プロジェクト構造

```
fukai-box/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証関連ページ
│   ├── (main)/              # メインアプリページ
│   ├── api/                 # API Routes
│   └── layout.tsx           # ルートレイアウト
├── lib/                     # ユーティリティ・ヘルパー
│   ├── db/                  # データベース接続・スキーマ
│   └── auth/                # 認証設定
├── components/              # Reactコンポーネント
├── docs/                    # ドキュメント
└── scripts/                 # ユーティリティスクリプト
```

## 主要機能

### 1. 台所（料理システム）

- 動画制作の企画・台本作成
- セクション管理と推敲提案
- 画像収集とアップロード
- AI評価とダウンロード機能

### 2. 界域百科事典

- 環状世界の単語管理
- 関連単語表示
- 年表とジャンル表示

### 3. Tools

- AppギャラリーとApp実行
- Tools工房（AI によるApp作成）
- 評価・コメント機能

### 4. YouTubeManager

- アナリティクス表示
- 予約投稿管理

## ドキュメント

詳細なドキュメントは `/docs` フォルダを参照してください：

- [AGENTS.md](./docs/AGENTS.md) - AI Agent開発ガイド
- [requirement.md](./docs/requirement.md) - 要件定義書
- [task.md](./docs/task.md) - 開発タスク
- [封解Box 炊事場機能仕様書.md](./docs/封解Box%20炊事場機能仕様書.md) - 炊事場機能仕様

## デプロイ

Vercelへの自動デプロイが設定されています。`main`ブランチへのプッシュで自動的にデプロイされます。

```bash
git add .
git commit -m "Update"
git push origin main
```

デプロイ状況は[Vercelダッシュボード](https://vercel.com/k319ks-projects/fukai-box)で確認できます。

## ライセンス

このプロジェクトは封解公儀の所有物です。
