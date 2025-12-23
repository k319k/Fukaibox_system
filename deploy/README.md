# 封解Box デプロイガイド

## システム構成

| サーバー | 構成 | 役割 |
|---------|------|------|
| **Raspberry Pi 5B** | ネイティブ (systemd) | FastAPI + PostgreSQL + Nginx |
| **ProDesk (Proxmox)** | LXC Container | 封解Box Tools サンドボックス |

---

## 📋 デプロイ手順

### 1️⃣ Raspberry Pi 初期セットアップ

```bash
# Raspberry Piにログイン
ssh fukaibox@rpi-server.local

# セットアップスクリプト実行
sudo bash ~/setup-rpi.sh
```

このスクリプトは以下を実行します：

- PostgreSQL インストール・設定
- Python 3.11 インストール
- fukaiboxユーザー作成
- Nginx インストール

### 2️⃣ ProDesk LXCコンテナ作成

```bash
# Proxmox hostにログイン
ssh root@192.168.1.14

# LXCコンテナ作成スクリプト実行
bash create-lxc-sandbox.sh
```

コンテナIDは `100` (スクリプト内で変更可能)

### 3️⃣ 環境設定

`deploy/.env` を作成：

```bash
# Database
DB_PASSWORD=your_secure_password

# Discord OAuth2
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_REDIRECT_URI=http://rpi-server.local/api/auth/discord/callback

# JWT
JWT_SECRET=your_jwt_secret

# CORS
CORS_ORIGINS=http://localhost:5173,http://rpi-server.local

# Sandbox (ProDesk LXCのIPアドレス)
SANDBOX_HOST=10.0.0.100  # LXCコンテナのIP
SANDBOX_PORT=9000
```

Firebase認証情報を `deploy/firebase-credentials.json` に配置

### 4️⃣ デプロイ実行

**Windowsから実行:**

```powershell
# 初回のみ: Raspberry Piにセットアップスクリプト転送
.\deploy\deploy-rpi-native.ps1 -SetupOnly

# 全体デプロイ
.\deploy\deploy.ps1 -Target all

# または個別に
.\deploy\deploy.ps1 -Target rpi      # Raspberry Piのみ
.\deploy\deploy.ps1 -Target prodesk  # ProDeskのみ
```

---

## 🔧 サービス管理

### Raspberry Pi

```bash
# サービス状態確認
sudo systemctl status fukaibox-backend

# ログ確認
sudo journalctl -u fukaibox-backend -f

# 再起動
sudo systemctl restart fukaibox-backend
sudo systemctl restart nginx
```

### ProDesk (Proxmox上で)

```bash
# コンテナに入る
pct enter 100

# サービス状態確認
systemctl status fukaibox-sandbox

# ログ確認
journalctl -u fukaibox-sandbox -f
```

---

## 🌐 アクセス

- **Web**: <http://rpi-server.local/>
- **API Docs**: <http://rpi-server.local/api/docs>
- **Health Check**: <http://rpi-server.local/api/health>
- **Sandbox Health**: http://[LXC-IP]:9000/health

---

## 📁 ディレクトリ構造

### Raspberry Pi

```
/opt/fukaibox/
├── backend/
│   ├── app/           # FastAPIアプリ
│   └── uploads/       # アップロード画像
├── web/
│   └── dist/          # Vue.js ビルド済み
├── venv/              # Python仮想環境
└── .env               # 環境変数
```

### ProDesk LXC

```
/app/
├── sandbox-api.py     # Flaskサンドボックス API
└── projects/          # ユーザープロジェクト
    └── [user_id]/
        └── [project_id]/
```

---

## 🐛 トラブルシューティング

### FastAPIが起動しない

```bash
# ログ確認
sudo journalctl -u fukaibox-backend -n 50

# 手動起動テスト
cd /opt/fukaibox/backend
source ../venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### PostgreSQL接続エラー

```bash
# PostgreSQL状態確認
sudo systemctl status postgresql

# 接続テスト
sudo -u postgres psql -d fukaibox
```

### Sandbox APIに接続できない

```bash
# ProDesk上で
pct exec 100 -- systemctl status fukaibox-sandbox

# ファイアウォール確認
pct exec 100 -- iptables -L
```

---

## 🔄 更新デプロイ

コード変更後：

```powershell
# Webのみビルド
.\deploy\deploy-rpi-native.ps1

# バックエンドのみ更新（Webビルドスキップ）
.\deploy\deploy-rpi-native.ps1 -NoBuild
```
