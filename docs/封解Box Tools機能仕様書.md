# **封解Box Tools機能仕様書**

**バージョン**: 0.1 (Draft)
**対象システム**: 封解Box (fukaibox.kanjousekai.jp)
**モジュール**: Tools (App Platform)

## **1. 概要**

「封解Box Tools」は、封解公儀の儀員が利用できる**AI主導型アプリケーションプラットフォーム**である。
ユーザーは「Tools工房」にてAI（Qwen3-coder/GLM-4.7/DeepSeek-V3.2等）と対話しながら、React/HTMLベースのマイクロアプリ（App）を即座に生成・公開できる。
公開されたAppは「App Gallery」に並び、他の儀員が実行・評価することができる。

## **2. ユーザーロールと権限**

| ロール | Tools工房 (作成) | Gallery (利用) | 評価・コメント | 管理 |
| :---- | :---: | :---: | :---: | :---: |
| **儀長** | ○ (無制限) | ○ | ○ | 全App管理・削除 |
| **儀員** | ○ (クレジット制) | ○ | ○ | 自身のApp管理 |
| **名誉儀員**| ○ (クレジット優遇) | ○ | ○ | 自身のApp管理 |
| **ゲスト** | × | △ (公開Appのみ) | × | × |

## **3. 機能要件詳細**

### **3.1 Tools工房**

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
  - **右サイドバー実行**: 作業しながらの利用。（例：計算機、メモなど）に対応。炊事場やホームでも利用可能。
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

## **5. アーキテクチャ詳細 (Architecture Details)**

### **5.1 セキュリティと認証 (Security & Auth)**

- **サンドボックス分離**: アプリは `iframe` (Sandpack) 内で実行される。親ウィンドウとは **`postMessage`** でのみ通信し、DOMアクセスやCookieへの直接アクセスは行わせない。
- **Supabase認証 (JWT Minting)**:
  - 封解Box本体（Tursoユーザー）がSupabaseへアクセスするため、バックエンドで **Custom JWT** を署名（Mint）して発行する。
  - アプリには `SUPABASE_ANON_KEY` と共にこの署名済みトークンを渡し、RLS (Row Level Security) を機能させる。

### **5.2 Tools SDK**

アプリ内にはラッパーライブラリを注入し、非同期 (`Promise`) で親ウィンドウと通信する。

- `await fukai.getUser()`: ユーザー情報取得。
- `await fukai.db.get/set/query(...)`: K-Vストア操作。

### **5.3 Python (Pyodide) の制限**

- **初期ロード**: ランタイムDLのため起動に時間がかかる旨をUI表示する。
- **機能制限**: データ分析・計算専用とし、**Realtime機能は非対応**（または制限付き）とする。

### **5.4 IOゲーム (Broadcast)**

- **ホスト依存**: ホスト（部屋主）がゲームロジックを計算。ホスト可視化UIを実装。
- **途中参加**: `RequestState` イベントでホストから最新状態を取得するロジックを実装。

### **5.5 UI/レスポンシブ**

- **システムプロンプト**: AIに対し「Tailwind CSS等を使い、コンテナ幅に応じたレスポンシブ対応」を強制する。
- **Zoom機能**: `iframe` の `scale` 縮小表示機能をUIに搭載。

## **6. 技術スタック**

- **Frontend**: Next.js, Ant Design, Lucide React
- **System DB**: Turso (LibSQL) - コード・メタデータ
- **App Backend**: Supabase (PostgreSQL + Realtime) - ゲームデータ・通信
- **AI**: OpenRouter API
- **Sandbox**: Sandpack (Browser-based)

## **7. DB制限 (App Backend Quotas)**

Supabase側のアプリデータ保存に関する制限。

- **パフォーマンス最適化**: `tools_app_data` の `data` (JSONB) カラムには **GINインデックス** を作成し、フィルタリングを高速化する。

| 項目 | 制限内容 | 備考 |
| :--- | :--- | :--- |
| **ストレージ容量** | **50MB** / App | `tools_app_data` の容量制限。 |
| **レコード数** | **1,000** 件 / User / App | 1ユーザーあたり。 |
| **Read/Write** | Supabase Rate Limit | |
