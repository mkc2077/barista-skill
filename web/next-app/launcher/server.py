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

BASE_DIR = (
    os.path.join(sys._MEIPASS, "out")
    if getattr(sys, "_MEIPASS", None)
    else os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
)


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
        fs_path = self.translate_path(self.path)
        if not os.path.exists(fs_path):
            # 单页应用回退：未知路径统一返回 index.html
            self.path = "/index.html"
        return super().do_GET()

    def guess_type(self, path):
        # 强制 .js / .mjs 为 text/javascript，浏览器严格 MIME 检查下才能执行
        if path.endswith((".js", ".mjs")):
            return "text/javascript"
        return super().guess_type(path)

    def log_message(self, *args):
        pass  # 静默


def _quit_tree():
    """整树结束当前进程（含 PyInstaller --onefile 的 bootloader 父进程）。

    先按镜像名 taskkill /F /IM，再兜底 os._exit，确保本地版「退出」按钮
    能真正关闭整个程序，不留残留进程（否则会占着端口、无法再次启动）。
    """
    time.sleep(0.05)
    try:
        subprocess.Popen(
            ["taskkill", "/F", "/IM", os.path.basename(sys.executable)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000,  # CREATE_NO_WINDOW：不在桌面闪黑窗
        )
    except Exception:
        pass
    time.sleep(0.3)
    os._exit(0)  # 兜底：无论如何强制退出当前进程


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
