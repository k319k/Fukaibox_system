# 封解Box (FukaiBox)

封解Boxは、Cloudflare Pages と Cloudflare Workers で動作する共同作業プラットフォームです。

## 📁 プロジェクト構成

```text
FukaiBox_system/
├── web/              # フロントエンド (Cloudflare Pages)
│   ├── src/          # React + Vite + Ant Design
│   └── public/       # 静的ファイル
├── api/              # バックエンド (Cloudflare Workers)
│   ├── src/          # Hono + Turso (LibSQL)
│   └── wrangler.jsonc
├── docs/             # ドキュメント
└── deploy/           # デプロイスクリプト
```

## 🚀 デプロイ

### フロントエンド (Cloudflare Pages)

```bash
cd web
npm install
npm run build
```

Cloudflare Pagesで自動デプロイ:

- **ビルドコマンド**: `npm run build`
- **ビルド出力ディレクトリ**: `dist`
- **ルートディレクトリ**: `web`

### バックエンド (Cloudflare Workers)

```bash
cd api
npm install
npm run deploy
```

環境変数の設定:

```bash
cd api
# .env ファイルを作成（.env.example を参照）
npm run deploy
```

## 🛠️ 開発環境

### フロントエンド開発サーバー

```bash
cd web
npm install
npm run dev
```

開発サーバー: `http://localhost:5173`

### バックエンド開発サーバー

```bash
cd api
npm install
npm run dev
```

開発サーバー: `http://localhost:8787`

### 環境変数

#### フロントエンド (`web/.env`)

```env
VITE_API_URL=https://fukaibox.kanjousekai.jp
```

#### バックエンド (`api/.env`)

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=https://fukaibox.kanjousekai.jp/api/auth/discord/callback
FRONTEND_URL=https://fukaibox.kanjousekai.jp
JWT_SECRET=your-jwt-secret
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
```

## 📋 主な機能

- ✅ Discord認証（儀長判定システム）
- ✅ シート作成・管理
- ✅ セクション分割機能（Ctrl+Enter）
- ✅ 画像アップロード・管理
- ✅ 画像採用システム
- ✅ 点数システム
- ✅ ランキング機能
- ✅ ユーザー管理・ブロック機能
- ✅ 管理者パネル
- ✅ 個人設定（プロフィール、外観、通知）

## 🧩 技術スタック

### フロントエンド

- React 19
- Vite 7
- Ant Design 6
- Zustand (状態管理)
- React Router 7
- Axios

### バックエンド

- Hono (Web Framework)
- Cloudflare Workers
- Turso (LibSQL / SQLite)
- Drizzle ORM
- Cloudflare R2 (画像ストレージ)

## 📖 コーディング規約

### Atomic File Rules (AFR)

- 1ファイルは200行以内に収める
- 行数を超えそうな場合は、即座にロジックを別ファイルに切り出す
- ファイル名はその役割が1秒でわかる名前にする

### Zustand Store 分割

- `authStore.js` - 認証関連
- `sheetStore.js` - シート管理
- `sectionStore.js` - セクション管理
- `pointStore.js` - 点数管理
- `toolsStore.js` - Tools機能

### その他

- TypeScript不使用のため、詳細なコメントで引数の型を明記
- エラー・バグを0にするため、コードレビューを厳格に行う

## 📚 ドキュメント

詳細なドキュメントは `docs/` ディレクトリを参照してください：

- [task.md](docs/task.md) - 全機能実装タスクリスト
- [DEVELOPMENT.md](DEVELOPMENT.md) - 開発ガイド

## 🔗 リンク

- **本番環境**: <https://fukaibox.kanjousekai.jp>
- **API エンドポイント**: <https://fukaibox.kanjousekai.jp/api>

## 📄 ライセンス

Private Project
