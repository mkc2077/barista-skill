# Barista Coffee Coach Skill

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-6.0.0-blue)
![MCP tools](https://img.shields.io/badge/MCP%20tools-26-blueviolet)
![Brew methods](https://img.shields.io/badge/brew-14%20methods-success)
![Tests](https://img.shields.io/badge/tests-175%20pass-success)

A general-purpose AI agent **dedicated Coffee Coach Skill** — dialogue-led,
continuous penetrating follow-ups that map the current situation, break the
problem apart, and find the ONE variable that improves the cup. **Bilingual**
(zh / en). MCP tools support `language="zh"/"en"` natively. Works with
WorkBuddy / Claude Code / Cursor / Codex / Trae.

> "My coffee is too bitter" → the consultant asks: bitter in the front, or
> the back of throat? Lately changed beans or grind size? → lock the
> variable → "push ratio deeper and finer grind, touch nothing else first.
> Log the bitterness delta."

Ships with a standard MCP server (`barista-mcp`, callable from any MCP
client). See [mcp-server/README.md](mcp-server/README.md) for tool surface.

## Two schemes / 两种方案

> **v6.0.0** — full frontend rebuild (single-accent design tokens, anti-AI-slop
  UI rules), SAG-style query-time dynamic entity hyperedges in RAG, light/dark
  themes. See [CHANGELOG.md](CHANGELOG.md) and
  [docs/adr/0002-frontend-v6-design-direction.md](docs/adr/0002-frontend-v6-design-direction.md).

| | Scheme A (skill) | Scheme B (local app) |
|---|---|---|
| Model | Your own Agent client provides the model | You fill in your own API key (OpenAI / Anthropic / Qwen / DeepSeek / Kimi / GLM / Ollama / ...) |
| Web search | Asked through your Agent | Built-in, via [AnySearch](https://www.anysearch.com/docs) key (anonymous tier free) |
| One-click start | n/a | `start.bat` (Windows) / `start.sh` (macOS / Linux) — auto-installs deps, launches MCP, opens browser |
| Storage | Server-side / agent-managed | localStorage in browser only |

## Quick start (Scheme B)

1. Ensure Python 3.10+ and Node.js 20+ are installed.
2. Double-click `start.bat` on Windows (or `./start.sh` on macOS / Linux).
3. Fill in your API key in Settings when the app opens.
4. Start asking questions.

To stop: close the terminal window. The launcher cleans up the MCP backend
and matches the Next.js dev server to your tab.

## What the skill covers

- **14 brewing methods** + **11 classic milk drinks** + craft specialty drinks
- **Bean selection, storage, water quality**
- **Sensory evaluation**: SCA cupping (100-pt), CVA new scale (SCA-102/103/104/105)
- **Grinder calibration**, golden-cup parameter matrices, the flavor wheel
- **Champion brewing index**: 4:6 method (Kasuya), Inoue recipes, etc. with
  dripper / filter-paper / water-temperature recipes
- **SCA certification** and **Q-Grader exam** track (6 modules × 3 levels,
  22 exam items, study plans, defect scoring, green grading)
- **Bilingual** references and report templates

## RAG (how retrieval works in v6)

`mcp-server/rag_index.py` performs **hybrid retrieval** (CJK 2-gram keyword
+ sentence-transformers semantic cosine) over `references/*.md`, with
degrade-to-keyword fallback when the embedding model isn't installed.

`mcp-server/rag_entities.py` is a **SAG-inspired query-time dynamic hyperedge**
layer: extracts coffee entities (bean / origin / roast / method / flavor)
from `data/*.json`, builds a controlled vocabulary, and at query time
boosts chunks that share entities with the query. `rag_search` pulls 
`top_k*3` candidates, reranks by entity overlap, then truncates — lifting
the document that hooks onto a different coffee concept higher.

For why we did **not** bundle the full PixelRAG screenshot pipeline, see
[docs/adr/0001-pixelrag-screenshot-retrieval-deferred.md](docs/adr/0001-pixelrag-screenshot-retrieval-deferred.md).
Short version: coffee knowledge is text parameters + JSON; visual layout
is rarely the retrieve signal. The `add_documents` API keeps the door
open for a future opt-in upload-screenshot hook.

## Contributing

We borrow the mattpocock/skills hygiene pattern:

- **ADRs** (`docs/adr/*.md`) record "we decided X because Y". Future runs
  do not re-litigate.
- **.out-of-scope** (`docs/out-of-scope/*.md}) records "we did not do X,
  here is the specific reason why".
- **SKILL.md frontmatter description** lists triggers with a single
  trigger per branch (per mattpocock's writing-great-skills), with the
  leading word "barista / coffee / SCA / Q-Grader / cupping".

## Reflection

This version was rebuilt under:

- @ponytail — laziness constraint (no new heavy deps unless proven needed)
- @andrej-karpathy-skills — behavioral guidelines to reduce common LLM
  coding mistakes
- Reference repos:
  - [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) — anti-slop UI rules
  - [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
  - [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
  - [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)
  - [Zleap-AI/SAG](https://github.com/Zleap-AI/SAG) — entity / query-time dynamic hyperedges
  - [StarTrail-org/PixelRAG](https://github.com/StarTrail-org/PixelRAG) — studied, deferred (see ADR 0001)
  - [mattpocock/skills](https://github.com/mattpocock/skills) — ADR, out-of-scope,
    writing-great-skills hygiene pattern

## License

MIT.
