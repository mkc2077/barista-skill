"""P2 RAG-v2 tests: metadata filter + meta persistence + golden-QA file format.

Run with: pytest mcp-server/test_rag_index.py
No sentence-transformers needed — the embedder and index are faked.
"""

import importlib.util
import json
import pathlib

import pytest

HERE = pathlib.Path(__file__).resolve()
SPEC = importlib.util.spec_from_file_location("rag_index", HERE.parent / "rag_index.py")
ri = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ri)


class FakeEmbedder:
    """encode(str) -> [1.0, 0.0]; encode([...]) -> [[1.0, 0.0]] per item."""

    def encode(self, texts, **kwargs):
        if isinstance(texts, str):
            return [1.0, 0.0]
        return [[1.0, 0.0]] * len(texts)


def _fake_index():
    return {
        "chunks": [
            {"id": "a#0", "source": "zh:recipes-baseline", "text": "卡布奇诺配方", "meta": {"category": "recipe"}},
            {"id": "b#0", "source": "auto:new-recipe", "text": "新特调配方", "meta": {"category": "search", "source": "auto", "url": "https://x"}},
            {"id": "c#0", "source": "zh:beans", "text": "咖啡豆保存", "meta": {}},
        ],
        "embeddings": [[1.0, 0.0]] * 3,
        "model": ri.EMBED_MODEL_NAME,
        "_spec": 2,
    }


@pytest.fixture
def _rag_env(monkeypatch):
    monkeypatch.setattr(ri, "have_sentence_transformers", lambda: True)
    monkeypatch.setattr(ri, "_embedder", lambda: FakeEmbedder())
    monkeypatch.setattr(ri, "_INDEX_CACHE", _fake_index())
    # 关键词分对 3 个 chunk 一视同仁，结果只由 filter 决定
    monkeypatch.setattr(ri, "_keyword_score", lambda *a, **k: 1.0)
    yield


def test_query_no_filter_returns_all(_rag_env):
    hits = ri.query("咖啡", top_k=5)
    assert {h["source"] for h in hits} == {"zh:recipes-baseline", "auto:new-recipe", "zh:beans"}


def test_query_filter_category(_rag_env):
    hits = ri.query("咖啡", top_k=5, filters={"category": "search"})
    assert {h["source"] for h in hits} == {"auto:new-recipe"}


def test_query_filter_source_list(_rag_env):
    hits = ri.query("咖啡", top_k=5, filters={"source": ["auto", "recipe"]})
    assert {h["source"] for h in hits} == {"auto:new-recipe"}


def test_query_filter_missing_meta_key(_rag_env):
    hits = ri.query("咖啡", top_k=5, filters={"url": "https://x"})
    assert {h["source"] for h in hits} == {"auto:new-recipe"}


def test_query_filter_no_match_returns_empty(_rag_env):
    hits = ri.query("咖啡", top_k=5, filters={"category": "nope"})
    assert hits == []


def test_add_documents_stores_meta(monkeypatch, tmp_path):
    monkeypatch.setattr(ri, "have_sentence_transformers", lambda: True)
    monkeypatch.setattr(ri, "_embedder", lambda: FakeEmbedder())
    monkeypatch.setattr(ri, "_INDEX_CACHE", None)
    monkeypatch.setattr(ri, "INDEX_PKL", tmp_path / "rag_index.pkl")
    out = ri.add_documents(
        [("r1", "新特调配方内容"), ("r2", "冠军冲煮法内容")],
        source_prefix="auto:",
        metas=[{"category": "search", "source": "auto", "url": "https://a"}, None],
    )
    assert out["added"] == 2
    rec = ri._load_index()
    metas = [c["meta"] for c in rec["chunks"]]
    assert metas[0] == {"category": "search", "source": "auto", "url": "https://a"}
    assert metas[1] == {}  # 无 meta 的文档落空 dict


# --- golden-QA file format ------------------------------------------------

def test_golden_qa_format():
    p = HERE.parent.parent / "evals" / "golden_qa.jsonl"
    lines = [l for l in p.read_text("utf-8").splitlines() if l.strip()]
    assert len(lines) >= 30, "golden_qa.jsonl should have >=30 questions"
    for l in lines:
        q = json.loads(l)
        assert q.get("query") and q.get("source"), f"bad golden entry: {q}"
        assert q["source"].startswith("zh:") or q["source"].startswith("en:"), q
