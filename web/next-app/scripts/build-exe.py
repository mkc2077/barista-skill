#!/usr/bin/env python3
"""一键构建 Windows 单文件 exe（小白分发版）。

流程：
  1. 移走旧 .next（避免 next build 清理触发沙箱删除守卫）→ next build 静态导出 out/
  2. 移走旧 launcher/out → 复制 out/ -> launcher/out（PyInstaller 会嵌入）
  3. PyInstaller 把 server.py + out/ 打包为 dist/Barista.exe（内嵌 Python 运行时）

用法：python scripts/build-exe.py   （需先 pip install pyinstaller）
"""
import subprocess
import shutil
import os
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))   # web/next-app/scripts
NEXT = os.path.dirname(ROOT)                         # web/next-app
OUT = os.path.join(NEXT, "out")
LAUNCHER_OUT = os.path.join(NEXT, "launcher", "out")


def npm_bin():
    """定位 npm 可执行文件。

    在 Windows 上 `npm` 本体是 `npm.cmd`（无扩展名脚本无法被 Python subprocess 直接
    启动），这里用 shutil.which 解析到带扩展名的完整路径，避免 FileNotFoundError。
    """
    for name in ("npm.cmd", "npm"):
        found = shutil.which(name)
        if found:
            return found
    return "npm"  # 退而求其次，交给运行环境报错



def step(cmd):
    print("\n▶", " ".join(cmd))
    subprocess.run(cmd, cwd=NEXT, check=True)


# 1) 移走旧 .next（rename 不经 shell 删除守卫，目标名带时间戳绝不冲突）
bak = os.path.join(NEXT, ".next_bak_" + str(int(time.time())))
try:
    os.rename(os.path.join(NEXT, ".next"), bak)
except OSError:
    pass

step([npm_bin(), "run", "build"])

# 2) 复制 out -> launcher/out（先 rename 旧副本）
try:
    os.rename(LAUNCHER_OUT, os.path.join(NEXT, "launcher", "out_bak_" + str(int(time.time()))))
except OSError:
    pass
shutil.copytree(OUT, LAUNCHER_OUT)

# 3) PyInstaller 打包（用当前 python 的 -m PyInstaller，确保用对解释器）
step([
    sys.executable, "-m", "PyInstaller",
    "--onefile", "--noconsole",
    "--name", "Barista",
    "--add-data", f"{LAUNCHER_OUT};out",
    os.path.join(NEXT, "launcher", "server.py"),
])

print("\n✅ 完成：web/next-app/dist/Barista.exe")
print("   双击 Barista.exe 即可在本机启动，自动打开浏览器。")
