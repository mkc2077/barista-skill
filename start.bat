@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo   ============================================
echo     Barista Skill -- One-click Start
echo   ============================================
echo.

REM ─── Locate repo root ───
set "REPO=%~dp0"
if "%REPO:~-1%"=="\" set "REPO=%REPO:~0,-1%"

REM ─── Find Python ───
set "PY="
where py.exe >nul 2>nul && set "PY=py.exe"
if not defined PY (
    where python.exe >nul 2>nul && set "PY=python.exe"
)
if not definedPY (
    echo [ERROR] Python 3.10+ not found
    pause
    exit /b 1
)

REM ─── Find Node ───
set "NODE="
where node.exe >nul 2>nul && set "NODE=node.exe"
if not definedNODE (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)

REM ─── Find npm ───
set "NPM="
where npm.cmd >nul 2>nul && set "NPM=npm.cmd"
where npm >nul 2>nul && if not definedNPM set "NPM=npm"
if not definedNPM (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

echo [1/5] Python: %PY%
%PY% --version
echo        Node:  %NODE%
echo        npm:   %NPM%
%NODE% --version
echo.

REM ─── Check mcp-server deps ───
echo [2/5] Checking Python dependencies...
%PY% -c "import mcp" >nul 2>nul
if errorlevel 1 (
    echo   Installing mcp...
    %PY% -m pip install "mcp[cli]>=1.8.0" starlette uvicorn -q
)
%PY% -c "import starlette, uvicorn" >nul 2>nul
if errorlevel 1 (
    %PY% -m pip install starlette uvicorn -q
)
echo   Python deps OK

REM ─── Check Next.js deps ───
echo [3/5] Checking Next.js deps...
cd /d "%REPO%\web\next-app"
if not exist "node_modules\.package-lock.json" (
    echo   Installing npm packages...
    call %NPM% install --silent
)
echo   npm deps OK

REM ─── Start MCP Server in background ───
echo.
echo [4/5] Starting MCP Server (HTTP)...
cd /d "%REPO%\mcp-server"
start "Barista MCP Server" /min %PY% server.py --transport http --host 127.0.0.1 --port 8765

REM ─── Wait for MCP server ───
echo   Waiting for MCP server...
set "READY=0"
for /l %%i in (1,1,20) do (
    timeout /t 1 /nobreak >nul
    %PY% -c "import urllib.request,json; req=urllib.request.Request('http://127.0.0.1:8765/mcp',data=json.dumps({'jsonrpc':'2.0','method':'tools/list','id':1}).encode(),headers={'Content-Type':'application/json','Accept':'application/json, text/event-stream'},method='POST'); urllib.request.urlopen(req,timeout=2)" >nul 2>nul
    if not errorlevel 1 (
        set "READY=1"
        echo   MCP server ready ^(http://127.0.0.1:8765/mcp^)
        goto :mcp_ready
    )
)
:mcp_ready
if "%READY%"=="0" echo [WARN] MCP server may not be ready

REM ─── Start Next.js dev server ───
echo.
echo [5/5] Starting Next.js frontend...
cd /d "%REPO%\web\next-app"
echo   Dev server at http://localhost:3000
echo.
echo   ============================================
echo     Barista running. Open your browser:
echo     http://localhost:3000
echo   ============================================
echo     Close this window to stop both servers.
echo.

start "" http://localhost:3000
call %NPM% run dev
