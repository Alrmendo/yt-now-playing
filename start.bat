@echo off
title YT Now Playing
chcp 65001 >nul

echo.
echo  ╔══════════════════════════════════╗
echo  ║      YT Now Playing Widget       ║
echo  ╚══════════════════════════════════╝
echo.

:: ── Check Node.js ──────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Node.js not found.
    echo.
    echo  Please install Node.js first:
    echo  https://nodejs.org  (choose the LTS version)
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  Node.js %NODE_VER% detected.

:: ── Install dependencies (only if needed) ─────────────────────────────────
if not exist "node_modules" (
    echo.
    echo  Installing dependencies (first run only, may take a minute)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  [!] npm install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
)

:: ── Launch ─────────────────────────────────────────────────────────────────
echo.
echo  Launching widget...
echo  (Close this window to quit)
echo.
call npm run electron:dev

pause
