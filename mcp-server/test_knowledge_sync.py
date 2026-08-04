"""P1 knowledge-sync engine tests (stdlib-only; no live network).

Run with: pytest mcp-server/test_knowledge_sync.py
Covers: dedup (exact + similarity), sync pipeline with mocked search + fake
rag index, state persistence, staleness check, scheduler interval mapping.
"""

import importlib.util
import json
import pathlib
import sys
import threading
import time

import pytest

HERE = pathlib.Path(__file__).resolve()
SPEC = importlib.util.spec_from_file_location("knowledge_sync", HERE.parent / "knowledge_sync.py")
ks = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ks)


@pytest.fixture(autouse=True)
def _clean_state(tmp_path, monkeypatch):
    """每个测试用独立 state 文件，避免污染仓库 data/。"""
    monkeypatch.setattr(ks, "STATE_FILE", tmp_path / "state.json")
    ks.GLOBAL_SCHEDULER.stop()
    yield


# --- dedup ------------------------------------------------------------------

def test_dedup_exact_title():
    assert ks._is_dup("埃塞俄比亚日晒手冲新配方", ["埃塞俄比亚日晒手冲新配方"])
    assert not ks._is_dup("埃塞俄比亚日晒手冲新配方", ["耶加雪菲水洗新配方"])


def test_dedup_similar_title():
    # 归一化后仅标点差异 -> 重复
    assert ks._is_dup("Cold Brew 新做法！", ["cold-brew 新做法"])
    # 语义不同 -> 不重复
    assert not ks._is_dup("V60 冠军冲煮法", ["摩卡壶变压萃取"])


def test_dedup_empty_title():
    assert ks._is_dup("", ["anything"])


# --- sync pipeline ----------------------------------------------------------

class FakeRAG:
    def __init__(self):
        self.calls = []

    def __call__(self, texts, source_prefix="custom:"):
        self.calls.append((source_prefix, list(texts)))
        return {"added": len(texts), "chunks": len(texts)}


def _fake_search(results_by_topic):
    def _f(topic, api_key="", max_results=5):
        return results_by_topic.get(topic, [])
    return _f


def test_sync_once_adds_new_and_dedups(monkeypatch):
    topics = ["t1", "t2"]
    results = {
        "t1": [
            {"title": "配方A", "url": "https://a", "snippet": "snippet a"},
            {"title": "配方A", "url": "https://a2", "snippet": "dup"},
        ],
        "t2": [{"title": "配方B", "url": "https://b", "snippet": "snippet b"}],
    }
    monkeypatch.setattr(ks, "_search_topic", _fake_search(results))
    rag = FakeRAG()
    stats = ks.sync_once(topics=topics, add_docs=rag)

    assert stats["fetched"] == 3
    assert stats["added"] == 2          # 配方A(重复)被跳过
    assert stats["skipped_dup"] == 1
    assert stats["errors"] == 0
    # 两次入库调用都带 auto: 前缀
    assert all(prefix == "auto:" for prefix, _ in rag.calls)
    # 状态已持久化
    state = json.loads(ks.STATE_FILE.read_text("utf-8"))
    assert len(state["seen_titles"]) == 2
    assert state["added_total"] == 2


def test_sync_once_second_run_no_new_adds(monkeypatch):
    topics = ["t1"]
    results = {"t1": [{"title": "配方X", "url": "https://x", "snippet": "x"}]}
    monkeypatch.setattr(ks, "_search_topic", _fake_search(results))
    rag = FakeRAG()
    ks.sync_once(topics=topics, add_docs=rag)
    stats2 = ks.sync_once(topics=topics, add_docs=rag)
    assert stats2["added"] == 0
    assert stats2["skipped_dup"] == 1
    assert len(rag.calls) == 1  # 第二次没有触发入库


def test_sync_once_search_failure_is_explicit(monkeypatch):
    def _boom(topic, api_key="", max_results=5):
        raise RuntimeError("network down")
    monkeypatch.setattr(ks, "_search_topic", _boom)
    stats = ks.sync_once(topics=["t1"], add_docs=FakeRAG())
    assert stats["errors"] == 1
    assert "network down" in stats["last_error"]
    # 失败不静默：last_success 未被更新
    assert stats["last_success"] == 0.0


def test_sync_once_rag_missing_is_explicit(monkeypatch):
    def _f(topic, api_key="", max_results=5):
        return [{"title": "配方Y", "url": "https://y", "snippet": "y"}]
    monkeypatch.setattr(ks, "_search_topic", _f)

    def _bad_add(texts, source_prefix="auto:"):
        raise ImportError("sentence-transformers not installed")
    stats = ks.sync_once(topics=["t1"], add_docs=_bad_add)
    assert stats["errors"] == 1
    assert "sentence-transformers" in stats["last_error"]
    # 标题已记录，下次不会重复拉取
    state = json.loads(ks.STATE_FILE.read_text("utf-8"))
    assert "配方Y" in state["seen_titles"]


# --- staleness --------------------------------------------------------------

def test_needs_update_empty_state():
    assert ks.needs_update({}) is True


def test_needs_update_fresh_state():
    assert ks.needs_update({"last_success": time.time()}) is False


def test_needs_update_stale_state():
    assert ks.needs_update({"last_success": time.time() - 10 * 86400}) is True


# --- scheduler --------------------------------------------------------------

def test_interval_mapping():
    assert ks.INTERVALS["daily"] == 86400
    assert ks.INTERVALS["weekly"] == 7 * 86400
    assert ks.INTERVALS["monthly"] == 30 * 86400


def test_set_schedule_starts_and_stops():
    st = ks.set_schedule(interval="daily", topics=["t1"], start=True)
    assert st["running"] is True
    assert st["interval_seconds"] == 86400
    ks.GLOBAL_SCHEDULER.stop()
    assert ks.GLOBAL_SCHEDULER.status()["running"] is False


def test_scheduler_thread_loop_respects_stop():
    sched = ks.KnowledgeScheduler(topics=["t1"], interval_seconds=60)
    sched.start()
    assert sched.status()["running"] is True
    sched.stop()
    assert sched.status()["running"] is False
