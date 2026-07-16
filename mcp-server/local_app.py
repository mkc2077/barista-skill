#!/usr/bin/env python3
"""Barista local app — 100% offline by default, optional local LLM via Ollama.

Default mode: maps user input to MCP tool calls + templates — no network,
no API key, responses come from the project's own knowledge base (10 bilingual
tools + 17 reference files).  Fully portable; run with only the project files
and Python >= 3.10.

Optional: `--ollama` flag switches to a local LLM via Ollama
(`ollama pull llama3.2:3b` first), giving a conversational layer while still
running entirely on your machine.

Usage:
    barista-local                             # interactive REPL (default: MCP tools only)
    barista-local --ollama                    # REPL powered by ollama llama3.2:3b
    barista-local "趁苦怎么办"                 # one-shot (MCP tools only)
    barista-local --ollama "brew me a pour-over"  # one-shot via ollama
    barista-local --info                      # list available tools
    barista-local --list                      # list available tools

Requirements:
    pip install -e "mcp-server[local]"        # installs the local extra (ollama optional*)
    (*): ollama and ollama pull llama3.2:3b needed only for --ollama flag
"""

from __future__ import annotations

import importlib.util
import os
import pathlib
import re
import sys
from typing import Any, Callable

# ---------- load MCP server tools in-process (no stdio, no SDK, no network) ----------
HERE = pathlib.Path(__file__).resolve().parent
SERVER_PY = HERE / "server.py"
SKILL_MD = HERE.parent / "SKILL.md"

# import server.py as a module without running its __main__ / mcp.run()
_spec = importlib.util.spec_from_file_location("barista_server", SERVER_PY)
_server = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_server)

TOOLS: dict[str, tuple[Callable[..., str], str]] = {
    # (function reference, short zh description)
    "get_recipe": (_server.get_recipe,
        "冲煮法起步参数 (14种) / brew starter params (14 methods)"),
    "get_milk_drink": (_server.get_milk_drink,
        "经典奶咖配方 (11款) / classic milk drink recipes"),
    "diagnose_flavor": (_server.diagnose_flavor,
        "风味问题诊断——苦/酸/淡/涩 → 调整 / diagnose flavor problems"),
    "calculate_cupping_score": (_server.calculate_cupping_score,
        "SCA 杯测 100 分评分 / SCA cupping score"),
    "calibrate_grinder": (_server.calibrate_grinder,
        "磨豆机校准方法与刻度 / grinder calibration"),
    "get_parameters_guide": (_server.get_parameters_guide,
        "按豆性/口味调参矩阵 / parameter tuning"),
    "get_flavor_wheel": (_server.get_flavor_wheel,
        "SCA 风味轮类别与描述词 / flavor wheel categories"),
    "get_sensory_training": (_server.get_sensory_training,
        "感官训练方案 / sensory training plan"),
    "get_learning_resources": (_server.get_learning_resources,
        "分阶段学习资源 / learning resources by level"),
    "get_craft_recipe": (_server.get_craft_recipe,
        "特调咖啡 8项 SOP 框架 / craft coffee SOP template"),
}


# ---------- keyword -> tool dispatch (offline) ----------
# A lightweight intent map from common user phrases to the most-fitting tool +
# default args. Order matters: first match wins.
INTENTS: list[tuple[re.Pattern, str, dict[str, Any]]] = [
    # ---- brew recipes ----
    (re.compile(r"手冲|pour.?over|v60|kalita|滤杯|滤纸|滤杯"), "get_recipe",
     {"method": "pour_over"}),
    (re.compile(r"爱乐压|aeropress"), "get_recipe", {"method": "aeropress"}),
    (re.compile(r"法压|french.?press"), "get_recipe", {"method": "french_press"}),
    (re.compile(r"摩卡壶|moka.?pot"), "get_recipe", {"method": "moka_pot"}),
    (re.compile(r"冷萃|cold.?brew"), "get_recipe", {"method": "cold_brew"}),
    (re.compile(r"冰滴|ice.?drip|dutch"), "get_recipe", {"method": "ice_drip"}),
    (re.compile(r"聪明杯|clever"), "get_recipe", {"method": "clever_dripper"}),
    (re.compile(r"挂耳|drip.?bag"), "get_recipe", {"method": "drip_bag"}),
    (re.compile(r"虹吸|赛风|syphon|siphon"), "get_recipe", {"method": "syphon"}),
    (re.compile(r"土耳其|turkish"), "get_recipe", {"method": "turkish"}),
    (re.compile(r"闪萃|flash.?brew|日式冰冲"), "get_recipe", {"method": "flash_brew"}),
    (re.compile(r"越南|phin"), "get_recipe", {"method": "vietnamese_phin"}),
    (re.compile(r"浓缩|espresso|意式"), "get_recipe", {"method": "espresso"}),
    (re.compile(r"冰冲|iced.?pour"), "get_recipe", {"method": "iced_pour_over"}),

    # ---- milk drinks ----
    (re.compile(r"卡布|cappuccino"), "get_milk_drink", {"drink": "cappuccino"}),
    (re.compile(r"拿铁|latte(?!\s*art)"), "get_milk_drink", {"drink": "latte"}),
    (re.compile(r"澳白|flat.?white|馥芮白"), "get_milk_drink", {"drink": "flat_white"}),
    (re.compile(r"玛奇朵|macchiato"), "get_milk_drink", {"drink": "macchiato"}),
    (re.compile(r"可塔朵|cortado"), "get_milk_drink", {"drink": "cortado"}),
    (re.compile(r"摩卡|mocha(?!.?pot)"), "get_milk_drink", {"drink": "mocha"}),
    (re.compile(r"康宝蓝|con.?panna"), "get_milk_drink", {"drink": "con_panna"}),
    (re.compile(r"爱尔兰|irish.?coffee"), "get_milk_drink", {"drink": "irish_coffee"}),
    (re.compile(r"维也纳|vienna.?coffee"), "get_milk_drink", {"drink": "vienna"}),
    (re.compile(r"阿芙佳朵|affogato"), "get_milk_drink", {"drink": "affogato"}),
    (re.compile(r"美式|americano"), "get_milk_drink", {"drink": "americano"}),

    # ---- flavor diagnosis ----
    (re.compile(r"苦|bitter"), "diagnose_flavor", {"problem": "bitter"}),
    (re.compile(r"酸|sour"), "diagnose_flavor", {"problem": "sour"}),
    (re.compile(r"淡|weak|thin"), "diagnose_flavor", {"problem": "weak"}),
    (re.compile(r"涩|astringent"), "diagnose_flavor", {"problem": "astringent"}),

    # ---- cupping ----
    (re.compile(r"杯测|cupping|打分|sca.?score"), "calculate_cupping_score", {}),

    # ---- grinder ----
    (re.compile(r"校准|刻度|调磨|c40|ek43|eureka|磨豆机"), "calibrate_grinder",
     {"grinder_model": "comandante_c40"}),

    # ---- parameters ----
    (re.compile(r"调参|参数|金杯|tds|萃取率"), "get_parameters_guide", {}),

    # ---- flavor wheel ----
    (re.compile(r"风味轮|flavor.?wheel|闻香瓶|风味"), "get_flavor_wheel", {}),

    # ---- sensory ----
    (re.compile(r"感官|品鉴|尝味|嗅觉|训练"), "get_sensory_training", {"training_type": "overview"}),

    # ---- learning ----
    (re.compile(r"学习|入门|考证|sca|q.?grader"), "get_learning_resources", {"level": "beginner"}),

    # ---- craft coffee ----
    (re.compile(r"特调|craft\scoffee|signature|soe\sristretto|crema"), "get_craft_recipe",
     {"base": "soe_ristretto"}),

    # ---- coarse fallback: "怎么做咖啡 / make coffee" -> give pour_over starter
    (re.compile(r"做|brew|冲|coffee|咖啡|参数"), "get_recipe",
     {"method": "pour_over"}),
]


def _dispatch_tool(user_input: str) -> tuple[str, dict[str, Any]] | None:
    """Match user input against INTENT patterns; return (tool_name, kwargs)."""
    for pat, tool, kwargs in INTENTS:
        if pat.search(user_input):
            return tool, kwargs
    return None


def _guess_language(user_input: str) -> str:
    """Heuristic: >50% ASCII -> en, else zh."""
    ascii_chars = sum(1 for c in user_input if ord(c) < 128)
    total = len(user_input) or 1
    return "en" if ascii_chars / total > 0.5 else "zh"


def run_offline(user_input: str) -> str:
    """Offline answer: keyword -> tool -> call -> reply string. No LLM."""
    lang = _guess_language(user_input)
    matched = _dispatch_tool(user_input)
    if matched is None:
        return (f"我目前未完全理解 '{user_input}'。试试用关键词如 '手冲''苦''卡布''冷萃'。"
                if lang == "zh" else
                f"I could not fully map '{user_input}' to a tool. Try keywords like 'pour-over', 'bitter', 'cappuccino', 'cold brew'.")
    name, kwargs = matched
    fn, _ = TOOLS[name]
    kwargs.setdefault("language", lang)
    # only pass args the function actually accepts (avoid TypeError)
    import inspect
    sig = inspect.signature(fn)
    ok = {k: v for k, v in kwargs.items() if k in sig.parameters}
    try:
        return fn(**ok)
    except Exception as exc:
        return f"[tool {name}] 调用失败 / call failed: {exc}"


# ---------- optional Ollama layer ----------
def run_ollama(prompt: str, model: str = "llama3.2:3b") -> str:
    """Single-turn ask via ollama chat API (localhost:11434)."""
    import json as _json, urllib.request as _ur
    data = _json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }).encode("utf-8")
    req = _ur.Request("http://127.0.0.1:11434/api/chat", data=data,
                      headers={"Content-Type": "application/json"})
    try:
        with _ur.urlopen(req, timeout=120) as resp:
            return _json.loads(resp.read())["message"]["content"]
    except Exception as exc:
        return f"[ollama error] {exc}"


def run_hybrid(user_input: str, *, use_ollama: bool = False) -> str:
    """Hybrid dispatch: offline tool + optional ollama rewording."""
    tool_answer = run_offline(user_input)
    if not use_ollama:
        return tool_answer
    # reword via ollama for a friendlier conversational tone
    rewording = run_ollama(
        f"Rewrite the following coffee knowledge answer in a friendly, warm "
        f"tone ({_guess_language(user_input)}) without adding new facts:\n\n{tool_answer}"
    )
    return f"{rewording}\n\n[i] 上述知识取自 barista-skill 内置工具。\n[i] The above knowledge is from barista-skill built-in tools."


# ---------- REPL ----------
def repl(*, use_ollama: bool = False) -> None:
    mode = "ollama" if use_ollama else "offline tools"
    print(f"barista-local ready ({mode}). Type 'exit' / 'quit' to end, 'info' for tools list.")
    while True:
        try:
            line = input(">>> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not line:
            continue
        if line.lower() in ("exit", "quit"):
            break
        if line.lower() == "info":
            _print_tools()
            continue
        print(run_hybrid(line, use_ollama=use_ollama))


def _print_tools() -> None:
    print("Available tools (all offline, bilingual zh/en):")
    for name, (_, desc) in TOOLS.items():
        print(f"  {name:<28s} {desc}")


def main() -> None:
    import argparse
    ap = argparse.ArgumentParser(description="Barista local app — 100% offline coffee coach")
    ap.add_argument("prompt", nargs="*", help="Optional one-shot prompt")
    ap.add_argument("--ollama", action="store_true", help="Use local Ollama LLM (requires ollama pull llama3.2:3b)")
    ap.add_argument("--info", action="store_true", help="List available tools")
    args = ap.parse_args()
    if args.info:
        _print_tools()
        return
    msg = " ".join(args.prompt)
    if msg:
        print(run_hybrid(msg, use_ollama=args.ollama))
    else:
        repl(use_ollama=args.ollama)


if __name__ == "__main__":
    main()
