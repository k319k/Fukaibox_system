@echo off
chcp 65001 >nul
REM FukaiBox Development Server Launcher
REM Starts web frontend on port 3000

echo [92mFukaiBox Development Server[0m
echo Starting web frontend on http://localhost:3000/
echo.

cd /d "%~dp0..\web"

echo [93mInstalling dependencies...[0m
call npm install

echo.
echo [93mStarting Vite dev server on port 3000...[0m
echo.
echo [96mPress Ctrl+C to stop[0m
echo.

npm run dev -- --port 3000 --host 0.0.0.0
