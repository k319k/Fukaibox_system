@echo off
chcp 65001 >nul
REM ================================================================
REM FukaiBox Deployment Script (v2.0.0)
REM Deploy to Raspberry Pi (Native) + ProDesk (LXC)
REM ================================================================

setlocal
set TARGET=%~1
if "%TARGET%"=="" set TARGET=all
if "%TARGET%"=="-Target" set TARGET=%~2

echo ================================================
echo   FukaiBox Deployment v2.0.0
echo   Target: %TARGET%
echo ================================================
echo.

if "%TARGET%"=="rpi" goto deploy_rpi
if "%TARGET%"=="prodesk" goto deploy_prodesk
if "%TARGET%"=="all" goto deploy_all
echo Invalid target. Use: rpi, prodesk, or all
exit /b 1

REM Pre-deployment backup
:pre_deploy_backup
echo ================================================
echo   Creating pre-deployment backup...
echo ================================================
powershell -ExecutionPolicy Bypass -File backup.ps1
if errorlevel 1 (
    echo [ERROR] Backup failed! Continue anyway? (Ctrl+C to cancel)
    pause
)
echo [SUCCESS] Backup created
echo.
goto :eof

:deploy_rpi
call :pre_deploy_backup
echo Deploying to Raspberry Pi...
call "%~dp0deploy-rpi.bat"
if errorlevel 1 exit /b 1
goto end

:deploy_prodesk
echo Deploying ProDesk Sandbox...
call "%~dp0deploy-prodesk.bat"
if errorlevel 1 exit /b 1
goto end

:deploy_all
call :pre_deploy_backup
echo Deploying to Raspberry Pi...
call "%~dp0deploy-rpi.bat"
if errorlevel 1 exit /b 1
echo.
echo Deploying ProDesk Sandbox...
call "%~dp0deploy-prodesk.bat"
if errorlevel 1 exit /b 1
goto end

:end
echo.
echo ================================================
echo   All Deployments Complete!
echo ================================================
echo.
echo Access URLs:
echo   Local:     http://rpi-server.local/
echo   Public:    https://fukaibox.kanjousekai.jp/
echo   API:       http://rpi-server.local:8000/docs
echo   ProDesk:   http://192.168.1.14:9000/
echo.
