# 封解Box 要件定義書

## 概要

封解Box（ふうかいボックス）は、封解公儀のためのWebアプリケーション。ショート動画制作のワークフロー管理、儀員の点数管理、界域百科事典、各種ツールを提供する統合プラットフォーム。

**URL**: `fukaibox.kanjousekai.jp` → `fukai-box.vercel.app`

---

## 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| フロントエンド | Next.js 16 (App Router) | Webアプリケーション |
| バンドラー | Turbopack | 高速ビルド |
| ホスティング | Vercel | デプロイ・配信・Edge Functions |
| UIライブラリ | Ant Design v6 | コンポーネントライブラリ |
| スタイリング | Tailwind CSS | ユーティリティCSS |
| アニメーション | Motion | UIアニメーション |
| 状態管理 | Zustand | グローバル状態管理 |
| データフェッチ | TanStack Query | サーバー状態管理 |
| フォーム | React Hook Form | フォーム処理 |
| 認証 | BetterAuth | Discord OAuth連携 |
| メインDB | Turso (libSQL) | ユーザー、料理、百科事典データ |
| Tools用DB | Supabase | Toolsアプリ実行時データ |
| ORM | Drizzle ORM | DBアクセスレイヤー |
| ストレージ | Cloudflare R2 | 画像アップロード・保存 |
| AI | Vercel AI SDK + OpenRouter | AI評価・App生成 |

---

## ユーザーロール

| ロール | 説明 | 権限 |
|--------|------|------|
| 儀長 | 管理者 (特定のDiscord ID) | 全機能アクセス、料理開始、採用決定、管理パネル |
| 名誉儀員 | 名誉ある儀員 | 儀員権限 + 特別表示 |
| 儀員 | Discordで儀員ロールを持つユーザー | 推敲提案、画像アップロード、Tools登録 |
| ゲスト | ID/パスワードでログイン | 閲覧中心、限定的な操作 |
| 未ログイン | ログインせずに続行 | 閲覧のみ |

---

## 機能要件

task.mdを参照

---

## 外部連携

| サービス | 用途 |
|----------|------|
| Discord OAuth | ログイン、ロール確認 |
| YouTube Data API | 配信検知、アナリティクス、予約投稿 |
| Google Drive API | 素材保存 |
| OpenRouter | AI (GLM-4.6V-Flash, Qwen3) |
| Miraheze Wiki API | 環状世界wiki書き込み |

---

## データベース設計（Turso）

### ユーザー関連

- `users` - ユーザー基本情報
- `user_roles` - ロール情報
- `user_points` - 点数情報
- `point_history` - 点数履歴

### 台所関連

- `cooking_projects` - 料理プロジェクト
- `cooking_sections` - セクション
- `cooking_images` - アップロード画像
- `cooking_proposals` - 推敲提案

### 百科事典関連

- `dictionary_entries` - 単語エントリー
- `dictionary_relations` - 単語間関連

### Tools関連

- `tools_apps` - App情報
- `tools_files` - Appファイル（コード）
- `tools_ratings` - 評価・コメント

---

## 非機能要件

- **レスポンシブ対応**: PC/タブレット/スマートフォン
- **パフォーマンス**: ページ読み込み3秒以内
- **セキュリティ**: 認証、認可、入力検証
- **可用性**: VercelによるグローバルCDNと高可用性
- **スケーラビリティ**: Vercel Edge Functionsによるエッジコンピューティング
