# Design: Barista Chat Next.js Migration

**Date:** 2026-07-26
**Status:** Approved
**Reference:** G0DM0D3 (https://github.com/elder-plinius/G0DM0D3.git)

## Overview

Upgrade `barista-chat` from a single-file HTML application to a full Next.js + TypeScript + Tailwind CSS project, borrowing feature characteristics from G0DM0D3's architecture. The original `web/barista-chat.html` is retained as a zero-dependency lightweight version.

## Goals

1. **Multi-conversation management** — Sidebar with session list, create/switch/delete/rename, auto-generated titles
2. **Import/Export** — Chat history and settings export to JSON, import to restore
3. **Local model auto-discovery** — Fetch `/v1/models` endpoint to discover Ollama/compatible server models, test connection
4. **Theme switching** — 4 coffee-themed color schemes (light-roast / pour-over / dark-roast / espresso)

## Non-Goals

- GODMODE multi-model racing (not applicable to coffee consultant)
- AutoTune context-adaptive sampling (over-engineered for this use case)
- Parseltongue input perturbation (red-teaming, not relevant)
- Telemetry / privacy controls (no backend, no data collection)
- Backend API server (pure frontend, user brings own API key)
- framer-motion animations (CSS is sufficient)

## Technical Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Matches G0DM0D3, SSR-capable, mature ecosystem |
| Language | TypeScript 5 | Type safety, better DX |
| Styling | Tailwind CSS 3 | Utility-first, theme via CSS variables |
| State | Zustand 4 + persist middleware | Lightweight, localStorage persistence built-in |
| Icons | lucide-react | Matches G0DM0D3, tree-shakeable |
| Markdown | react-markdown + react-syntax-highlighter | Rich rendering for coffee parameters |
| IDs | uuid | Conversation/message unique IDs |

**Not included:** express, cors, helmet, openai SDK, framer-motion, js-yaml (all from G0DM0D3 but unnecessary here).

## Project Structure

```
barista-skill/
├── web/
│   ├── barista-chat.html          # Retained: zero-dependency lightweight version (v4.2.0)
│   ├── README.md                  # Updated: dual-version documentation
│   └── next-app/                  # New: Next.js full version
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── .gitignore
│       ├── public/
│       │   └── favicon.svg
│       └── src/
│           ├── app/
│           │   ├── layout.tsx     # Root layout + theme initialization
│           │   ├── page.tsx       # Main page (Sidebar + ChatArea)
│           │   └── globals.css    # 4 coffee theme CSS variables
│           ├── components/
│           │   ├── Sidebar.tsx           # Session list + create/delete/rename
│           │   ├── ChatArea.tsx          # Message display area
│           │   ├── ChatInput.tsx         # Input box + send/stop
│           │   ├── ChatMessage.tsx       # Single message (Markdown render)
│           │   ├── SettingsModal.tsx     # Settings modal (API/MCP/theme/import-export)
│           │   ├── WelcomeScreen.tsx     # Welcome screen
│           │   ├── ModelSelector.tsx     # Model dropdown + local discovery
│           │   └── ThemeSwitcher.tsx     # Theme switcher (4 coffee themes)
│           ├── store/
│           │   └── index.ts             # Zustand store
│           ├── lib/
│           │   ├── llm-adapter.ts        # LLM adapter (migrated from HTML)
│           │   ├── mcp-client.ts         # MCP client (migrated from HTML)
│           │   ├── system-prompt.ts      # System prompt (migrated from HTML)
│           │   └── providers.ts          # PROVIDERS config
│           └── hooks/
│               └── useLocalModels.ts     # Local model auto-discovery
```

## State Management (Zustand Store)

### Types

```typescript
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
}

interface Conversation {
  id: string
  title: string           // Auto-generated from first user message (first 20 chars)
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface Settings {
  provider: string        // 'openai' | 'anthropic' | 'deepseek' | 'qwen' | 'moonshot' | 'glm' | 'ollama' | 'custom'
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  customPrompt: string
  mcpEnabled: boolean
  mcpUrl: string
}

type Theme = 'light-roast' | 'dark-roast' | 'pour-over' | 'espresso'
```

### Store Interface

```typescript
interface AppState {
  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null

  // Settings
  settings: Settings
  theme: Theme

  // UI state
  sidebarOpen: boolean
  isStreaming: boolean

  // Conversation operations
  createConversation: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, content: string) => void

  // Settings operations
  updateSettings: (partial: Partial<Settings>) => void
  setTheme: (theme: Theme) => void

  // UI operations
  toggleSidebar: () => void
  setStreaming: (streaming: boolean) => void

  // Import/Export
  exportData: () => { conversations: Conversation[]; settings: Settings }
  importData: (data: { conversations: Conversation[]; settings: Settings }) => void
}
```

### Persistence

Zustand `persist` middleware + `createJSONStorage(localStorage)`. Automatically saves conversations, settings, and theme. Same behavior as HTML version's localStorage, but more structured.

## Component Architecture

### Component Tree

```
<page.tsx>
├── <Sidebar>                    # Left 260px collapsible
│   ├── Logo + collapse button
│   ├── [New Chat] button
│   ├── Conversation list (scrollable)
│   │   └── Each item: title + hover delete/rename
│   ├── <ModelSelector>          # Bottom: current model + switch
│   └── Settings/theme quick buttons
│
├── <ChatArea>                   # Right main area
│   ├── <Header>                 # Top: status badge + settings + clear
│   ├── <WelcomeScreen>          # Shown when no conversation
│   └── Message list
│       └── <ChatMessage> x N    # Single message (Markdown + code highlight)
│
├── <ChatInput>                  # Bottom input bar
│   ├── textarea (auto-resize)
│   └── Send/Stop button
│
└── <SettingsModal>              # Settings modal
    ├── API provider select
    ├── API Key / Base URL / Model
    ├── <ModelSelector> inline (with local discovery button)
    ├── Temperature slider
    ├── MCP tools toggle + URL
    ├── <ThemeSwitcher>          # 4 coffee themes
    ├── System prompt (advanced collapsible)
    └── Import/Export buttons
```

### Data Flow

```
User input → ChatInput
  ↓
page.tsx: getAdapter() + assemble messages
  ↓
Branch: MCP enabled?
  ├─ Yes → mcp-client.ts: chatWithMCP() function calling loop
  │        ↓ chatOnce() → tool_calls → callTool() → feedback
  └─ No  → llm-adapter.ts: chatStream() streaming
  ↓
store.addMessage() to current conversation
  ↓
ChatArea auto-renders (Zustand subscription)
```

### Component Responsibilities

| Component | Responsibility | Dependencies |
|---|---|---|
| `Sidebar` | Session list CRUD, collapse/expand | store (conversations) |
| `ChatArea` | Message rendering, auto-scroll, empty state | store (current conversation messages) |
| `ChatInput` | Text input, Enter to send, stop button during streaming | store (isStreaming) |
| `ChatMessage` | Markdown rendering, user/assistant/error styles | react-markdown |
| `SettingsModal` | All settings, import/export | store (settings) |
| `ModelSelector` | Model dropdown, local model discovery (fetch `/v1/models`) | providers.ts |
| `WelcomeScreen` | Feature tags, start conversation button | store (createConversation) |
| `ThemeSwitcher` | 4 theme switch, live preview | store (theme) |

## Local Model Discovery (useLocalModels.ts)

```
User fills Base URL in settings (e.g., http://localhost:11434/v1)
  → Clicks "Test & Discover Models" button
  → fetch(`${baseUrl}/models`, { headers: { Authorization: Bearer xxx } })
  → Success: parse data.data[].id → populate model dropdown + show "Found N models"
  → Failure: show error "Connection failed: ..."
  → Compatible with Ollama (no key needed) and LM Studio / vLLM (key required)
```

## Streaming & MCP Path (Backward Compatible)

Same branching logic as HTML version:
- `settings.mcpEnabled && settings.mcpUrl && providerType !== 'anthropic'` → `chatWithMCP()`
- Otherwise → `chatStream()` (streaming, Anthropic uses native streaming)

## Theme System (4 Coffee Themes)

### CSS Variables (globals.css)

Four themes mapped to coffee roast levels:

| Theme | Background | Primary | Accent | Style |
|---|---|---|---|---|
| `light-roast` | #faf6f0 (cream) | #6f4e37 (coffee) | #c9a96e (amber) | Bright warm |
| `pour-over` | #f5f0e8 (beige) | #3e2723 (dark brown) | #c9a96e (amber) | Current HTML version |
| `dark-roast` | #1a1310 (dark brown) | #c9a96e (gold) | #d4b87e (light gold) | Warm dark |
| `espresso` | #0f0a08 (near black) | #d4a574 (latte) | #c9a96e (amber) | Minimal dark |

### Theme Switching Mechanism

- `<html class="theme-pour-over">` — default theme
- `ThemeSwitcher` component: 4 circular color swatch buttons, hover shows theme name
- On click: `store.setTheme()` + `document.documentElement.className = 'theme-' + theme`
- Zustand persist automatically saves theme choice

### Tailwind Configuration

Colors mapped to CSS variables, components use `bg-theme-bg` / `text-theme-text` etc. No hardcoded colors in components.

## LLM Adapter & MCP Client (Migration from HTML)

### llm-adapter.ts

Migrate `LLMAdapter` class from `barista-chat.html`:
- `chatStream(messages)` — async generator, yields content chunks
- `_streamOpenAI(messages)` — OpenAI-compatible streaming (SSE parsing)
- `_streamAnthropic(messages)` — Anthropic native streaming
- `chatOnce(messages, tools)` — non-streaming with tool support (for MCP loop)

### mcp-client.ts

Migrate `MCPClient` class:
- `_rpc(method, params)` — JSON-RPC over HTTP
- `listTools()` — fetch and cache tool list
- `callTool(name, args)` — execute MCP tool, return text
- `toOpenAITools(mcpTools)` — convert MCP schema to OpenAI function-calling format
- `chatWithMCP(adapter, messages, bubble)` — function calling loop (max 8 rounds)

### providers.ts

Migrate `PROVIDERS` object: 8 providers (OpenAI / Anthropic / DeepSeek / Qwen / Kimi / GLM / Ollama / Custom).

### system-prompt.ts

Migrate the full system prompt (14 brewing methods + 11 milk drinks + troubleshooting + glossary + plain-language rules).

## Error Handling

| Scenario | Handling |
|---|---|
| Missing API Key | `getAdapter()` returns null → auto-open SettingsModal |
| API request failed (401/403/500) | Parse error response, show `API Error (code): message` in message bubble |
| Stream interrupted (user stop) | `AbortController.abort()` → save generated content + append "(stopped)" |
| MCP connection failed | Show `MCP connection failed: reason` + prompt to run start.bat |
| MCP tool call failed | Set tool result to error text, pass back to LLM for continued reasoning |
| Local model discovery failed | Show `Connection failed: reason`, keep manual model input |
| Import data format error | `try/catch` JSON.parse → show `Import failed: invalid data format` |
| localStorage quota exceeded | Catch `QuotaExceededError` → prompt to export and clean old sessions |

All errors display **inline in chat bubbles or settings panel**, no alert/confirm (except clear conversation confirmation).

## Testing Strategy

Manual verification as primary approach (frontend project):

| Verification Item | Method |
|---|---|
| TypeScript compilation | `npx tsc --noEmit` — zero type errors |
| Next.js build | `npm run build` — build succeeds |
| Page rendering | `npm run dev` → browser open, check Sidebar/ChatArea/Settings |
| Multi-conversation CRUD | Create → switch → rename → delete, persist after refresh |
| Theme switching | Switch through 4 themes, CSS variables take effect live |
| Streaming chat | Configure API Key → send message → streaming output → stop button |
| MCP path | Start MCP Server → enable MCP → send "query pour-over params" → tool calling loop |
| Local model discovery | Start Ollama → fill Base URL → click discover → model list populated |
| Import/Export | Export JSON → clear → import restore → conversations and settings intact |
| Mobile responsive | Browser DevTools mobile view → Sidebar collapsible |

## Edge Cases

- **Empty conversation**: Show WelcomeScreen when no messages, don't send empty messages
- **Very long conversations**: Optional virtual scrolling (deferred, 100 messages is fine without it)
- **Anthropic + MCP**: Auto-fallback to streaming mode (same as HTML version)
- **Ollama without Key**: `getAdapter()` skips Key check (same as HTML version)
