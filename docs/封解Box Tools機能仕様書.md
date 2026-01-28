# **封解Box Tools機能仕様書**

**バージョン**: 0.1 (Draft)
**対象システム**: 封解Box (fukaibox.kanjousekai.jp)
**モジュール**: Tools (App Platform)

## **1. 概要**

「封解Box Tools」は、封解公儀の儀員が利用できる**AI主導型アプリケーションプラットフォーム**である。
ユーザーは「Tools工房」にてAI（Qwen3/GLM-4）と対話しながら、React/HTMLベースのマイクロアプリ（App）を即座に生成・公開できる。
公開されたAppは「App Gallery」に並び、他の儀員が実行・評価することができる。

## **2. ユーザーロールと権限**

| ロール | Tools工房 (作成) | Gallery (利用) | 評価・コメント | 管理 |
| :---- | :---: | :---: | :---: | :---: |
| **儀長** | ○ (無制限) | ○ | ○ | 全App管理・削除 |
| **儀員** | ○ (クレジット制) | ○ | ○ | 自身のApp管理 |
| **名誉儀員**| ○ (クレジット優遇) | ○ | ○ | 自身のApp管理 |
| **ゲスト** | × | △ (公開Appのみ) | × | × |

## **3. 機能要件詳細**

### **3.1 Tools工房 (App Studio)**

**コンセプト**: "Prompt to App" - 自然言語で欲しいツールを説明するだけで、動くアプリが生成される。

- **アクセス**: ホーム画面サイドバー最下部「封解Box Tools」よりアクセス。
- **UIレイアウト**:
  - **左パネル**: AIチャットインターフェース（OpenRouter経由）。
  - **右パネル**: プレビュー画面 / コードエディタ（タブ切り替え）。
  - **対応言語/フレームワーク**:
    - **React**: TypeScript (`tsx`) / JavaScript (`jsx`)
    - **Vanilla JS**: HTML/CSS/JS (`html`)
    - **Python**: Pyodideによるブラウザ実行 (`py`)

- **生成プロセス**:
  1. **クレジット確認**: AI生成機能の使用前に所持クレジットを確認。
  2. **プロンプト入力**: ユーザーが作りたいアプリを説明。
  3. **AI生成**: 指定された言語（React-TS/React-JS/Vanilla/Python）でコードを生成。
  4. **プレビュー**: Sandpack (JS系) または Pyodide (Python) で即座に実行。
  5. **保存・公開**: 作成したアプリをToolsに保存し、公開設定を行う。

### **3.2 Tools Gallery & Runtime**

**コンセプト**: アプリの共有と実行の場。

- **一覧表示**: カテゴリ別、新着順、人気順などで表示。
- **実行環境**:
  - **モーダル実行**: 通常のアプリ利用モード。
  - **右サイドバー実行**: 作業しながらの利用（例：計算機、メモなど）に対応。
- **リアルタイム連携**:
  - **Supabase Realtime (Broadcast)**:
    - **用途**: IOゲーム等の位置同期、チャット。DBを経由しないメモリオンリーの高速通信（WebSocket）。
    - **アーキテクチャ**: ホスト（部屋主）のブラウザがゲームロジック（敵AI等）を計算し、Broadcastで座標を配信する「ホスト依存方式」。
    - **補間**: 受信側はパケット間隔（例: 10fps）の間をフロントエンドで補間し、60fpsの滑らかな動作を実現する。

- **評価機能**:
  - 高評価 / 低評価
  - コメント投稿機能

## **4. データ構造 (DB Architecture)**

システムデータ（コード等）とアプリデータ（ゲームセーブ等）を **Turso** と **Supabase** に最適配置する。

### **4.1 System DB: Turso (LibSQL)**

**用途**: 封解Box Toolsのプラットフォーム自体の管理。大量のテキストデータ（コード）を安価に保存。

- `tools_apps`: Appのメタデータ。
  - `type`: `react-ts` | `react-js` | `vanilla-js` | `python` | `link` | `embed`
- `tools_files`: Appのソースコード（バージョン管理含む）。
- `tools_ratings`: 評価・コメント。
- `tools_credits`: クレジット残高。

### **4.2 App Backend: Supabase (PostgreSQL + Realtime)**

**用途**: ユーザー作成アプリのためのバックエンド。Realtime機能とアプリ内データ保存。

- **Realtime**: Presence (オンライン管理), Broadcast (ゲーム通信).
- **Database**: `tools_app_data` (JSON KV Store)
  - `id`: UUID (PK)
  - `app_id`: FK
  - `user_id`: FK
  - `collection`: String
  - `data`: JSONB
  - `is_public`: Boolean

## **5. 技術スタック**

- **Frontend**: Next.js, HeroUI, Lucide React
- **System DB**: Turso (LibSQL) - コード・メタデータ
- **App Backend**: Supabase (PostgreSQL + Realtime) - ゲームデータ・通信
- **AI**: OpenRouter API
- **Sandbox**: Sandpack (Browser-based)

## **6. DB制限 (App Backend Quotas)**

Supabase側のアプリデータ保存に関する制限。

| 項目 | 制限内容 | 備考 |
| :--- | :--- | :--- |
| **ストレージ容量** | **50MB** / App | `tools_app_data` の容量制限。 |
| **レコード数** | **1,000** 件 / User / App | 1ユーザーあたり。 |
| **Read/Write** | Supabase Rate Limit | |
