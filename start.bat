@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo   Barista Skill - 一键启动 / One-click start
echo ========================================
echo.

REM Locate repo root (parent of this script's directory)
set "REPO=%~dp0"
set "REPO=%REPO:~0,-1%"

REM Find Python
set "PY="
where py.exe >nul 2>&1 && set "PY=py.exe"
if not defined PY (
    where python.exe >nul 2>&1 && set "PY=python.exe"
)
if not defined PY (
    echo [ERROR] 未找到 Python / Python not found
    echo 请安装 Python 3.10+ / Please install Python 3.10+
    pause
    exit /b 1
)
echo [1/4] Python: %PY%
%PY% --version

REM Check mcp-server deps
echo.
echo [2/4] 检查依赖 / Checking dependencies...
%PY% -c "import mcp" 2>nul
if errorlevel 1 (
    echo   mcp 未安装，正在安装 / mcp not found, installing...
    %PY% -m pip install "mcp[cli]>=1.8.0" starlette uvicorn
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败 / Dependencies install failed
        pause
        exit /b 1
    )
) else (
    echo   mcp OK
)
%PY% -c "import starlette, uvicorn" 2>nul
if errorlevel 1 (
    echo   starlette/uvicorn 未安装，正在安装 / installing...
    %PY% -m pip install starlette uvicorn
    if errorlevel 1 (
        echo [ERROR] HTTP 依赖安装失败 / HTTP deps install failed
        pause
        exit /b 1
    )
) else (
    echo   starlette/uvicorn OK
)

REM Start MCP server in background
echo.
echo [3/4] 启动 MCP Server (HTTP) / Starting MCP Server...
cd /d "%REPO%\mcp-server"
start "Barista MCP Server" /min %PY% server.py --transport http --host 127.0.0.1 --port 8765

REM Wait for server to be ready
echo   等待服务器就绪 / Waiting for server...
set "READY=0"
for /l %%i in (1,1,15) do (
    timeout /t 1 /nobreak >nul
    powershell -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:8765/mcp' -Method POST -ContentType 'application/json' -Body '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if not errorlevel 1 (
        set "READY=1"
        echo   服务器就绪 / Server ready
        goto :ready
    )
    echo   等待中... %%i/15
)
:ready
if "%READY%"=="0" (
    echo [WARN] 服务器未在 15 秒内就绪，仍尝试打开浏览器 / Server not ready in 15s, opening browser anyway
)

REM Open browser
echo.
echo [4/4] 打开浏览器 / Opening browser...
set "HTML=%REPO%\web\barista-chat.html"
if exist "%HTML%" (
    start "" "%HTML%"
    echo.
    echo ========================================
    echo   启动完成 / Started successfully
    echo   浏览器已打开 / Browser opened
    echo   MCP Server: http://127.0.0.1:8765/mcp
    echo   在设置里填入 MCP 地址并勾选启用工具
    echo   Fill MCP URL in settings and enable tools
    echo ========================================
    echo   关闭此窗口不会停止后台服务器
    echo   Close the minimized MCP window to stop server
    echo.
    pause
) else (
    echo [ERROR] 未找到 %HTML%
    pause
    exit /b 1
)
