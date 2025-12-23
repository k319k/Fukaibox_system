# FukaiBox バックアップスクリプト
# 使用方法: .\backup.ps1

$ErrorActionPreference = "Stop"

# バックアップ設定
$BackupDir = "backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupName = "fukaibox_backup_$Timestamp"
$BackupPath = Join-Path $BackupDir $BackupName

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  FukaiBox バックアップツール" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# バックアップディレクトリ作成
if (-not (Test-Path $BackupDir)) {
    Write-Host "[INFO] バックアップディレクトリを作成: $BackupDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

Write-Host "[INFO] バックアップを開始: $BackupName" -ForegroundColor Green
New-Item -ItemType Directory -Path $BackupPath | Out-Null

# 1. ソースコードのバックアップ
Write-Host "[1/4] ソースコードをバックアップ中..." -ForegroundColor White
$SourceDirs = @("frontend", "backend", "deploy")
foreach ($dir in $SourceDirs) {
    if (Test-Path $dir) {
        Write-Host "  - $dir をコピー中..." -ForegroundColor Gray
        Copy-Item -Path $dir -Destination $BackupPath -Recurse -Force
    } else {
        Write-Host "  ! $dir が見つかりません (スキップ)" -ForegroundColor Yellow
    }
}

# 2. 設定ファイルのバックアップ
Write-Host "[2/4] 設定ファイルをバックアップ中..." -ForegroundColor White
$ConfigFiles = @(
    ".gitignore",
    "DEVELOPMENT.md",
    "README.md"
)
foreach ($file in $ConfigFiles) {
    if (Test-Path $file) {
        Write-Host "  - $file をコピー中..." -ForegroundColor Gray
        Copy-Item -Path $file -Destination $BackupPath -Force
    }
}

# 3. データベースのバックアップ
Write-Host "[3/5] PostgreSQLデータベースをバックアップ中..." -ForegroundColor White
$DbBackupDir = Join-Path $BackupPath "database"
New-Item -ItemType Directory -Path $DbBackupDir -Force | Out-Null

try {
    Write-Host "  - サーバーから最新のDBバックアップをダウンロード中..." -ForegroundColor Gray
    $LatestBackup = ssh fukaibox@rpi-server.local "ls -t /opt/fukaibox/db-backups/*.sql.gz 2>/dev/null | head -1"
    
    if ($LatestBackup) {
        scp "fukaibox@rpi-server.local:$LatestBackup" $DbBackupDir/
        $BackupFile = Get-ChildItem -Path $DbBackupDir -Filter "*.sql.gz" | Select-Object -First 1
        if ($BackupFile) {
            $DbSize = [math]::Round($BackupFile.Length / 1MB, 2)
            Write-Host "  ✓ データベースバックアップ完了 ($DbSize MB)" -ForegroundColor Green
        }
    } else {
        Write-Host "  ! サーバー上にバックアップが見つかりません" -ForegroundColor Yellow
        Write-Host "  - 今すぐバックアップを作成中..." -ForegroundColor Gray
        ssh fukaibox@rpi-server.local "sudo systemctl start fukaibox-backup.service"
        Start-Sleep -Seconds 5
        $LatestBackup = ssh fukaibox@rpi-server.local "ls -t /opt/fukaibox/db-backups/*.sql.gz 2>/dev/null | head -1"
        if ($LatestBackup) {
            scp "fukaibox@rpi-server.local:$LatestBackup" $DbBackupDir/
            Write-Host "  ✓ バックアップ作成完了" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  ✗ データベースバックアップに失敗: $_" -ForegroundColor Red
    Write-Host "  サーバー接続を確認してください" -ForegroundColor Yellow
}

# 4. 環境設定ファイルのバックアップ
Write-Host "[4/5] 環境設定をバックアップ中..." -ForegroundColor White
$EnvFiles = @(".env", "firebase-credentials.json", "google-credentials.json")
foreach ($envFile in $EnvFiles) {
    $envPath = Join-Path "backend" $envFile
    if (Test-Path $envPath) {
        Write-Host "  - $envFile をコピー中..." -ForegroundColor Gray
        Copy-Item -Path $envPath -Destination "$BackupPath\backend\" -Force
    }
}

# 5. ZIPアーカイブ作成
Write-Host "[5/5] ZIPアーカイブを作成中..." -ForegroundColor White
$ZipPath = "$BackupPath.zip"
Compress-Archive -Path $BackupPath -DestinationPath $ZipPath -Force
Write-Host "  - ZIP作成完了: $ZipPath" -ForegroundColor Gray

# バックアップフォルダを削除（ZIPのみ保持）
Remove-Item -Path $BackupPath -Recurse -Force

# バックアップサイズを表示
$BackupSize = (Get-Item $ZipPath).Length / 1MB
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  バックアップ完了！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  ファイル: $ZipPath" -ForegroundColor Cyan
Write-Host "  サイズ: $([math]::Round($BackupSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# 古いバックアップの削除（30日以上前のものを削除）
Write-Host "[INFO] 古いバックアップをクリーンアップ中..." -ForegroundColor Yellow
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "*.zip" | 
              Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }

if ($OldBackups.Count -gt 0) {
    foreach ($old in $OldBackups) {
        Write-Host "  - 削除: $($old.Name)" -ForegroundColor Gray
        Remove-Item $old.FullName -Force
    }
    Write-Host "  $($OldBackups.Count) 個の古いバックアップを削除しました" -ForegroundColor Green
} else {
    Write-Host "  削除する古いバックアップはありません" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Backup process completed successfully!" -ForegroundColor Green

