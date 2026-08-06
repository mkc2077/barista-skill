#!/usr/bin/env python3
"""Barista 咖啡顾问 · 本地版启动器（Python 版，零依赖）

用 PyInstaller 打包成单文件 Windows exe 后，小白双击即用：
  - 在本机 127.0.0.1 自动选一个空闲端口启动静态服务器
  - 自动打开默认浏览器进入应用
  - 网页点「退出本地服务」(同源请求 /__quit) 即可关闭

仅使用 Python 标准库，无第三方依赖。对应 Node 版见历史 launcher/server.js。
"""
import http.server
import socketserver
import webbrowser
import threading
import subprocess
import os
import sys
import socket
import time
import tempfile
import shutil
import urllib.request

# PyInstaller --noconsole 打包的 Windows exe 运行时 stdout/stderr 为 None，
# 任何 print / sys.stderr.write 都会崩溃：'NoneType' object has no attribute 'write'。
# 检测到无控制台时，重定向到本地日志文件；如果日志目录也写失败，则落到 os.devnull。
if sys.stdout is None or sys.stderr is None:
    try:
        log_dir = os.path.join(
            os.environ.get("LOCALAPPDATA") or os.environ.get("TEMP") or tempfile.gettempdir(),
            "Barista",
            "logs",
        )
        os.makedirs(log_dir, exist_ok=True)
        # 行缓冲：让日志实时落盘，方便排查
        log_file = open(os.path.join(log_dir, "server.log"), "a", encoding="utf-8", buffering=1)
    except Exception:
        log_file = open(os.devnull, "w")
    if sys.stdout is None:
        sys.stdout = log_file
    if sys.stderr is None:
        sys.stderr = log_file
    print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Barista 启动器已启动（无控制台模式）")
    sys.stdout.flush()

BASE_DIR = (
    os.path.join(sys._MEIPASS, "out")
    if getattr(sys, "_MEIPASS", None)
    else os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
)

MCP_HOST = "127.0.0.1"
MCP_PORT = 8765
_mcp_proc = None  # MCP Server 子进程句柄（退出时一并结束）


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        req = self.path.split("?")[0]
        if req == "/__quit":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"bye")
            # PyInstaller --onefile 会派生 bootloader 父进程 + 运行子进程；
            # 仅 os._exit 只能杀子进程，父进程会残留。这里按镜像名整树结束。
            threading.Thread(target=_quit_tree, daemon=True).start()
            return
        # 静态资源禁止浏览器缓存：exe 升级后必须加载新 chunk，
        # 否则浏览器会用旧 JS（例如旧的「每个模块都有粉碗尺寸」产物）——v7 P3e.5 修复
        fs_path = self.translate_path(self.path)
        if not os.path.exists(fs_path):
            # 单页应用回退：未知路径统一返回 index.html
            self.path = "/index.html"
        resp = super().do_GET()
        try:
            if self.path.endswith((".js", ".mjs", ".css", ".html", ".json", ".svg", ".png", ".ico", ".webp", ".ttf", ".woff", ".woff2")):
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")
        except Exception:
            pass
        return resp

    def guess_type(self, path):
        # 强制 .js / .mjs 为 text/javascript，浏览器严格 MIME 检查下才能执行
        if path.endswith((".js", ".mjs")):
            return "text/javascript"
        return super().guess_type(path)

    def log_message(self, *args):
        pass  # 静默


def _run_quit(cmd):
    """静默执行 taskkill 等命令，不留黑窗。"""
    try:
        subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000,  # CREATE_NO_WINDOW：不在桌面闪黑窗
        )
    except Exception:
        pass


def _quit_tree():
    """整树结束当前进程（含 PyInstaller --onefile 的 bootloader 父进程）。

    PyInstaller --onefile 会派生 bootloader 父进程 + 运行子进程；
    仅 os._exit 只能杀子进程，父进程会残留（占端口、无法再次启动）。
    这里优先杀掉父进程 PID，再按镜像名 taskkill，最后兜底 os._exit。
    """
    time.sleep(0.05)
    # 0) 先结束 MCP Server 子进程
    _stop_mcp_server()
    # 1) 如果作为 PyInstaller onefile exe 运行，直接结束父进程（bootloader）
    if getattr(sys, "frozen", False) and getattr(sys, "_MEIPASS", None):
        parent = os.getppid()
        if parent and parent > 0:
            _run_quit(["taskkill", "/F", "/PID", str(parent)])
    # 2) 按当前可执行文件名兜底（同进程名的所有实例一起结束）
    _run_quit(["taskkill", "/F", "/IM", os.path.basename(sys.executable)])
    time.sleep(0.4)
    os._exit(0)  # 最终兜底：强制退出当前进程


def _find_python():
    """在 PATH 中找一个可用的 Python 解释器（Windows 上优先 py.exe）。"""
    for name in ("py", "python", "python3"):
        path = shutil.which(name)
        if path:
            return path
    return None


def _start_mcp_server():
    """exe 模式下自动启动同目录下的 mcp-server/server.py（HTTP 模式）。

    仅当作为 PyInstaller 打包的单文件 exe 运行时才触发；开发模式仍由 start.bat/start.sh
    或手动启动。若找不到 Python 或 mcp-server 未就绪，则记录日志后继续（不影响 web 服务）。
    """
    global _mcp_proc
    if not (getattr(sys, "frozen", False) and getattr(sys, "_MEIPASS", None)):
        return

    exe_dir = os.path.dirname(sys.executable)
    mcp_script = os.path.join(exe_dir, "mcp-server", "server.py")
    if not os.path.exists(mcp_script):
        print("[MCP] 未找到同目录 mcp-server/server.py，跳过自动启动")
        return

    python = _find_python()
    if not python:
        print("[MCP] 未找到 Python 解释器，无法自动启动 MCP Server")
        return

    print(f"[MCP] 正在启动 MCP Server：{python} mcp-server/server.py --transport http")
    try:
        _mcp_proc = subprocess.Popen(
            [python, mcp_script, "--transport", "http", "--host", MCP_HOST, "--port", str(MCP_PORT)],
            cwd=os.path.dirname(mcp_script),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000,  # CREATE_NO_WINDOW
        )
    except Exception as e:
        print(f"[MCP] 启动失败：{e}")
        return

    # 等待 MCP Server 就绪，最多 15 秒
    url = f"http://{MCP_HOST}:{MCP_PORT}/mcp"
    for i in range(30):
        time.sleep(0.5)
        try:
            req = urllib.request.Request(
                url,
                data=b'{"jsonrpc":"2.0","method":"tools/list","id":1}',
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/event-stream",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                if resp.status == 200:
                    print(f"[MCP] MCP Server 已就绪：{url}")
                    return
        except Exception:
            continue
    print("[MCP] MCP Server 15 秒内未就绪，请确认依赖已安装（pip install \"mcp[cli]\" starlette uvicorn）")


def _stop_mcp_server():
    """退出时结束 MCP Server 子进程。"""
    global _mcp_proc
    if _mcp_proc is None:
        return
    try:
        _mcp_proc.terminate()
        _mcp_proc.wait(timeout=2)
    except Exception:
        try:
            _mcp_proc.kill()
        except Exception:
            pass
    _mcp_proc = None


def find_free_port(start=4173, end=4200):
    for p in range(start, end + 1):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.bind(("127.0.0.1", p))
            s.close()
            return p
        except OSError:
            continue
    return None


def main():
    port = find_free_port()
    if port is None:
        sys.stderr.write("无法找到可用端口（4173-4200 均被占用）\n")
        sys.stderr.flush()
        sys.exit(1)

    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}"
    sys.stderr.write(
        "\n  ☕  Barista 咖啡顾问 · 本地版\n"
        "  " + "─" * 30 + "\n"
        f"  ✅ 服务已启动：{url}\n"
        "  🌐 正在为你打开浏览器…\n"
        "  ⏹  退出：关闭此窗口，或在网页右下角点「退出本地服务」\n\n"
    )
    sys.stderr.flush()

    # 在后台自动启动 MCP Server（仅 exe 模式）
    threading.Thread(target=_start_mcp_server, daemon=True).start()

    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
