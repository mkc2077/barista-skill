#!/usr/bin/env python3
"""Barista standalone agent (path A).

Wraps the existing barista MCP server + SKILL.md into a runnable conversational
coffee-coach agent using the OpenAI Agents SDK. No changes to the MCP server
itself; the MCP tools (10, bilingual zh/en) become the agent's tools and the
SKILL.md body becomes the agent's instructions.

Requirements:
    pip install "mcp-server[agent]"        # adds openai-agents
    export OPENAI_API_KEY=sk-...           # required
    export BARISTA_MODEL=gpt-4o-mini       # optional, default gpt-4o-mini
    export OPENAI_BASE_URL=https://...     # optional, for OpenAI-compatible
                                            # endpoints (e.g. domestic proxy)

Usage:
    barista-agent                            # interactive REPL
    barista-agent "帮我冲一杯手冲"            # one-shot query
    barista-agent --en "brew me a pour-over" # force English channel
    barista-agent --model gpt-5-mini         # override model per-run
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from agents import Agent, Runner
from agents.mcp import MCPServerStdio

# --- paths ------------------------------------------------------------------
HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
SKILL_MD = REPO_ROOT / "SKILL.md"
SERVER_PY = HERE / "server.py"

def _load_default_model() -> str:
    """Read BARISTA_MODEL from env on every call (so tests can monkeypatch)."""
    return os.environ.get("BARISTA_MODEL", "gpt-4o-mini")


# Kept as a module-level cache for backwards-compat references;
# prefer calling _load_default_model() to pick up env changes at runtime.
DEFAULT_MODEL = _load_default_model()


def _load_instructions() -> str:
    """Use the SKILL.md body verbatim as the agent's system prompt.

    Upgrading SKILL.md automatically upgrades the agent. A short header is
    prepended so the agent knows it speaks for the barista skill and is
    bilingual.
    """
    body = SKILL_MD.read_text(encoding="utf-8")
    header = (
        "You are the barista-skill standalone agent. You brew coffee and "
        "taste coffee, nothing else (see the skill's out-of-scope rules). "
        "Answer in the user's language (zh or en) by default; the user may "
        "force a channel with --en. Always follow the SKILL's iron rules: "
        "assess experience first, one variable at a time, never fabricate "
        "named recipes / pressure numbers (verify online). Use the provided "
        "MCP tools when they fit before answering.\n\n--- SKILL.md ---\n"
    )
    return header + body


def _make_mcp_server() -> MCPServerStdio:
    """Spawn the barista MCP server as a stdio child process."""
    return MCPServerStdio(
        params={
            "command": sys.executable,
            "args": [str(SERVER_PY)],
        },
    )


def build_agent(model: str | None = None) -> Agent:
    """Construct the Agent (without running the MCP server yet).

    `model=None` -> read BARISTA_MODEL from env at call time (lets tests
    monkeypatch the env and observe the change without a reload).
    """
    if model is None:
        model = _load_default_model()
    return Agent(
        name="barista",
        instructions=_load_instructions(),
        model=model,
        mcp_servers=[_make_mcp_server()],
    )


def run_once(message: str, *, model: str | None = None) -> str:
    """Run a single user message and return the agent's final text."""
    agent = build_agent(model=model if model is not None else _load_default_model())
    with agent.mcp_servers[0]:
        result = Runner.run_sync(agent, message)
    return result.final_output


def repl(*, model: str | None = None) -> None:
    """Interactive single-line REPL. Type `exit` / `quit` to end."""
    agent = build_agent(model=model if model is not None else _load_default_model())
    print("barista-agent ready. Type 'exit' or 'quit' to end.")
    with agent.mcp_servers[0]:
        history: list[str] = []
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
            history.append(line)
            try:
                turn = Runner.run_sync(agent, "\n".join(history))
            except Exception as exc:  # surface runtime errors cleanly
                print(f"[agent error] {exc}", file=sys.stderr)
                history.pop()
                continue
            print(turn.final_output)
            history.append("ASSISTANT: " + turn.final_output)


def _parse_args(argv: list[str]) -> tuple[str, str, bool]:
    """Return (message, model, force_en) from argv."""
    force_en = False
    model: str | None = None
    tokens: list[str] = []

    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--en":
            force_en = True
        elif a == "--model" and i + 1 < len(argv):
            model = argv[i + 1]
            i += 1
        elif a in ("-h", "--help"):
            print(__doc__)
            sys.exit(0)
        else:
            tokens.append(a)
        i += 1
    msg = " ".join(tokens)
    if force_en and msg:
        msg = f"[Language: English] {msg}"
    elif force_en and not msg:
        msg = "[Language: English] Hello, I want to learn coffee. Where do I start?"
    return msg, model, force_en


def main() -> None:
    msg, model, _ = _parse_args(sys.argv[1:])
    if not os.environ.get("OPENAI_API_KEY"):
        print(
            "[barista-agent] OPENAI_API_KEY is not set. "
            "Set it (or OPENAI_BASE_URL for a compatible endpoint) and retry.",
            file=sys.stderr,
        )
        sys.exit(2)
    if msg:
        print(run_once(msg, model=model))
    else:
        repl(model=model)


if __name__ == "__main__":
    main()
