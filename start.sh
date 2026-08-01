#!/usr/bin/env bash
set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"

echo
echo "============================================"
echo "  Barista Skill -- One-click Start"
echo "============================================"
echo

# Find Python
PY=""
command -v python3 >/dev/null && PY="python3"
command -v python >/dev/null && PY="python" || true
if [ -z "$PY" ]; then
    echo "[ERROR] Python 3.10+ not found"
    exit 1
fi

# Check MCP deps
echo "[1/4] Checking Python deps..."
$PY -c "import mcp" 2>/dev/null || $PY -m pip install "mcp[cli]>=1.8.0" starlette uvicorn -q
echo "  Python deps OK"

# Start MCP server
echo "[2/4] Starting MCP Server..."
cd "$REPO/mcp-server"
$PY server.py --transport http --host 127.0.0.1 --port 8765 &
MCP_PID=$!
sleep 3
echo "  MCP server running (http://127.0.0.1:8765/mcp)"

# Check & install Node deps
echo "[3/4] Checking Next.js deps..."
cd "$REPO/web/next-app"
if [ ! -f "node_modules/.package-lock.json" ]; then
    echo "  Installing npm packages..."
    npm install --silent
fi
echo "  npm deps OK"

# Build Next.js (static export)
echo "[4/4] Building Next.js frontend..."
npx next build

# Start Next.js
echo
echo "============================================"
echo "  Barista running. Open your browser:"
echo "  http://localhost:3000"
echo "============================================"
echo "  Press Ctrl+C to stop both servers."
echo

npx next start -p 3000 &
NEXT_PID=$!

# Cleanup trap
cleanup() {
    echo "Shutting down..."
    kill $MCP_PID $NEXT_PID 2>/dev/null || true
}
trap cleanup EXIT

wait
