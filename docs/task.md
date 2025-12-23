# 封解Box 全機能実装タスクリスト

## 🎯 コーディング規約

### Atomic File Rules

このプロジェクトでは 'Atomic File Rules'(AFR) を適用します。

- javascript,python,reactの1ファイルは200行以内に収めること。
- 行数を超えそうな場合は、即座にロジックを別ファイル（utils.js や hooks.js）に切り出すか、コンポーネントを子コンポーネントに分割すること。
- ファイル名はその役割が1秒でわかる名前にすること。

### その他の規約

- **Zustandストア分割**: sheetStore, sectionStore, pointStore, toolsStoreに分ける
- **PropTypes**: TypeScript不使用のため、詳細なコメントで引数の型を明記
- **デプロイスクリプト**: 必ずdeploy.batを使用
- **ゼロエラー**: エラー・バグを0にするため、コードレビューを厳格に行う

---

## 現在の実装状況

### ✅ 実装済み機能

- [x] React + Ant Design (HeroUI不採用)
- [x] Zustand状態管理 (authStore, sheetStore, sectionStore)
- [x] FastAPI バックエンド
- [x] PostgreSQL データベース
- [x] Discord認証（儀長判定）
- [x] シート作成・管理
- [x] **セクション分割機能（Ctrl+Enter完全実装）**
- [x] 画像アップロード
- [x] 画像採用システム
- [x] 点数システム（基本）
- [x] ユーザー名入力ログイン
- [x] 4タブUI（推敲・アップロード・採用・ダウンロード）
- [x] 画像ギャラリービューアー（矢印キー対応）
- [x] セクションごとの画像指示・参考画像
- [x] **儀員限定モード（Phase 3完了）**
- [x] **640×480 Pillow自動リサイズ（Phase 4完了）**
- [x] **点数システムAPI完全実装（Phase 5完了）**
- [x] **ユーザーブロック機能（Phase 6完了）**
- [x] **リフレッシュトークン実装（Phase 6完了）**
- [x] **JSX 200行制限準拠（Home, SectionEditor, UserManagement）**

---

## 🔴 優先度 HIGH - 未実装の必須機能

### ~~Phase 4: 画像処理 (Pillow)~~ ✅ 完了

- [x] 640×480 Center Crop 自動リサイズ
- [x] オリジナル画像も保存（uploads/{sheet_id}/originals/）
- [x] リサイズ版/オリジナル版選択UI（DownloadTab）
- [x] バックエンドsizeパラメータ対応

### ~~Phase 5: 点数システム完全実装~~ ✅ 完了

#### バックエンドAPI ✅ 完了

- [x] 報酬設定API (`GET/PUT /settings/rewards`)
- [x] 点数調整API (`POST /settings/users/{user_id}/points/adjust`)
- [x] ランキングAPI (`GET /settings/users/ranking`)
- [x] 点数履歴API (`GET /settings/users/{user_id}/points/history`)

#### フロントエンドUI ✅ 完了

- [x] Settings.jsx - 報酬設定画面
  - [x] アップロード点数設定
  - [x] 採用ボーナス点数設定
  - [x] 保存機能
- [x] RankingWidget.jsx - ランキング表示
  - [x] トップ10表示
  - [x] 金銀銅メダル表示
  - [x] 儀長バッジ
- [x] ホーム画面にランキング追加（2カラムレイアウト）

### ~~Phase 6: ユーザー管理~~ ✅ 完了

- [x] ブロック機能
  - [x] 儀長が任意ユーザーをブロック可能
  - [x] ブロックされたユーザーのアクセス制限
  - [x] ブロックリスト管理UI（UserManagement.jsx）
  - [x] ブロック理由保存機能
- [x] ログイン継続
  - [x] Zustand persist
  - [x] リフレッシュトークンの実装（6時間ごと自動更新）
  - [x] 自動ログアウト（トークン更新失敗時）

---

## 🔵 ~~Phase 8: バックアップ・データ保護~~ ✅ 完了

### バックアップシステム ✅ バックエンド完了

- [x] PostgreSQL自動バックアップ（Cron）
  - [x] `postgres-backup.sh` - 毎日3時に実行
  - [x] 30日間ローカル保持
  - [x] 圧縮保存 (.sql.gz)
- [x] Google Drive同期
  - [x] `sync_to_gdrive.py` - 自動アップロード
  - [x] 30日以上古いファイル自動削除
- [x] バックエンドAPI
  - [x] POST `/backup/database/create` - バックアップ作成
  - [x] GET `/backup/local/list` - バックアップ一覧
  - [x] POST `/backup/database/restore/{filename}` - リストア
  - [x] DELETE `/backup/local/{filename}` - 削除
- [x] フロントエンドUI ✅ 完了
  - [x] BackupManagement.jsx
  - [x] バックアップ一覧表示
  - [x] 手動バックアップ作成
  - [x] リストア機能
  - [x] 削除機能

### ~~設定ページ統合~~ ✅ 完了

現在、FukaiBoxには複数の設定ページが存在します：

#### 1. Settings.jsx (`/settings`) - 報酬設定 ✅

- アップロード点数設定
- 採用ボーナス点数設定
- 儀長のみアクセス可能

#### 2. UserManagement.jsx (`/users`) - ユーザー管理 ✅

- 全ユーザー一覧
- ブロック/解除機能
- ブロック理由入力
- 儀長のみアクセス可能

#### 3. BackupManagement.jsx (`/admin/backup`) - バックアップ管理 ✅

- バックアップ一覧
- 手動バックアップ作成
- リストア機能（確認ダイアログ付き）
- 儀長のみアクセス可能

#### 実装: AdminPanel.jsx ✅ 完了

すべての設定を一つの `AdminPanel.jsx` に統合：

```javascript
/admin - 統合管理パネル
  ├─ タブ: 報酬設定 (SettingsContentコンポーネント)
  ├─ タブ: ユーザー管理 (UserManagementContentコンポーネント)
  └─ タブ: バックアップ (BackupManagementContentコンポーネント)
```

**実装完了内容**:

- [x] AdminPanel.jsx作成 (95行)
- [x] タブ切り替えUI実装
- [x] 既存コンポーネントをタブコンテンツとして再利用
  - [x] SettingsContent.jsx (120行)
  - [x] UserManagementContent.jsx (165行)
  - [x] BackupManagementContent.jsx (240行)
- [x] `/admin`ルート追加
- [x] 既存ルートを統合ルートにリダイレクト
  - `/settings` → `/admin?tab=settings`
  - `/users` → `/admin?tab=users`
  - `/admin/backup` → `/admin?tab=backup`
- [x] URLパラメータ連携（直リンク対応）

#### 4. 個人設定 ✅ 完了

- [x] プロフィール設定
- [x] Googleアカウント連携設定 (UI準備完了)
- [x] Discordアカウント連携設定 (ステータス表示)
- [x] プロフィール画像設定
- [x] パスワード変更 (非Discordユーザー用)
- [x] セキュリティ設定
- [x] 外観カスタマイズ
- [x] 通知設定
- [x] 封解Boxアカウント保持者のみアクセス可能

**実装完了内容** (2025-12-21):

- PersonalSettings.jsx (77行) - タブUI実装
- ProfileSection.jsx (147行) - プロフィール編集・画像アップロード
- AccountsSection.jsx (177行) - アカウント連携・パスワード管理
- AppearanceSection.jsx (124行) - テーマ・色・言語・フォントサイズ
- NotificationsSection.jsx (132行) - 通知設定
- SecuritySection.jsx (78行) - セキュリティ設定
- userStore.js - 状態管理 (外観設定永続化)
- バックエンドAPI 11エンドポイント実装
- データベースマイグレーション完了
- 本番環境デプロイ・動作確認済み

```
/admin
  ├─ タブ: 報酬設定
  ├─ タブ: ユーザー管理
  ├─ タブ: バックアップ
  └─ タブ: システム情報
```

---

## 🟡 優先度 MEDIUM - Tools (Sandbox) 実装

### **封解Box Tools 仕様**

#### リソース制限

- **1人あたり2GB** (ファイル・フォルダ無制限)
- **常時実行は3プロジェクトまで**
- **フロントエンドのみのものは出したユーザーが誰でも使えるように**
- プロジェクト超過時は古いものを自動停止

#### 実行環境

- **フロントエンド**: iframe (sandbox属性) + srcdoc方式
- **バックエンド**: Python subprocess または Dockerコンテナによるプロセス隔離
- **通信許可リスト**: Firebase, Discord, YouTube, Gemini, GPT, GDrive, GitHub, Wikipedia, 儀員点数API

#### バックエンドAPI

- [ ] Toolsプロジェクト管理API
- [ ] ファイル操作API
- [ ] 実行・プロセス管理API

#### フロントエンドUI

- [ ] ToolsHome (`/tools`) - プロジェクト一覧
- [ ] ToolEditor (`/tools/{id}`) - コードエディター
- [ ] 通信制御（許可リスト）
- [ ] サイドバーにToolsを追加
- [ ] サーバー管理UI
- [ ] プロジェクト作成UI
- [ ] プロジェクト削除UI
- [ ] プロジェクト停止UI
- [ ] プロジェクト開始UI
- [ ] プロジェクト一覧UI
- [ ] プロジェクト選択UI
- [ ] 封解Box Tools Gallery (ほかの人のプロジェクトが見える)

#### Zustand Store

- [ ] `toolsStore.js` 作成

---

## 🟢 優先度 LOW - 拡張機能

### Phase 7: オフライン対応

- [ ] IndexedDB (Dexie.js) 実装
- [ ] 同期システム

### Phase 8: Firebase統合

- [ ] Firestore リアルタイム同期
- [ ] Firebase Storage
- [ ] Firebase Auth

### Phase 9: 公開APIシステム ✅ 完了

- [x] 儀員点数API (X-API-KEY認証)
- [x] APIキー管理
- [x] APIキー生成/削除ができる封解Box DevStudioのUI(儀長と儀長によって許可された儀員のみ)

### Phase 10: サイドバー改善 ✅ 完了

- [x] サイドバーにDevStudio(儀長と儀長によって許可された儀員のみ)
- [x] サイドバーにAdminPanel(儀長のみ)

---

## 📋 コード品質・保守性

### JSX 200行制限の徹底

- [ ] Home.jsx (291行) → 分割必要
- [ ] SectionEditor.jsx (254行) → 分割必要
- [ ] 既存の大きいコンポーネント監査

### Zustand Store分割

- [x] authStore.js ✅
- [x] sheetStore.js ✅
- [x] sectionStore.js ✅
- [ ] pointStore.js
- [ ] toolsStore.js

### PropTypes・コメント

- [ ] 全コンポーネントにprop型定義コメント
- [ ] 複雑な関数にJSDoc追加

---

## 🎯 優先順位まとめ

### 今すぐ対応すべき項目

1. **Phase 5フロントエンド**: Settings.jsx, RankingWidget.jsx
2. JSX 200行制限違反の修正
3. DownloadTab リサイズ版/オリジナル版選択UI
4. ユーザーブロック機能

### 次のマイルストーン（Tools実装）

1. Toolsバックエンド基盤
2. ToolsフロントエンドUI
3. Sandboxセキュリティ

### 長期的課題

1. Firebase統合
2. オフライン対応
3. 公開API実装

---

## 最近の更新

### 2025-12-21

- [x] **Phase 5バックエンド完了**: 点数システムAPI実装
  - [x] 報酬設定API (GET/PUT /settings/rewards)
  - [x] 点数調整API (POST /settings/users/{user_id}/points/adjust)
  - [x] ランキングAPI (GET /settings/users/ranking)
  - [x] 点数履歴API (GET /settings/users/{user_id}/points/history)
  - [x] settings.py ルーター作成・登録
  - [x] バックエンドデプロイ完了
- [x] **Phase 4完了**: Pillow画像処理実装
  - [x] 640×480 Center Crop自動リサイズ
  - [x] オリジナル画像保存（uploads/{sheet_id}/originals/）
  - [x] データベースマイグレーション（original_file_path追加）

### 2025-12-20

- [x] **Phase 3完了**: 儀員限定モード実装
- [x] Ctrl+Enter セクション分割機能完全実装
- [x] 画像ギャラリービューアー実装
- [x] 4タブUI実装
- [x] AsyncSession対応（script_sections.py修正）
