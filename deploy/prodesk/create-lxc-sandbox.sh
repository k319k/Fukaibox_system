#!/bin/bash
# ProDesk LXC コンテナ作成スクリプト
# 実行: bash create-lxc-sandbox.sh (Proxmox host上で実行)

set -e

CTID=100  # コンテナID (適宜変更)
HOSTNAME="fukaibox-sandbox"
ROOTPW="fukaibox123"  # 初期rootパスワード（後で変更）
STORAGE="local-lvm"  # ストレージプール名
TEMPLATE="ubuntu-22.04-standard"  # テンプレート

echo "🚀 FukaiBox Sandbox LXCコンテナを作成中..."

# 1. LXCコンテナ作成
pct create $CTID $STORAGE:vztmpl/$TEMPLATE.tar.zst \
    --hostname $HOSTNAME \
    --password $ROOTPW \
    --cores 2 \
    --memory 2048 \
    --swap 512 \
    --net0 name=eth0,bridge=vmbr0,ip=dhcp \
    --storage $STORAGE \
    --rootfs $STORAGE:8 \
    --unprivileged 1 \
    --features nesting=1,keyctl=1

echo "✅ コンテナ $CTID 作成完了"

# 2. コンテナ起動
echo "🔄 コンテナを起動中..."
pct start $CTID
sleep 5

# 3. 基本パッケージインストール
echo "📦 基本パッケージをインストール中..."
pct exec $CTID -- bash -c "
    apt update
    apt upgrade -y
    apt install -y python3.11 python3.11-venv python3-pip docker.io git curl
    systemctl enable docker
    systemctl start docker
"

# 4. sandboxユーザー作成
echo "👤 sandboxユーザーを作成中..."
pct exec $CTID -- bash -c "
    useradd -m -s /bin/bash sandbox
    usermod -aG docker sandbox
    mkdir -p /app/projects
    chown -R sandbox:sandbox /app
"

# 5. リソース制限設定
echo "⚙️ リソース制限を設定中..."
pct exec $CTID -- bash -c "
    # ストレージクォータ（2GB）
    mkdir -p /app/projects
    # ディスククォータは後でext4 quotaで設定
"

echo ""
echo "✅ LXCコンテナ作成完了！"
echo ""
echo "📋 コンテナ情報:"
echo "   ID:       $CTID"
echo "   Hostname: $HOSTNAME"
echo "   IP:       $(pct exec $CTID -- hostname -I | awk '{print $1}')"
echo ""
echo "次のステップ:"
echo "1. pct enter $CTID でコンテナに入る"
echo "2. Windowsから deploy-prodesk-lxc.ps1 を実行してサンドボックスAPIをデプロイ"
echo ""
