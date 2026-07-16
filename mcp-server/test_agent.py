"""Smoke tests for the barista standalone agent (path A).

Run with: pytest mcp-server/test_agent.py
Skipped automatically if openai-agents is not installed.
"""

import importlib.util
import pathlib
import sys

import pytest

agents = pytest.importorskip("agents")  # skip whole module if not installed

HERE = pathlib.Path(__file__).resolve()
SPEC = importlib.util.spec_from_file_location("barista_agent", HERE.parent / "agent.py")
ag = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ag)


# --- instructions & paths ---------------------------------------------------
def test_instructions_load_skillmd_and_have_header():
    inst = ag._load_instructions()
    assert "SKILL.md" in inst
    assert "barista" in inst.lower()
    # body of SKILL.md actually present
    assert "萃取" in inst or "extraction" in inst.lower()


def test_skill_md_exists_on_disk():
    assert ag.SKILL_MD.is_file()
    assert ag.SERVER_PY.is_file()


# --- model env override -----------------------------------------------------
def test_default_model_from_env(monkeypatch):
    monkeypatch.setenv("BARISTA_MODEL", "gpt-5-mini")
    assert ag._load_default_model() == "gpt-5-mini"


def test_default_model_fallback(monkeypatch):
    monkeypatch.delenv("BARISTA_MODEL", raising=False)
    assert ag._load_default_model() == "gpt-4o-mini"


# --- arg parsing ------------------------------------------------------------
def test_parse_args_force_en_prefix():
    msg, model, force_en = ag._parse_args(["--en", "brew me a pour-over"])
    assert force_en is True
    assert msg.startswith("[Language: English]")
    assert "brew me a pour-over" in msg


def test_parse_args_model_flag():
    msg, model, _ = ag._parse_args(["--model", "gpt-5", "hello"])
    assert model == "gpt-5"
    assert msg == "hello"


def test_parse_args_empty_message_defaults_to_en_prompt_when_force_en():
    msg, _, force_en = ag._parse_args(["--en"])
    assert force_en is True
    assert msg.startswith("[Language: English]")


def test_parse_args_no_args_returns_empty_message():
    msg, model, force_en = ag._parse_args([])
    assert msg == ""
    assert force_en is False


# --- main: API key gate -----------------------------------------------------
def test_main_without_api_key_exits_2(monkeypatch, capsys):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    with pytest.raises(SystemExit) as exc:
        ag.main()
    assert exc.value.code == 2
    captured = capsys.readouterr()
    assert "OPENAI_API_KEY" in captured.err


# --- agent builder -----------------------------------------------------------
def test_build_agent_returns_agent_with_mcp_server():
    a = ag.build_agent(model="gpt-4o-mini")
    assert getattr(a, "mcp_servers", None) is not None
    assert len(a.mcp_servers) == 1
    # MCPServerStdio stores the command/args; doesn't actually launch anything
    # so this construction is safe to test offline.
    inst = getattr(a, "instructions", "")
    assert "SKILL.md" in inst
