# Release v6.1.0 — Cross-conversation user profile + personal knowledge library

**Date:** 2026-08-04
**Tag:** v6.1.0
**Theme:** Real user-specific coffee coaching — persistent profile, inventory, knowledge library, multimodal image understanding.

## What changed

### Cross-conversation persistence (frontend)
- Zustand `Settings` now carries: `profile: UserProfile`, `inventoryBeans: InventoryBean[]`, `inventoryGrinders: string[]`, `knowledge: KnowledgeNote[]`.
- Custom `merge` in the persist middleware gracefully merges old localStorage state with new defaults — existing user state survives upgrades.
- Every conversation now auto-injects profile + recent knowledge + inventory into the system prompt via `buildSystemPrompt(settings)`.

### Personalized conversations (`system-prompt.ts`)
- `buildUserProfileBlock(s)` — gear / water / taste / skill level / beans you usually drink → plain-language block injected every turn.
- `buildUserContextJSON(s)` — emits the exact JSON shape expected by the MCP `user_context` parameter, so the model can forward it into tool calls.
- `buildKnowledgeBlock(s)` — latest 8 user notes (title + body + category + source) injected into every prompt.
- `buildSystemPrompt(s)` — orchestrates the three blocks on top of the existing coach persona.

### Local knowledge library + one-click online refresh
- `websearchRaw(query)` in `anysearch.ts` returns structured results (not just markdown) so the Settings UI can save each as a `KnowledgeNote`.
- Settings panel exposes a search input + Globe button → any query → AnySearch → structured notes auto-saved, sorted by recency, fed into prompts.

### Multimodal image understanding (carried from v6.0, now real)
- `ChatInput.handleSend` now attaches `images` to outgoing messages.
- `llm-adapter.ts` routes images correctly across all four LLM channels:
  - OpenAI-compatible streaming (`_openAIContent` → `image_url` array parts),
  - Anthropic native streaming (`_anthropicContent` → base64 `image` blocks),
  - MCP tool-call loop OpenAI path,
  - MCP tool-call loop Anthropic path.
- `ChatMessage` renders uploaded images in the user bubble.
- System prompt instructs the model on how to read bean cards, grinder product pages, cupping gauge sheets — and to ask for clarification for unrecognizable images or models without vision.

### Gate fix (frontend build)
- `ChatInput.tsx` — missing closing `</div>` restored (was causing JSX parse error).
- `globals.css` — `@import url(...fonts...)` hoisted above `@tailwind base;` to comply with CSS ordering; stray BOM removed.

## Verification
- `python scripts\self_check.py` — ALL CHECKS PASSED (26 tool names aligned, 5 source version sync, references bilingual mirror OK, RAG index present).
- `python -m pytest -q` — 175 passed.
- `npm run build` — Compiled successfully, TypeScript clean, static pages generated.

## Files touched (high level)
- `data/version.json` — 6.0.0 → 6.1.0
- `mcp-server/server.py` — `__version__` → 6.1.0
- `SKILL.md` — version → 6.1.0
- `CHANGELOG.md` — [6.1.0] entry
- `README.md` — bilingual rewrite
- `web/next-app/src/store/index.ts` — profile/inventory/knowledge types + persist merge
- `web/next-app/src/lib/system-prompt.ts` — `buildSystemPrompt` + helpers
- `web/next-app/src/lib/anysearch.ts` — `websearchRaw`
- `web/next-app/src/lib/llm-adapter.ts` — `_openAIContent` / `_anthropicContent` in 4 paths
- `web/next-app/src/components/ChatInput.tsx` — inject `images`, use `buildSystemPrompt`
- `web/next-app/src/components/ChatMessage.tsx` — render user images
- `web/next-app/src/components/SettingsPanel.tsx` — profile/inventory/knowledge form + online refresh button
- `web/next-app/src/app/globals.css` — `@import` hoist + BOM strip
- `docs/_release_v6.1.0.md` — this file
