# ADR 0001 — PixelRAG screenshot pipeline not wired in by default

**Date**: 2026-08-03
**Status**: Accepted

## Context

The main task asks us to "read StarTrail-org/PixelRAG to do RAG well".

PixelRAG is a Berkeley SkyLab research project that renders web pages /
PDFs to screenshots and indexes the screenshots with a vision encoder
(Qwen3-VL-Embedding-2B, fine-tuned on ~2.4M webpage screenshots). It
shines for tables, charts, and infographics — layout that HTML parsing
throws away is preserved in the screenshot.

We read the PixelRAG README and noted:

- One-time cost: render a page to tile screenshots, then encode them with
  a multimodal embedding model trained for webpage layout
- Retrieval backend is FAISS (local) or Qdrant (scalable)
- Training pipeline (train/) requires LoRA fine-tuning of
  Qwen3-VL-Embedding-2B on HuggingFace, ~240Mparams LoRA adapters shipped
- Distribution is a Claude Code plugin that calls the local `pixelshot` CLI

## Decision

Do not integrate PixelRAG by default in v6.0. Keep the door open via a
single hook: `rag_index.add_documents(texts)` already accepts new texts,
and a future pipeline could pipe `pixelshot -> embed -> add_documents`
through that entry without touching `server.py` surface area.

Specifically we skip:

- Pulling the Qwen3-VL-Embedding-2B adapter (~2GB HuggingFace download)
- Wiring the LoRA inference path
- Bundling pixelshot / Chromium renderer with the launcher
- Adding FAISS as a default local index backend (LanceDB is heavier and
  unnecessary for the current corpus)

## Rationale

~90% of the barista knowledge base is text parameters + JSON: origins,
roast levels, grind settings, cupping ten dimensions, parameter matrices,
defect classification lists. Sentence-transformers + 2-gram CJK keyword
hybrid retrieval (already in `rag_index.py`, now augmented by
`rag_entities.py` for entity overlap fusion) covers these reliably.

Screenshot re-encoding only adds an extra OCR/VLM round trip on the same
text payload. The visual-layout clue is rarely present in our corpus, so
the cost (~2GB dependency balloon, slow cold start) does not pay back for
the user's stated "small white users, easy to run" goal.

The cases where screenshots would actually be irreplaceable are:

- A user uploads a scanned cupping form PDF — needs the full one-page form
  to identify which dimension scored what
- Champion recipe handwritten notes (Tetsu Kasuya 4:6 method, Inoue
  dripper recipes) where layout is part of the spec
- Craft signature drinks where visual layering / garnish matters

None of these is the default RAG query path; they are an opt-in "upload
screenshot / PDF" entry, reserved for a later milestone.

## Impact

- v6.0 has no new heavy dependency — installer stays lite
- UI keeps an optional "upload screenshot / PDF" hook as a future farming port
- Reusing this work later does not change `server.py` tool surface; the
  pipeline can back-fill via `rag_index.add_documents` directly
