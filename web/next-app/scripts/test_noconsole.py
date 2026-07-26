"""模拟 PyInstaller --noconsole 环境验证 server.py 不崩溃。"""
import sys
import os
import threading
import time
import webbrowser

print("TEST START", file=sys.__stdout__)

# 强制 stdout/stderr 为 None，模拟双击 exe 的无控制台环境
sys.stdout = None
sys.stderr = None

print("TEST AFTER NULLING", file=sys.__stdout__)

# 现在 import server.py；其顶部的重定向逻辑应接管
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "launcher"))
try:
    import server
except Exception as e:
    print(f"IMPORT ERROR: {e}", file=sys.__stdout__)
    sys.exit(1)

print("TEST AFTER IMPORT", file=sys.__stdout__)

# 禁用自动开浏览器，避免测试环境弹窗
webbrowser.open = lambda url, *args, **kwargs: None

port_holder = {}

def run_main():
    try:
        server.main()
    except Exception as e:
        port_holder["error"] = str(e)

threading.Thread(target=run_main, daemon=True).start()
time.sleep(3)

print(f"TEST AFTER SLEEP, error={port_holder.get('error')}", file=sys.__stdout__)

# 检查日志文件是否生成（证明 stdout/stderr 重定向生效）
log_candidates = [
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "Barista", "logs", "server.log"),
    os.path.join(os.environ.get("TEMP", ""), "Barista", "logs", "server.log"),
]
log_found = None
for p in log_candidates:
    if os.path.exists(p):
        log_found = p
        break

if not log_found:
    print(f"ERROR: log file not found in {log_candidates}", file=sys.__stdout__)
    sys.exit(1)

print(f"OK: log file created at {log_found}", file=sys.__stdout__)
try:
    with open(log_found, "r", encoding="utf-8") as f:
        print(f"LOG CONTENT:\n{f.read()}", file=sys.__stdout__)
except Exception as e:
    print(f"READ LOG ERROR: {e}", file=sys.__stdout__)

sys.exit(0)
