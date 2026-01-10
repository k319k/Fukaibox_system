# FukaiBox 開発ガイド

## 開発環境のセットアップ

### 1. フロントエンド開発サーバー起動

```cmd
# ポート3000で起動
deploy\dev-server.bat
```

アクセス: <http://localhost:3000/>

**自動設定:**

- ポート: 3000
- API プロキシ: `/api` → `http://localhost:8000`
- ホットリロード有効

### 2. バックエンド開発サーバー起動

```powershell
# Windowsローカルで起動
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# .env ファイル作成
cp ..\deploy\.env.example .env
# DATABASE_URL を設定

# 起動
uvicorn app.main:app --reload --port 8000
```

アクセス:

- API: <http://localhost:8000/health>
- Docs: <http://localhost:8000/docs>

### 3. PostgreSQL (ローカル開発用)

```powershell
# Docker で PostgreSQL 起動
docker run -d `
  --name fukaibox-postgres `
  -e POSTGRES_USER=fukaibox `
  -e POSTGRES_PASSWORD=fukaibox `
  -e POSTGRES_DB=fukaibox `
  -p 5432:5432 `
  postgres:15-alpine
```

DATABASE_URL:

```
postgresql+asyncpg://fukaibox:fukaibox@localhost:5432/fukaibox
```

## 開発ワークフロー

### コード変更 → ホットリロード

1. **フロントエンド**: ファイル保存で自動リロード
2. **バックエンド**: `--reload` オプションで自動再起動

### API テスト

```powershell
# Health check
curl http://localhost:8000/health

# Swagger UI
start http://localhost:8000/docs
```

### デバッグ

**VS Code launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--port",
        "8000"
      ],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

## 本番デプロイ

### フルデプロイ

```cmd
# Raspberry Pi + ProDesk 両方
deploy\deploy.bat all
```

### 個別デプロイ

```cmd
# Raspberry Pi のみ
deploy\deploy.bat rpi

# ProDesk のみ
deploy\deploy.bat prodesk
```

## トラブルシューティング

### ポート競合

```powershell
# ポート使用状況確認
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# プロセス終了
taskkill /PID <PID> /F
```

### SSH エラー

```powershell
# known_hosts クリア
ssh-keygen -R rpi-server.local
```

### npm エラー

```cmd
# キャッシュクリア
cd web
rmdir /s /q node_modules
del package-lock.json
npm install
```
