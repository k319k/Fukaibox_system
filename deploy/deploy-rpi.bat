@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ================================================================
REM FukaiBox Raspberry Pi Deployment Script (v2.0.0)
REM React + HeroUI Edition
REM ================================================================

set SETUP_ONLY=%1
set BUILD_ONLY=%2
set NO_BUILD=%3

set RPI_HOST=fukaibox@rpi-server.local
set REMOTE_DIR=/opt/fukaibox
set PUBLIC_DOMAIN=fukaibox.kanjousekai.jp

echo ================================================
echo   FukaiBox Deployment v2.0.0
echo   Target: Raspberry Pi Native
echo   Domain: %PUBLIC_DOMAIN%
echo ================================================
echo.

REM -------------------- Setup Only Mode --------------------
if "%SETUP_ONLY%"=="-SetupOnly" (
    echo Transferring initial setup script...
    scp -o StrictHostKeyChecking=no "%~dp0rpi\setup-rpi.sh" "%RPI_HOST%:~/"
    echo.
    echo Run the following command on Raspberry Pi:
    echo    sudo bash ~/setup-rpi.sh
    exit /b 0
)

REM -------------------- Build Frontend --------------------
if not "%NO_BUILD%"=="-NoBuild" (
    echo Building frontend React + HeroUI...
    
    if exist "%~dp0..\frontend" (
        pushd "%~dp0..\frontend"
        call npm install
        call npm run build
        if errorlevel 1 (
            popd
            echo Frontend build failed!
            exit /b 1
        )
        popd
        echo Frontend build complete!
    ) else (
        echo No frontend directory found, skipping...
    )
)

if "%BUILD_ONLY%"=="-BuildOnly" (
    echo Build complete - no deployment
    exit /b 0
)

REM -------------------- Transfer Backend --------------------
echo.
echo Transferring backend files...
ssh -o StrictHostKeyChecking=no %RPI_HOST% "mkdir -p %REMOTE_DIR%/backend"
scp -o StrictHostKeyChecking=no -r "%~dp0..\backend\app" "%RPI_HOST%:%REMOTE_DIR%/backend/"
scp -o StrictHostKeyChecking=no "%~dp0..\backend\requirements.txt" "%RPI_HOST%:%REMOTE_DIR%/backend/"

REM -------------------- Transfer Frontend --------------------
echo.
echo Transferring frontend files...
ssh -o StrictHostKeyChecking=no %RPI_HOST% "mkdir -p %REMOTE_DIR%/frontend"
if exist "%~dp0..\frontend\dist" (
    scp -o StrictHostKeyChecking=no -r "%~dp0..\frontend\dist" "%RPI_HOST%:%REMOTE_DIR%/frontend/"
    REM Fix permissions to prevent 403 Forbidden
    ssh -o StrictHostKeyChecking=no %RPI_HOST% "chmod -R 755 %REMOTE_DIR%/frontend/dist && chown -R fukaibox:www-data %REMOTE_DIR%/frontend/dist"
    echo   Frontend permissions fixed
)

REM -------------------- Transfer Configuration --------------------
echo.
echo Transferring configuration files...

if exist "%~dp0.env" (
    scp -o StrictHostKeyChecking=no "%~dp0.env" "%RPI_HOST%:%REMOTE_DIR%/"
    echo   .env transferred
) else (
    echo   .env not found - using defaults
)

if exist "%~dp0firebase-credentials.json" (
    scp -o StrictHostKeyChecking=no "%~dp0firebase-credentials.json" "%RPI_HOST%:%REMOTE_DIR%/backend/"
    echo   firebase-credentials.json transferred
) else (
    echo   firebase-credentials.json not found
)

if exist "%~dp0google-credentials.json" (
    scp -o StrictHostKeyChecking=no "%~dp0google-credentials.json" "%RPI_HOST%:%REMOTE_DIR%/backend/"
    echo   google-credentials.json transferred
) else (
    echo   google-credentials.json not found
)

REM -------------------- Transfer Cloudflare Tunnel Config --------------------
echo.
echo Transferring Cloudflare Tunnel configuration...
if exist "%~dp0cloudflared\config.yml" (
    ssh -o StrictHostKeyChecking=no %RPI_HOST% "mkdir -p ~/.cloudflared"
    scp -o StrictHostKeyChecking=no "%~dp0cloudflared\config.yml" "%RPI_HOST%:~/.cloudflared/"
    echo   Cloudflare Tunnel config transferred
)

REM -------------------- Transfer Systemd and Nginx --------------------
echo.
echo Transferring service configurations...
scp -o StrictHostKeyChecking=no "%~dp0rpi\fukaibox-backend.service" "%RPI_HOST%:~/fukaibox-backend.service"
if exist "%~dp0rpi\nginx-fukaibox.conf" (
    scp -o StrictHostKeyChecking=no "%~dp0rpi\nginx-fukaibox.conf" "%RPI_HOST%:~/nginx-fukaibox.conf"
)

REM -------------------- Remote Setup --------------------
echo.
echo Executing setup on Raspberry Pi...
ssh -o StrictHostKeyChecking=no %RPI_HOST% "source /opt/fukaibox/venv/bin/activate && pip install -r /opt/fukaibox/backend/requirements.txt --quiet"

echo Installing systemd service...
ssh -o StrictHostKeyChecking=no %RPI_HOST% "sed -i 's/\r$//' ~/fukaibox-backend.service && sudo mv ~/fukaibox-backend.service /etc/systemd/system/ && sudo systemctl daemon-reload"

echo Restarting services...
ssh -o StrictHostKeyChecking=no %RPI_HOST% "sudo systemctl restart fukaibox-backend && sudo systemctl enable fukaibox-backend"

echo.
echo ================================================
echo   Deployment Complete!
echo ================================================
echo.
echo Access URLs:
echo   Local:   http://rpi-server.local/
echo   Public:  https://%PUBLIC_DOMAIN%/
echo   API:     http://rpi-server.local:8000/health
echo   Docs:    http://rpi-server.local:8000/docs
echo.
