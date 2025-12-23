# FukaiBox リストアスクリプト
# バックアップからデータを復元
# 使用方法: .\restore.ps1 -BackupFile "backups\fukaibox_backup_2025-12-20_11-00-00.zip"

param(
    [Parameter(Mandatory=$true, HelpMessage="リストアするバックアップZIPファイルのパス")]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  FukaiBox リストアツール" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# バックアップファイルの存在確認
if (-not (Test-Path $BackupFile)) {
    Write-Host "[ERROR] バックアップファイルが見つかりません: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] リストア元: $BackupFile" -ForegroundColor Yellow
Write-Host ""

# 確認プロンプト
$Confirmation = Read-Host "このバックアップからリストアしますか？ (yes/no)"
if ($Confirmation -ne "yes") {
    Write-Host "[CANCEL] リストアをキャンセルしました" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
$TempDir = "temp_restore_$(Get-Date -Format 'yyyyMMddHHmmss')"

try {
    # 1. ZIP解凍
    Write-Host "[1/4] バックアップを解凍中..." -ForegroundColor White
    Expand-Archive -Path $BackupFile -DestinationPath $TempDir -Force
    Write-Host "  ✓ 解凍完了" -ForegroundColor Green
    Write-Host ""

    # 2. データベースリストア
    Write-Host "[2/4] データベースをリストア中..." -ForegroundColor White
    $DbBackupDir = Join-Path $TempDir "database"
    
    if (Test-Path $DbBackupDir) {
        $DbFile = Get-ChildItem -Path $DbBackupDir -Filter "*.sql.gz" | Select-Object -First 1
        
        if ($DbFile) {
            Write-Host "  - DBバックアップをサーバーにアップロード中..." -ForegroundColor Gray
            scp $DbFile.FullName fukaibox@rpi-server.local:/tmp/restore_db.sql.gz
            
            Write-Host "  - PostgreSQLにリストア中..." -ForegroundColor Gray
            ssh fukaibox@rpi-server.local @"
                gunzip -c /tmp/restore_db.sql.gz | psql -U fukaibox fukaibox
                rm /tmp/restore_db.sql.gz
"@
            Write-Host "  ✓ データベースリストア完了" -ForegroundColor Green
        } else {
            Write-Host "  ! データベースバックアップが見つかりません (スキップ)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ! データベースフォルダが見つかりません (スキップ)" -ForegroundColor Yellow
    }
    Write-Host ""

    # 3. ソースコードリストア
    Write-Host "[3/4] ソースコードをリストア中..." -ForegroundColor White
    
    # バックアップを作成（念のため）
    Write-Host "  - 現在のコードをバックアップ中..." -ForegroundColor Gray
    $BackupTimestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $PreRestoreBackup = "backups\pre_restore_$BackupTimestamp.zip"
    
    if (-not (Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    
    if (Test-Path "frontend") {
        Compress-Archive -Path "frontend", "backend", "deploy" -DestinationPath $PreRestoreBackup -Force
        Write-Host "  ✓ 現在のコード保存: $PreRestoreBackup" -ForegroundColor Gray
    }
    
    # フロントエンドリストア
    $FrontendPath = Join-Path $TempDir "frontend"
    if (Test-Path $FrontendPath) {
        if (Test-Path "frontend") {
            Remove-Item -Path "frontend" -Recurse -Force
        }
        Copy-Item -Path $FrontendPath -Destination "." -Recurse -Force
        Write-Host "  ✓ フロントエンドリストア完了" -ForegroundColor Green
    }
    
    # バックエンドリストア
    $BackendPath = Join-Path $TempDir "backend"
    if (Test-Path $BackendPath) {
        # .envは個別に確認
        $EnvPath = Join-Path $BackendPath ".env"
        if (Test-Path $EnvPath -and (Test-Path "backend\.env")) {
            $RestoreEnv = Read-Host "  ? .env ファイルも上書きしますか？ (yes/no)"
            if ($RestoreEnv -eq "yes") {
                Copy-Item -Path $EnvPath -Destination "backend\.env" -Force
                Write-Host "  ✓ .env リストア完了" -ForegroundColor Green
            } else {
                # .envを除外してコピー
                Remove-Item -Path $EnvPath -Force
            }
        }
        
        if (Test-Path "backend") {
            Remove-Item -Path "backend" -Recurse -Force -Exclude ".env"
        }
        Copy-Item -Path $BackendPath -Destination "." -Recurse -Force
        Write-Host "  ✓ バックエンドリストア完了" -ForegroundColor Green
    }
    Write-Host ""

    # 4. サーバーへのデプロイ確認
    Write-Host "[4/4] リストア後の処理..." -ForegroundColor White
    $DeployNow = Read-Host "  ? 変更をサーバーにデプロイしますか？ (yes/no)"
    
    if ($DeployNow -eq "yes") {
        Write-Host "  - デプロイを実行中..." -ForegroundColor Gray
        & ".\deploy\deploy.bat" rpi
        Write-Host "  ✓ デプロイ完了" -ForegroundColor Green
    } else {
        Write-Host "  ! デプロイは手動で実行してください: .\deploy\deploy.bat rpi" -ForegroundColor Yellow
    }
    Write-Host ""

    Write-Host "======================================" -ForegroundColor Green
    Write-Host "  リストア完了！" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "  リストアエラー" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "  エラー: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
    
} finally {
    # 一時ディレクトリを削除
    if (Test-Path $TempDir) {
        Write-Host "[CLEANUP] 一時ファイルを削除中..." -ForegroundColor Gray
        Remove-Item -Path $TempDir -Recurse -Force
        Write-Host "  ✓ クリーンアップ完了" -ForegroundColor Green
    }
}

Write-Host "リストア処理が完了しました！" -ForegroundColor Green
Write-Host ""
