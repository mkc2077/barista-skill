"""Entity-aware retrieval layer for barista-skill RAG.

SAG-inspired: chunks are nodes, shared coffee entities create query-time
dynamic hyperedges between them. Pure stdlib regex extraction against a
controlled vocabulary derived from the actual recipe/origin/sensory data.

Public surface:
  build_vocabulary()       -> scan data + references, derive entity vocab
  extract_entities(text)   -> set of canonical entity ids found in text
  score_chunks(query_entities, chunk_entities) -> dict[chunk_id -> bonus]
  enrich_query(query, hits) -> re-ranked hits with entity bonus applied
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, Iterable, List, Set, Tuple

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
DATA = REPO / "data"
REFS = REPO / "references"

CATEGORIES = ("bean", "origin", "roast", "method", "flavor")

_VOCAB: Dict[str, Set[str]] = {}  # category -> set of canonical names
_VOCAB_ALIASES: Dict[str, str] = {}  # alias(lower) -> canonical (first match wins)
_CHUNK_ENTITIES: Dict[str, Set[str]] = {}  # chunk_id -> set of canonical entity ids
_VOCAB_BUILT = False
ENTITY_BONUS_WEIGHT = 0.18

# Words that are common but too short or generic for entities.
_NOISE_TOKENS = {
    "", "zh", "en", "name", "zh/en", "ratio", "temp", "time",
    "grind", "gear", "steps", "dose", "yield", "flavor",
    "water_temp", "water", "temperature", "method", "origin", "bean",
    "roast", "country", "region", "descriptor", "title",
}


def _register(alias: str, canonical: str) -> None:
    """Add an alias entry if alias has signal."""
    if not alias or len(alias) < 2:
        return
    if alias.lower() in _NOISE_TOKENS:
        return
    _VOCAB_ALIASES.setdefault(alias.lower(), canonical)


def _maybe_register_name_field(value, category: str) -> None:
    """value might be a string, a dict {zh, en}, or a list. Record names."""
    if isinstance(value, str):
        v = value.strip()
        if v and len(v) >= 2 and v.lower() not in _NOISE_TOKENS:
            _VOCAB[category].add(v)
            _register(v, v)
    elif isinstance(value, dict):
        for sub in ("zh", "en", "name"):
            if sub in value:
                _maybe_register_name_field(value[sub], category)
    elif isinstance(value, list):
        for item in value:
            _maybe_register_name_field(item, category)


def _walk_dict_keys(obj, category: str) -> None:
    """For dicts whose KEY is the entity name (origin/roast/process/recipe),
    record the key. Then recurse looking for name fields in values."""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(key, str) and len(key) >= 2 and key.lower() not in _NOISE_TOKENS:
                # Don't pick structural IDs that are just "zh"/"en" etc.
                _VOCAB[category].add(key)
                _register(key, key)
            # Recurse for nested name fields
            _maybe_register_name_field(value, category)
            _walk_dict_keys(value, category)
    elif isinstance(obj, list):
        for item in obj:
            _maybe_register_name_field(item, category)
            _walk_dict_keys(item, category)


def build_vocabulary(verbose: bool = False) -> Dict[str, int]:
    """Scan data/ JSON files to build the entity vocabulary."""
    global _VOCAB, _VOCAB_ALIASES, _VOCAB_BUILT
    _VOCAB = {c: set() for c in CATEGORIES}
    _VOCAB_ALIASES = {}

    scans: List[Tuple[str, str]] = [
        ("parameters_origin.json", "origin"),
        ("parameters_process.json", "method"),
        ("parameters_roast.json", "roast"),
        ("recipes.json", "method"),
        ("milk_drinks.json", "method"),
        ("green_coffee_grading.json", "bean"),
        ("defect_beans.json", "flavor"),
    ]
    for fn, category in scans:
        path = DATA / fn
        if not path.exists():
            continue
        try:
            obj = json.loads(path.read_text("utf-8"))
        except Exception:
            continue
        _walk_dict_keys(obj, category)

    # flavor_wheel: nested lists -> walk for names
    wheel_path = DATA / "flavor_wheel.json"
    if wheel_path.exists():
        try:
            wheel = json.loads(wheel_path.read_text("utf-8"))
            _walk_dict_keys(wheel, "flavor")
        except Exception:
            pass

    # always built (even if empty); flavor descriptions live in
    # parameters_origin's flavor dict; we already collected them above
    # via _maybe_register_name_field walking into the flavor dict.

    _VOCAB_BUILT = True
    if verbose:
        for cat in CATEGORIES:
            print("  vocab[" + cat + "] = " + str(len(_VOCAB[cat])))
        print("  aliases = " + str(len(_VOCAB_ALIASES)))
    return {cat: len(_VOCAB[cat]) for cat in CATEGORIES}


def extract_entities(text: str) -> Set[str]:
    """Return canonical entity ids found in text. Builds vocab lazily."""
    if not _VOCAB_BUILT:
        build_vocabulary()
    if not text:
        return set()
    lowered = text.lower()
    found: Set[str] = set()
    for alias, canonical in _VOCAB_ALIASES.items():
        if alias and len(alias) >= 2 and alias in lowered:
            found.add(canonical)
    return found


def scan_chunks(chunks: List[dict]) -> Dict[str, Set[str]]:
    """Map each chunk's id to its extracted entities."""
    global _CHUNK_ENTITIES
    if not chunks:
        return {}
    out: Dict[str, Set[str]] = {}
    for c in chunks:
        cid = c.get("id") or (c.get("source", "") + "#" + str(hash(c.get("text", "")) & 0xFFFFFF))
        ents = extract_entities(c.get("text", ""))
        if ents:
            out[cid] = ents
    _CHUNK_ENTITIES = out
    return out


def entity_overlap(q: Set[str], c: Set[str]) -> float:
    if not q or not c:
        return 0.0
    inter = len(q & c)
    if inter == 0:
        return 0.0
    union = len(q | c)
    return inter / union if union else 0.0


def enrich_query(query: str, hits: List[dict], verbose: bool = False) -> List[dict]:
    """Re-rank hits by applying entity overlap bonus. The SAG "dynamic
    hyperedge" step: query entities activate edges to chunks sharing them."""
    if not hits:
        return hits
    q_ents = extract_entities(query)
    if not q_ents:
        return hits

    chunk_ids = [h.get("id", "") for h in hits]
    needs_scan = any(cid not in _CHUNK_ENTITIES for cid in chunk_ids)
    if needs_scan:
        scan_chunks(hits)

    out: List[dict] = []
    for h in hits:
        c_ents = _CHUNK_ENTITIES.get(h["id"], set())
        overlap = entity_overlap(q_ents, c_ents)
        bonus = ENTITY_BONUS_WEIGHT * overlap
        new_score = h["score"] + bonus
        out.append({**h, "score": round(new_score, 4), "entity_overlap": round(overlap, 3)})
    out.sort(key=lambda x: x["score"], reverse=True)
    return out


def status() -> dict:
    if not _VOCAB_BUILT:
        build_vocabulary()
    return {
        "vocab_categories": {c: len(_VOCAB[c]) for c in CATEGORIES},
        "vocab_aliases": len(_VOCAB_ALIASES),
        "chunk_entities_cached": len(_CHUNK_ENTITIES),
        "bonus_weight": ENTITY_BONUS_WEIGHT,
    }
