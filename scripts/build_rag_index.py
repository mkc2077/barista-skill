#!/usr/bin/env python
"""Build (or rebuild) the barista-skill RAG index.

Run this after adding new reference docs, new beans, or new craft recipes to
references/ so the semantic search layer picks them up. Requires
sentence-transformers (pip install sentence-transformers).

Usage:
    python scripts/build_rag_index.py

Output: data/rag_index.pkl (embeddings + chunk metadata)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "mcp-server"))

import rag_index

if __name__ == "__main__":
    if not rag_index.have_sentence_transformers():
        print("ERROR: sentence-transformers is not installed.")
        print("  pip install sentence-transformers")
        sys.exit(1)
    print("Building RAG index over references/*.md ...")
    stats = rag_index.build_index(verbose=True)
    print(f"Done. Indexed {stats.get('docs', 0)} docs, "
          f"{stats.get('chunks', 0)} chunks.")
    print(f"Index saved to: {rag_index.INDEX_PKL}")
