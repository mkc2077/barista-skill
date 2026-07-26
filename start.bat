@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo   Barista Skill - One-click start
echo ========================================
echo.

REM Locate repo root (parent of this script's directory)
set "REPO=%~dp0"
set "REPO=%REPO:~0,-1%"

REM Find Python (try py launcher first, then python)
set "PY="
where py.exe >nul 2>nul
if not errorlevel 1 set "PY=py.exe"

if not defined PY (
    where python.exe >nul 2>nul
    if not errorlevel 1 set "PY=python.exe"
)

if not defined PY (
    echo [ERROR] Python not found
    echo Please install Python 3.10+
    pause
    exit /b 1
)

echo [1/4] Python: %PY%
%PY% --version
echo.

REM Check mcp-server deps
echo [2/4] Checking dependencies...
%PY% -c "import mcp" >nul 2>nul
if errorlevel 1 (
    echo   mcp not found, installing...
    %PY% -m pip install "mcp[cli]>=1.8.0" starlette uvicorn
    if errorlevel 1 (
        echo [ERROR] Dependencies install failed
        pause
        exit /b 1
    )
) else (
    echo   mcp OK
)

%PY% -c "import starlette, uvicorn" >nul 2>nul
if errorlevel 1 (
    echo   starlette/uvicorn not found, installing...
    %PY% -m pip install starlette uvicorn
    if errorlevel 1 (
        echo [ERROR] HTTP deps install failed
        pause
        exit /b 1
    )
) else (
    echo   starlette/uvicorn OK
)

REM Start MCP server in background
echo.
echo [3/4] Starting MCP Server (HTTP)...
cd /d "%REPO%\mcp-server"
start "Barista MCP Server" /min %PY% server.py --transport http --host 127.0.0.1 --port 8765

REM Wait for server to be ready
echo   Waiting for server...
set "READY=0"
for /l %%i in (1,1,15) do (
    timeout /t 1 /nobreak >nul
    powershell -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:8765/mcp' -Method POST -ContentType 'application/json' -Body '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
    if not errorlevel 1 (
        set "READY=1"
        echo   Server ready
        goto :ready
    )
    echo   Waiting... %%i/15
)
:ready
if "%READY%"=="0" (
    echo [WARN] Server not ready in 15s, opening browser anyway
)

REM Open browser
echo.
echo [4/4] Opening browser...
set "HTML=%REPO%\web\barista-chat.html"
if exist "%HTML%" (
    start "" "%HTML%"
    echo.
    echo ========================================
    echo   Started successfully
    echo   MCP Server: http://127.0.0.1:8765/mcp
    echo   Enable MCP tools in settings
    echo ========================================
    echo   Close the minimized MCP window to stop server
    echo.
    pause
) else (
    echo [ERROR] Not found: %HTML%
    pause
    exit /b 1
)