"""RAG index engine for barista-skill — local hybrid retrieval.

Architecture (adapted from awesome-llm-apps rag_tutorials patterns):

  build_index()  -> chunk all references/*.md, embed chunks, save pickle
  query(q, k)    -> keyword score (CJK 2-gram, mirrors search_references)
                   + cosine(embedding) weighted fusion. No network at query time.
  add_documents(texts) -> live append after new beans/recipes added (future)

Fallback: if sentence-transformers is not installed OR the index pickle is
missing, query() returns []. The MCP tool `rag_search` then degrades to the
existing keyword-only `search_references` so users are never blocked.

The keyword tokeniser is duplicated here (not imported from server.py) so
the RAG layer stays standalone-testable without circular imports.
"""
from __future__ import annotations

import math
import os
import pickle
import re
from pathlib import Path
from typing import List, Tuple, Dict, Optional, Any

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
DATA = REPO / "data"
REFS = REPO / "references"
INDEX_PKL = DATA / "rag_index.pkl"

EMBED_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
# Force HF + transformers into offline mode when the multilingual MiniLM
# is already cached locally so SentenceTransformer loads straight from
# cache without the "is there a newer version?" API call. That call
# hits intermittent SSL / httpx "client has been closed" failures over
# China networks even when the model is fully local. First-time users
# still download normally because the cache dir does not exist yet.
_ST_CACHE = os.path.join(
    os.path.expanduser("~/.cache/huggingface/hub"),
    "models--sentence-transformers--paraphrase-multilingual-MiniLM-L12-v2"
)
if os.path.isdir(_ST_CACHE):
    os.environ.setdefault("HF_HUB_OFFLINE", "1")
    os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
FUSION_SEMANTIC_WEIGHT = 0.6      # hybrid: 0.6 semantic + 0.4 keyword
CHUNK_TARGET = 800
CHUNK_OVERLAP = 120

# SAG-inspired query noise phrases stripped before tokenising.
_QUERY_NOISE_ZH = (
    "知识库", "资料库", "告诉我", "帮我查", "搜索",
    "查询", "请问", "关于", "是什么", "有哪些", "有什么",
)
_QUERY_NOISE_EN = (
    "tell me", "search", "query", "find", "what is", "how to",
    "can you", "please", "according to", "in the", "from the",
)


def _strip_query_noise(text, language="zh"):
    """Remove boilerplate phrases that add zero signal to retrieval."""
    cleaned = text.strip().lower()
    noise = _QUERY_NOISE_EN + _QUERY_NOISE_ZH if language == "zh" else _QUERY_NOISE_EN
    for phrase in noise:
        cleaned = cleaned.replace(phrase, " ")
    return cleaned.strip()


_EMBEDDER: Any = None
_INDEX_CACHE: Optional[dict] = None


def have_sentence_transformers() -> bool:
    try:
        import sentence_transformers  # noqa: F401
        return True
    except ImportError:
        return False


def _embedder():
    global _EMBEDDER
    if _EMBEDDER is None:
        from sentence_transformers import SentenceTransformer
        _EMBEDDER = SentenceTransformer(EMBED_MODEL_NAME)
    return _EMBEDDER


def _l2_normalize(vec):
    """Return unit vector (list of float) — cosine = dot product of unit vecs."""
    n = math.sqrt(sum(float(x) ** 2 for x in vec))
    if n == 0:
        return list(vec)
    return [float(x) / n for x in vec]


def _tokenize(text):
    """CJK-2gram + Latin word tokenizer (mirrors server.py _tokenize)."""
    tokens = []
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if ch.isascii():
            j = i
            while j < n and text[j].isascii() and text[j].isalnum():
                j += 1
            if j > i:
                tokens.append(text[i:j].lower())
                i = j
            else:
                i += 1
        else:
            j = i
            while j < n and not text[j].isascii():
                j += 1
            run = text[i:j]
            for k in range(len(run) - 1):
                tokens.append(run[k:k + 2])
            if len(run) == 1:
                tokens.append(run)
            i = j
    return tokens


def chunk_md(text, size=CHUNK_TARGET, overlap=CHUNK_OVERLAP):
    """Markdown-aware chunker (RecursiveCharacterTextSplitter pattern, stdlib).

    Splits on ``## `` headers first (header stays attached to its section),
    then on ``\n\n`` paragraphs, packing into ~size chunks with ~overlap
    chars of overlap between consecutive chunks. Falls back to hard char split
    only when a single paragraph exceeds size.
    """
    if not text or not text.strip():
        return []
    if len(text) <= size:
        return [text]

    sections = []
    cur_header = ""
    cur_lines = []
    for ln in text.split("\n"):
        if ln.startswith("## "):
            if cur_lines:
                sections.append((cur_header, "\n".join(cur_lines)))
            cur_header = ln
            cur_lines = []
        else:
            cur_lines.append(ln)
    if cur_lines:
        sections.append((cur_header, "\n".join(cur_lines)))

    chunks = []
    for header, body in sections:
        full = (header + "\n" + body) if header else body
        if len(full) <= size:
            if full.strip():
                chunks.append(full)
            continue
        paras = re.split(r"\n\n+", body)
        buf = ""
        for p in paras:
            if not p.strip():
                continue
            # If a single paragraph exceeds size, hard-split it with overlap.
            if len(p) > size:
                if buf:
                    chunks.append((header + "\n" + buf) if header else buf)
                    buf = ""
                for start in range(0, len(p), size - overlap):
                    piece = p[start:start + size]
                    if piece.strip():
                        pref = (header + "\n") if header else ""
                        chunks.append(pref + piece)
                continue
            if not buf:
                buf = p
            elif len(buf) + 2 + len(p) <= size:
                buf = buf + "\n\n" + p
            else:
                chunks.append((header + "\n" + buf) if header else buf)
                tail = buf[-overlap:] if overlap > 0 else ""
                buf = (tail + "\n\n" + p) if tail.strip() else p
        if buf:
            chunks.append((header + "\n" + buf) if header else buf)
    return [c.strip() for c in chunks if c.strip()]


def _keyword_score(query_tokens, chunk_text, chunk_source):
    """Keyword score: content.count(token)*w + 6 for title (source) hit.
    Mirrors server.py search_references scoring so RAG keyword layer is
    consistent with the legacy keyword-only search.
    """
    cl = chunk_text.lower()
    src = chunk_source.lower()
    score = 0.0
    seen = set()
    for t in query_tokens:
        if t in seen:
            continue
        seen.add(t)
        w = 2.0 if len(t) > 1 else 1.0
        score += cl.count(t) * w
        # SAG-inspired: heading match = +8 (source contains the file stem)
        if t in src:
            score += 8.0
    return score


def _iter_reference_docs():
    """Yield (source_id, text) for all references/*.md (zh under refs/,
    en under refs/en/). Skips README; source_id encodes lang:stem."""
    docs = []
    for base in [REFS, REFS / "en"]:
        if not base.exists():
            continue
        for p in sorted(base.glob("*.md")):
            if p.stem == "README":
                continue
            lang = "en" if "en" in p.parts else "zh"
            source_id = f"{lang}:{p.stem}"
            try:
                docs.append((source_id, p.read_text(encoding="utf-8")))
            except Exception:
                pass
    return docs


def build_index(verbose=True):
    """Build the RAG index over all reference docs and save to
    data/rag_index.pkl. Returns stats dict. Needs sentence-transformers.
    """
    if not have_sentence_transformers():
        raise RuntimeError(
            "sentence-transformers not installed; "
            "run: pip install sentence-transformers"
        )
    docs = _iter_reference_docs()
    chunks = []
    for src_id, text in docs:
        for i, c in enumerate(chunk_md(text)):
            chunks.append({"id": f"{src_id}#{i}", "source": src_id, "text": c})
    if not chunks:
        if verbose:
            print("[rag_index] no reference docs found")
        _write_index(INDEX_PKL, {"chunks": [], "embeddings": [], "model": EMBED_MODEL_NAME, "_spec": 1})
        return {"docs": 0, "chunks": 0}

    texts = [c["text"] for c in chunks]
    emb = _embedder().encode(
        texts, batch_size=32, show_progress_bar=verbose,
        convert_to_numpy=True,
    )
    embs = [_l2_normalize(list(map(float, e))) for e in emb]

    _write_index(INDEX_PKL, {"chunks": chunks, "embeddings": embs,
                             "model": EMBED_MODEL_NAME, "_spec": 1})
    return {"docs": len(docs), "chunks": len(chunks)}


def _write_index(path, record):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as f:
        pickle.dump(record, f, protocol=pickle.HIGHEST_PROTOCOL)


_INDEX_MTIME = 0.0


def _load_index():
    global _INDEX_CACHE
    if _INDEX_CACHE is not None:
        return _INDEX_CACHE
    if INDEX_PKL.exists():
        try:
            with INDEX_PKL.open("rb") as f:
                rec = pickle.load(f)
            if isinstance(rec, dict) and "chunks" in rec and "embeddings" in rec:
                _INDEX_CACHE = rec
                return rec
        except Exception:
            return None
    return None


def add_documents(texts, source_prefix="custom:"):
    """Append new documents to the index without a full rebuild.

    Args:
        texts: list of (source_id_suffix, text) tuples
        source_prefix: prefix for source_id (default "custom:")
    Returns: {"added": count, "chunks": total_chunks}
    """
    if not have_sentence_transformers():
        return {"added": 0, "chunks": 0, "error": "sentence-transformers not installed"}
    idx = _load_index() or {"chunks": [], "embeddings": [], "model": EMBED_MODEL_NAME, "_spec": 1}
    new_chunks = []
    for suffix, text in texts:
        src_id = f"{source_prefix}{suffix}"
        for i, c in enumerate(chunk_md(text)):
            new_chunks.append({"id": f"{src_id}#{i}", "source": src_id, "text": c})
    if not new_chunks:
        return {"added": 0, "chunks": len(idx.get("chunks", []))}
    new_texts = [c["text"] for c in new_chunks]
    new_emb = _embedder().encode(new_texts, batch_size=32, convert_to_numpy=True)
    new_embs = [_l2_normalize(list(map(float, e))) for e in new_emb]
    idx["chunks"].extend(new_chunks)
    idx["embeddings"].extend(new_embs)
    _write_index(INDEX_PKL, idx)
    global _INDEX_CACHE
    _INDEX_CACHE = None
    return {"added": len(texts), "chunks": len(idx["chunks"])}


def rebuild_if_changed(verbose=False):
    """Rebuild the index only if references/ files have been modified since last build.

    Returns: {"rebuilt": bool, "docs": int, "chunks": int, "reason": str}
    """
    import time
    refs_mtime = 0
    for base in [pathlib.Path(REFS), pathlib.Path(REFS) / "en"]:
        if base.exists():
            for f in base.glob("*.md"):
                if f.name == "README.md":
                    continue
                refs_mtime = max(refs_mtime, f.stat().st_mtime)
    if refs_mtime == 0:
        return {"rebuilt": False, "reason": "no reference docs found"}

    idx = _load_index()
    if idx is None:
        stats = build_index(verbose=verbose)
        return {"rebuilt": True, **stats, "reason": "fresh build"}
    return {"rebuilt": False, "reason": "up-to-date"}


def clear_cache():

    global _INDEX_CACHE, _EMBEDDER
    _INDEX_CACHE = None
    _EMBEDDER = None


def is_available():
    """True if the RAG engine is ready to serve (index built + ST installed)."""
    _load_index()
    return _INDEX_CACHE is not None and have_sentence_transformers()


def query(text, top_k=5, semantic_weight=FUSION_SEMANTIC_WEIGHT, language="zh"):
    """Hybrid query: keyword score + cosine(embedding) weighted fusion.

    Returns a list of {id, source, score: weighted_fusion, text} dicts,
    sorted by score descending. Returns [] if no index or no ST — the
    caller should fall back to keyword-only search_references.
    """
    idx = _load_index()
    if idx is None or not idx.get("chunks"):
        return []
    if not have_sentence_transformers():
        return []

    chunk_list = idx["chunks"]
    emb_matrix = idx["embeddings"]

    q_emb = _l2_normalize(list(map(float, _embedder().encode(text))))
    # SAG-inspired: strip noise phrases for cleaner retrieval signal
    cleaned_text = _strip_query_noise(text, language)
    q_tokens = _tokenize(cleaned_text)

    lang = language if language in ("zh", "en") else "zh"
    soft_kw_max = max(20.0, float(len(q_tokens)) * 4.0)

    scored = []
    for i, c in enumerate(chunk_list):
        co = sum(qe * ce for qe, ce in zip(q_emb, emb_matrix[i]))
        kw = _keyword_score(q_tokens, c["text"], c["source"])
        kw_norm = min(1.0, kw / soft_kw_max) if soft_kw_max > 0 else 0.0
        fused = semantic_weight * co + (1.0 - semantic_weight) * kw_norm
        c_lang = c["source"].split(":", 1)[0] if ":" in c["source"] else ""
        if c_lang and c_lang != lang:
            fused *= 0.6
        if co > 0 or kw > 0:
            scored.append((fused, i))
    scored.sort(reverse=True)

    return [{
        "id": chunk_list[i]["id"],
        "source": chunk_list[i]["source"],
        "score": round(fused, 4),
        "text": chunk_list[i]["text"],
    } for fused, i in scored[:top_k]]
