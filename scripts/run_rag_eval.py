#!/usr/bin/env python3
"""Golden-QA Recall@5 evaluation for the barista RAG layer (v7 P2).

Run:  .venv/Scripts/python scripts/run_rag_eval.py [--strict]
Requires: sentence-transformers installed + index built
         (.venv/Scripts/python scripts/build_rag_index.py)

Measures: for each question in evals/golden_qa.jsonl, is the ground-truth
source (e.g. "zh:recipes-baseline") inside the top-5 RAG hits?
PixelRAG-style Retrieval Accuracy = correct / total (exact source match —
cheaper and more honest than an LLM judge at this scale; ponytail: add
LLM-as-judge only if exact-match stops discriminating).

Exit code: 0 always unless --strict and Recall@5 < 0.6.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "mcp-server"))
import rag_index as ri  # noqa: E402

GOLDEN = ROOT / "evals" / "golden_qa.jsonl"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true", help="exit 1 if Recall@5 < 0.6")
    ap.add_argument("--top-k", type=int, default=5)
    args = ap.parse_args()

    if not ri.is_available():
        print("[eval] RAG index not ready (sentence-transformers missing or no index).")
        print("[eval] Run: .venv/Scripts/python scripts/build_rag_index.py")
        return 2

    questions = [json.loads(l) for l in GOLDEN.read_text("utf-8").splitlines() if l.strip()]
    hits = 0
    for q in questions:
        top = ri.query(q["query"], top_k=args.top_k, language=q.get("lang", "zh"))
        sources = {h["source"] for h in top}
        ok = q["source"] in sources
        hits += bool(ok)
        print(f"{'HIT ' if ok else 'miss'} [{q['source']:>28}] {q['query']}")
        if not ok and sources:
            print(f"      got: {sorted(sources)[:3]}")

    recall = hits / len(questions)
    print(f"\nRecall@{args.top_k} = {hits}/{len(questions)} = {recall:.1%}")
    if args.strict and recall < 0.6:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
