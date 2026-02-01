# 封解Box 開発タスク

## 現在のフェーズ: Phase 1 - 認証・ロール管理

---

## Phase 0: プロジェクトセットアップ ✅ 完了

- [x] Next.js プロジェクト初期化 (App Router)
- [x] Turso データベースセットアップ
- [x] 環境変数設定
- [x] 基本的なディレクトリ構造作成
- [x] HeroUIの準備
- [x] Vercel環境変数設定（ユーザーによる手動確認）

---

## Phase 1: 認証・ロール管理 ✅ 完了

- [x] Discord OAuth2 実装
- [x] ゲストログイン実装
- [x] 未ログインフロー実装
- [x] ロール判定ロジック(OAuthを使用)
  - [x] 儀長判定（Discord ID）
  - [x] 儀員判定（Discord ロール）
  - [x] 名誉儀員判定
- [x] ミドルウェアでのアクセス制御
- [x] セッション管理

---

## Phase 2: 台所（料理システム）

### Phase 2-A: Core Kitchen Features ✅ 完了

- [x] ルートリネーム: /kitchen → /cooking (Redirect Bug Fix)
- [x] 料理プロジェクト一覧画面
- [x] 新規プロジェクト作成
- [x] プロジェクト詳細ページ
- [x] セクション管理 (追加・編集・削除・並べ替え)
- [x] 推敲提案機能 (作成・一覧・承認/却下)
- [x] ロールベースUI制御 (儀長のみ承認可能)

### Phase 2-B: Image Management (R2) ✅ 完了

- [x] AWS SDK インストール
- [x] R2クライアント設定 (`lib/r2.ts`)
- [x] 画像アップロードAPI (Presigned URL方式)
- [x] フロントエンド実装 (ファイル選択・アップロード)
- [x] `cooking_images` DB登録
- [x] DBスキーマ更新 (projectId追加、sectionId nullable化)
- [ ] CORS設定確認 (ユーザー側作業)
- [ ] 本番環境でのアップロードテスト

### Phase 2-C: Image Selection & Download ✅ 完了

- [x] 画像採用タブ実装
  - [x] セクションごとに画像選択UI
  - [x] 選択状態の保存
- [x] ダウンロードタブ実装
  - [x] 台本データ(.txt)ダウンロード
  - [x] 選択画像の一括ダウンロード(.zip)
  - [x] プロジェクト全体のダウンロード

### Phase 2-Refactoring: Codebase Optimization

- [ ] 200行を超えるファイルの分割
  - [x] `kitchen-detail-client.tsx` (>1000 lines) のコンポーネント分割
  - [x] `actions/kitchen.ts` (>500 lines) のアクション分割 (`actions/kitchen/` ディレクトリに分割)
  - [x] `kitchen-list-client.tsx` (>300 lines) のコンポーネント分割
  - [ ] その他ファイルの分割・整理
- [ ] コード品質の向上

### Phase 2-D: Advanced Features (未着手)

- [ ] AI評価連携 (GLM-4.6V-Flash)
- [ ] 点数加算処理
- [ ] 情報反映機能 (Phase 3へ移行可)
- [ ] 投稿予約機能 (Phase 6へ統合可)

### Phase 2-E: Bug Fixes & Improvements (New)

- [x] **Guest Login Repair** <!-- id: 4 -->
  - [x] Investigate `registerGuest` and login page.
  - [x] Fix the issue or implement "Simple Guest Login" (auto-create).
- [x] **Reference Image Download (Giin+)** <!-- id: 5 -->
  - [x] Update `ImageUploadTab` to allow download for non-guest roles.
- [x] Multiple Image Upload (Nice to have)
- [x] Comment on uploaded images (Nice to have)

---

## Phase 3: ホーム・設定

- [x] サイドバーナビゲーション
- [x] ホーム画面ウィジェット
  - [ ] ライブ配信通知
  - [ ] ランキング表示
  - [ ] 名誉儀員表示
  - [x] 最新動画表示
- [x] ユーザー設定画面
- [x] DevStudio（儀長） (Auth Redirect Fixed)
- [x] AdminPanel（儀長） (Auth Redirect Fixed)

---

## Phase 4: 界域百科事典

- [ ] 百科事典ホーム
- [ ] 検索機能
- [ ] ジャンル表示
- [ ] 年表表示
- [ ] 単語詳細画面
- [ ] 関連単語表示

---

## Phase 5: Tools

- [x] 仕様策定 (docs/封解Box Tools機能仕様書.md)
- [x] Data Architecture Setup
  - [x] Supabase Project Setup (RLS, Realtime)
  - [x] JWT Minting Logic (Next.js API -> Supabase)
  - [x] DB Schema Definition (`tools_app_data` + GIN Index)
- [x] Tools API (SDK) Development
  - [x] `fukai-sdk` (postMessage Wrapper)
  - [x] Parent Window Message Handler
  - [x] TypeScript Definitions (`types/tools.ts`)
- [x] Tools工房 (Editor)
- [x] Tools工房
  - [x] UI Layout (Resizable Panels)
  - [x] AI Generation System Prompt (Responsive/Tailwind)
  - [x] Sandpack Integration
  - [x] Gallery & Runtime
    - [x] App実行 (Sandpack via SDK)
    - [x] App保存機能 (Turso)
    - [x] Gallery UI (Ant Design)
    - [x] Supabase Realtime (Broadcast/Host Logic)
    - [ ] 評価・コメント

---

## Phase 6: YoutubeManager

- [ ] アナリティクスタブ
- [ ] 予約投稿タブ
- [ ] 予約変更機能

---

## Phase 7: 儀員点数API

- [x] 議員ポイントAPIの実装 (Hono)
  - [x] プロジェクト初期化 (Hono + TypeScript)
- [x] ポイントDBの作成 (Vercel Postgres)
  - [x] スキーマ設計 (api_keys, user_points, point_history)
  - [x] Drizzle ORM 設定 & Migration
- [x] エンドポイント実装 (Vercel Postgres)
  - [x] ヘルスチェック
  - [x] 点数取得
  - [x] 順位取得 (Simple Count Method)
  - [x] 点数増減 (Transaction)

---

## Phase 8: その他・統合

- [ ] 環状世界wiki連携
- [×] Youtube配信検知
- [ ] 通知システム
- [ ] 総合テスト
- [ ] 本番デプロイ

---

## Phase 9: Tools機能改善 (現在進行中)

### Phase 9.1: 緊急修正 (Phase 1)

- [x] Studio公開設定UIの追加
- [x] マイギャラリーの表示バグ修正 (DBリレーション追加)
- [x] AIプロンプトの改善 (禁止ライブラリ明記)
- [x] ビルドエラー修正

### Phase 9.2: UI/UX刷新 (Phase 2)

- [ ] カラーパレット見直し (コントラスト向上)
- [ ] Gallery/AppCardデザイン改善
- [ ] Studioレイアウト最適化

### Phase 9.3: YouTube Manager完全実装 (Phase 3)

- [ ] YouTube Reporting API統合
- [ ] アナリティクスグラフ実装
- [ ] 動画アップロード機能
- [ ] 炊事場からの連携
