#!/usr/bin/env bash
set -e

echo "========================================"
echo "  Barista Skill - 一键启动 / One-click start"
echo "========================================"
echo

# Locate repo root (parent of this script's directory)
REPO="$(cd "$(dirname "$0")" && pwd)"

# Find Python
PY=""
if command -v python3 &>/dev/null; then PY="python3"
elif command -v python &>/dev/null; then PY="python"
else
    echo "[ERROR] 未找到 Python / Python not found"
    echo "请安装 Python 3.10+ / Please install Python 3.10+"
    exit 1
fi
echo "[1/4] Python: $PY"
$PY --version

# Check deps
echo
echo "[2/4] 检查依赖 / Checking dependencies..."
if ! $PY -c "import mcp" 2>/dev/null; then
    echo "  mcp 未安装，正在安装 / installing..."
    $PY -m pip install "mcp[cli]>=1.8.0" starlette uvicorn
else
    echo "  mcp OK"
fi
if ! $PY -c "import starlette, uvicorn" 2>/dev/null; then
    echo "  starlette/uvicorn 未安装，正在安装 / installing..."
    $PY -m pip install starlette uvicorn
else
    echo "  starlette/uvicorn OK"
fi

# Start MCP server in background
echo
echo "[3/4] 启动 MCP Server (HTTP) / Starting MCP Server..."
cd "$REPO/mcp-server"
$PY server.py --transport http --host 127.0.0.1 --port 8765 &
SERVER_PID=$!
echo "  Server PID: $SERVER_PID"

# Wait for server
echo "  等待服务器就绪 / Waiting for server..."
READY=0
for i in $(seq 1 15); do
    sleep 1
    if curl -s -X POST http://127.0.0.1:8765/mcp \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' > /dev/null 2>&1; then
        READY=1
        echo "  服务器就绪 / Server ready"
        break
    fi
    echo "  等待中... $i/15"
done
if [ "$READY" = "0" ]; then
    echo "[WARN] 服务器未就绪，仍尝试打开浏览器 / opening browser anyway"
fi

# Open browser
echo
echo "[4/4] 打开浏览器 / Opening browser..."
HTML="$REPO/web/barista-chat.html"
if [ -f "$HTML" ]; then
    # Try common openers
    if command -v xdg-open &>/dev/null; then xdg-open "$HTML"
    elif command -v open &>/dev/null; then open "$HTML"
    else echo "请手动打开 / Please open manually: $HTML"
    fi
    echo
    echo "========================================"
    echo "  启动完成 / Started successfully"
    echo "  MCP Server: http://127.0.0.1:8765/mcp"
    echo "  在设置里填入 MCP 地址并勾选启用工具"
    echo "  Fill MCP URL in settings and enable tools"
    echo "========================================"
    echo "  按 Ctrl+C 停止服务器 / Press Ctrl+C to stop server"
    echo
    wait $SERVER_PID
else
    echo "[ERROR] 未找到 $HTML"
    exit 1
fi
