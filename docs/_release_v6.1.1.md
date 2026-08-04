# Release v6.1.1 — Docs hygiene patch (SKILL.md consistency fixes)

**Date:** 2026-08-04
**Tag:** v6.1.1
**Theme:** Fix documentation drift accumulated during rapid v1.2 → v6.1 iteration. No functional changes.

## What changed

### SKILL.md
- Removed duplicated H1 title (`# Barista 咖啡师教练` leftover from a previous iteration; kept `# Barista 咖啡师教练 → 专属咖啡顾问`).
- Fixed frontmatter `description` transcription errors: "穿透思问" → "穿透式提问", "千变量" → "关键变量", "節奏" → "节奏", "水质量" → "水质", "顺序调浴" → "分段注水".
- English segment: garbled "ordering/coffee ordering (“green grading”, defect beans)" → "green-coffee grading (defect beans)".
- Fixed intro paragraph: "24 bilingual tools" → "26 bilingual tools" (matches frontmatter, README, and actual server.py tool count).

### mcp-server/README.md
- Architecture note: "24 tools" → "26 tools" (verified: 26 public top-level functions in `server.py`, excluding `main`).
- Knowledge-source line: "25 Markdown files" → "25 zh topics + 21 en mirrored Markdown files" (actual on-disk counts).

### Repo cleanup
- Deleted `_msg_v480.txt` (stray v4.8.0 release-notes draft at repo root).

## Verification
- `python scripts\self_check.py` — ALL CHECKS PASSED (26 tool names aligned, 5 source version sync, references bilingual mirror OK).
- `python -m pytest -q` — all tests pass (no behavior change).
- Tool count independently verified by counting public top-level functions in `mcp-server/server.py` (27 − `main` = 26).

## Files touched
- `SKILL.md` — duplicate H1 removed, frontmatter typos fixed, 24 → 26, version → 6.1.1
- `mcp-server/README.md` — 24 → 26, references count precise
- `data/version.json` — 6.1.0 → 6.1.1
- `mcp-server/server.py` — `__version__` → 6.1.1
- `README.md` — version badge → 6.1.1
- `CHANGELOG.md` — [6.1.1] entry
- `_msg_v480.txt` — deleted
- `docs/_release_v6.1.1.md` — this file
