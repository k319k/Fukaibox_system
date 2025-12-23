#!/bin/bash
# FukaiBox Raspberry Pi 初期セットアップスクリプト
# 実行: sudo bash setup-rpi.sh

set -e

echo "🔧 FukaiBox Raspberry Pi セットアップ開始..."

# 1. システムパッケージ更新
echo "📦 システムパッケージを更新中..."
apt update && apt upgrade -y

# 2. Install required packages
echo "📦 Installing required packages..."
apt install -y \
    python3 \
    python3-venv \
    python3-pip \
    python3-dev \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    build-essential \
    libpq-dev

# 3. ユーザー作成
echo "👤 fukaiboxユーザーを作成中..."
if ! id -u fukaibox > /dev/null 2>&1; then
    useradd -m -s /bin/bash fukaibox
    echo "✅ fukaiboxユーザー作成完了"
else
    echo "ℹ️  fukaiboxユーザーは既に存在します"
fi

# 4. ディレクトリ作成
echo "📂 ディレクトリ構造を作成中..."
mkdir -p /opt/fukaibox/{backend,web/dist,logs}
chown -R fukaibox:fukaibox /opt/fukaibox

# 5. PostgreSQL設定
echo "🐘 PostgreSQLを設定中..."
sudo -u postgres psql <<EOF
CREATE DATABASE fukaibox;
CREATE USER fukaibox WITH PASSWORD 'CHANGE_ME_IN_PRODUCTION';
GRANT ALL PRIVILEGES ON DATABASE fukaibox TO fukaibox;
\q
EOF

# PostgreSQLを起動
systemctl enable postgresql
systemctl start postgresql

echo "✅ PostgreSQL設定完了"

# 6. Create Python virtual environment
echo "🐍 Creating Python virtual environment..."
sudo -u fukaibox python3 -m venv /opt/fukaibox/venv
echo "✅ Virtual environment created"

# 7. Nginx設定
echo "🌐 Nginxを設定中..."
systemctl enable nginx

echo ""
echo "✨ 初期セットアップ完了！"
echo ""
echo "次のステップ:"
echo "1. Windowsから deploy-rpi-native.ps1 を実行してアプリをデプロイ"
echo "2. /opt/fukaibox/.env を編集してDiscord OAuth設定など"
echo "3. systemctl start fukaibox-backend でサービス起動"
echo ""
