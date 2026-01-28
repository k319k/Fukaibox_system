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
  - **Supabase Realtime** を使用し、Tools工房でのチャット・コード同期や、アプリ間のリアルタイム通信（マルチプレイヤーゲーム等）を実現。
- **評価機能**:
  - 高評価 / 低評価
  - コメント投稿機能

## **4. データ構造 (Supabase)**

Tools機能は、App生成時の大量のファイルやリアルタイム性を考慮し、メインのTursoとは別に**Supabase**を使用する。
**Appのメタデータ、ソースコード、およびアプリ内データは全てSupabaseに保存する。**

### **Tables**

- `tools_apps`: Appのメタデータ。
  - `type`: アプリの種類。`react-ts` | `react-js` | `vanilla-js` | `python` | `link` | `embed`
- `tools_files`: Appを構成するソースコード（バージョン管理含む）。
- `tools_ratings`: ユーザーによる評価（High/Low）とコメント。
- `tools_credits`: ユーザーの残りクレジット残高。

## **5. 技術スタック**

- **Frontend**: Next.js, HeroUI, Lucide React
- **Editor/Preview**: CodeMirror / @monaco-editor/react, Sandpack
- **Sandbox**: Sandpack (Browser-based)

## **6. DB制限とストレージ (Storage & Constraints)**

作成されたAppは、安全性と管理の観点から**直接のSQL実行権限を持たない**。
代わりに、提供されるSDKを通じて**Key-Value形式 (JSON)** でデータを保存する。

### **6.1 データ保存モデル**

- **種類**: JSON Document Store (`tools_app_data` テーブル)
- **スコープ**: `app_id` と `user_id` で分離。RLS (Row Level Security) により他Appのデータへのアクセスを遮断。

### **6.2 制限 (Quotas)**

| 項目 | 制限内容 | 備考 |
| :--- | :--- | :--- |
| **ストレージ容量** | **50MB** / App | テキスト・設定データ用。画像はR2(別枠)利用を推奨。 |
| **レコード数** | **1,000** 件 / User / App | 1ユーザーが1つのアプリで保存できるレコード数。 |
| **Read/Write** | SupabaseのRate Limitに準拠 | 過度なリクエストはブロック。 |
| **テーブル作成** | **不可** | ユーザーによる任意の CREATE TABLE は禁止。 |

### **追加テーブル (Schema)**

- `tools_app_data`:
  - `id`: UUID (PK)
  - `app_id`: App ID (FK)
  - `user_id`: User ID (FK) - 所有者
  - `collection`: String (任意のコレクション名/キー)
  - `data`: JSONB (実データ)
  - `is_public`: Boolean (公開データかどうか)
