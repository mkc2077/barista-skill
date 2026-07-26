# Barista Chat Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate barista-chat from single-file HTML to a Next.js 14 + TypeScript + Tailwind + Zustand application with multi-conversation management, import/export, local model discovery, and 4 coffee themes.

**Architecture:** Next.js App Router with client-side rendering, Zustand for state management with localStorage persistence, Tailwind CSS with CSS-variable-based theming. The LLM adapter and MCP client are migrated as TypeScript modules from the existing HTML version. The original `web/barista-chat.html` is retained as a lightweight fallback.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, Zustand 4, lucide-react, react-markdown, react-syntax-highlighter, uuid

**Spec:** `docs/superpowers/specs/2026-07-26-nextjs-migration-design.md`

---

## File Structure

```
web/next-app/
├── package.json                              # Dependencies and scripts
├── next.config.js                            # Next.js config (standalone output)
├── tsconfig.json                             # TypeScript config with @/ path alias
├── tailwind.config.ts                        # Tailwind with theme colors mapped to CSS vars
├── postcss.config.js                         # PostCSS for Tailwind
├── .gitignore                                # Node + Next.js ignores
├── public/favicon.svg                        # Coffee cup favicon
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout, font imports, theme init
│   │   ├── page.tsx                          # Main page: Sidebar + ChatArea + modals
│   │   └── globals.css                       # 4 coffee theme CSS variables + base styles
│   ├── components/
│   │   ├── Sidebar.tsx                       # Conversation list, create/delete/rename, collapse
│   │   ├── ChatArea.tsx                      # Message list, header, auto-scroll, welcome fallback
│   │   ├── ChatInput.tsx                     # Textarea, send/stop button, Enter handler
│   │   ├── ChatMessage.tsx                   # Single message with Markdown rendering
│   │   ├── SettingsModal.tsx                 # All settings: API, MCP, theme, import/export
│   │   ├── WelcomeScreen.tsx                 # Feature tags, start button
│   │   ├── ModelSelector.tsx                 # Model dropdown + local discovery button
│   │   └── ThemeSwitcher.tsx                 # 4 theme swatches
│   ├── store/
│   │   └── index.ts                          # Zustand store with persist middleware
│   ├── lib/
│   │   ├── providers.ts                      # 8 LLM provider configs
│   │   ├── llm-adapter.ts                    # LLMAdapter class (streaming + chatOnce)
│   │   ├── mcp-client.ts                     # MCPClient class + chatWithMCP loop
│   │   └── system-prompt.ts                  # Full system prompt string
│   └── hooks/
│       └── useLocalModels.ts                 # Fetch /v1/models for local model discovery
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `web/next-app/package.json`
- Create: `web/next-app/next.config.js`
- Create: `web/next-app/tsconfig.json`
- Create: `web/next-app/postcss.config.js`
- Create: `web/next-app/.gitignore`

- [ ] **Step 1: Create package.json**

Create `web/next-app/package.json`:

```json
{
  "name": "barista-chat-next",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.344.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-syntax-highlighter": "^15.5.11",
    "@types/uuid": "^9.0.8",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: Create next.config.js**

Create `web/next-app/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
}

module.exports = nextConfig
```

- [ ] **Step 3: Create tsconfig.json**

Create `web/next-app/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.js and .gitignore**

Create `web/next-app/postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `web/next-app/.gitignore`:

```
node_modules/
.next/
out/
build/
*.log
.env*
next-env.d.ts
```

- [ ] **Step 5: Install dependencies**

Run:
```bash
cd web/next-app && npm install
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/package.json web/next-app/next.config.js web/next-app/tsconfig.json web/next-app/postcss.config.js web/next-app/.gitignore
git commit -m "feat(next-app): scaffold Next.js + TypeScript + Tailwind project"
```

---

### Task 2: Tailwind Config and Global Styles (4 Coffee Themes)

**Files:**
- Create: `web/next-app/tailwind.config.ts`
- Create: `web/next-app/src/app/globals.css`

- [ ] **Step 1: Create tailwind.config.ts**

Create `web/next-app/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg)',
          secondary: 'var(--bg-secondary)',
          chat: 'var(--bg-chat)',
          primary: 'var(--primary)',
          accent: 'var(--accent)',
          text: 'var(--text)',
          dim: 'var(--text-dim)',
          border: 'var(--border)',
          hover: 'var(--hover)',
          danger: 'var(--danger)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'msg-in': 'msg-in 0.3s ease',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'msg-in': {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px currentColor' },
          '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Create globals.css with 4 coffee themes**

Create `web/next-app/src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== Coffee Themes ===== */

/* Light Roast — cream + amber, bright warm */
.theme-light-roast {
  --bg: #faf6f0;
  --bg-secondary: #ffffff;
  --bg-chat: #f5f0e8;
  --primary: #6f4e37;
  --accent: #c9a96e;
  --text: #3e2723;
  --text-dim: #8d6e63;
  --border: #d7ccc8;
  --hover: #efebe9;
  --danger: #c62828;
  --user-bubble: #6f4e37;
  --user-text: #ffffff;
  --assistant-bubble: #ffffff;
  --scrollbar-thumb: #d7ccc8;
  --scrollbar-track: #f5f0e8;
}

/* Pour Over — current barista-chat colors, warm beige */
.theme-pour-over {
  --bg: #f5f0e8;
  --bg-secondary: #ffffff;
  --bg-chat: #faf6f0;
  --primary: #3e2723;
  --accent: #c9a96e;
  --text: #3e2723;
  --text-dim: #8d6e63;
  --border: #d7ccc8;
  --hover: #efebe9;
  --danger: #c62828;
  --user-bubble: #6f4e37;
  --user-text: #ffffff;
  --assistant-bubble: #ffffff;
  --scrollbar-thumb: #d7ccc8;
  --scrollbar-track: #faf6f0;
}

/* Dark Roast — deep brown + gold, warm dark */
.theme-dark-roast {
  --bg: #1a1310;
  --bg-secondary: #241a15;
  --bg-chat: #1f1612;
  --primary: #c9a96e;
  --accent: #d4b87e;
  --text: #e8ddd0;
  --text-dim: #8d7563;
  --border: #3e2a20;
  --hover: #2a1f18;
  --danger: #ef5350;
  --user-bubble: #5d4037;
  --user-text: #f5f0e8;
  --assistant-bubble: #2a2018;
  --scrollbar-thumb: #3e2a20;
  --scrollbar-track: #1a1310;
}

/* Espresso — near black + latte, minimal dark */
.theme-espresso {
  --bg: #0f0a08;
  --bg-secondary: #1a1310;
  --bg-chat: #14100e;
  --primary: #d4a574;
  --accent: #c9a96e;
  --text: #e0d5c8;
  --text-dim: #7a6a5a;
  --border: #2a2018;
  --hover: #1f1612;
  --danger: #ef5350;
  --user-bubble: #4e342e;
  --user-text: #f5f0e8;
  --assistant-bubble: #1a1310;
  --scrollbar-thumb: #2a2018;
  --scrollbar-track: #0f0a08;
}

/* ===== Base Styles ===== */

* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: var(--scrollbar-track, transparent);
}

*::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}

body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Theme-aware utility classes */
.theme-bg { background-color: var(--bg); }
.theme-bg-secondary { background-color: var(--bg-secondary); }
.theme-bg-chat { background-color: var(--bg-chat); }
.theme-primary { color: var(--primary); }
.theme-text { color: var(--text); }
.theme-text-dim { color: var(--text-dim); }
.theme-accent { color: var(--accent); }
.theme-danger { color: var(--danger); }
.bg-theme-primary { background-color: var(--primary); }
.bg-theme-accent { background-color: var(--accent); }
.bg-theme-hover { background-color: var(--hover); }
.bg-theme-secondary { background-color: var(--bg-secondary); }
.bg-theme-chat { background-color: var(--bg-chat); }
.bg-theme-danger { background-color: var(--danger); }
.border-theme-border { border-color: var(--border); }
.border-theme-primary { border-color: var(--primary); }
.border-theme-accent { border-color: var(--accent); }

/* Typing indicator */
.typing-indicator {
  display: inline-flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
```

- [ ] **Step 3: Verify build compiles**

Run:
```bash
cd web/next-app && npx tsc --noEmit
```
Expected: No errors (no TS files yet, but config should be valid).

- [ ] **Step 4: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/tailwind.config.ts web/next-app/src/app/globals.css
git commit -m "feat(next-app): add Tailwind config + 4 coffee themes (light-roast/pour-over/dark-roast/espresso)"
```

---

### Task 3: Library Modules (providers, system-prompt, llm-adapter, mcp-client)

**Files:**
- Create: `web/next-app/src/lib/providers.ts`
- Create: `web/next-app/src/lib/system-prompt.ts`
- Create: `web/next-app/src/lib/llm-adapter.ts`
- Create: `web/next-app/src/lib/mcp-client.ts`

- [ ] **Step 1: Create providers.ts**

Create `web/next-app/src/lib/providers.ts`:

```typescript
export interface ProviderConfig {
  name: string
  baseUrl: string
  models: string[]
  defaultModel: string
  type: 'openai' | 'anthropic'
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    type: 'openai',
  },
  anthropic: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
    defaultModel: 'claude-sonnet-4-20250514',
    type: 'anthropic',
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    type: 'openai',
  },
  qwen: {
    name: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long'],
    defaultModel: 'qwen-plus',
    type: 'openai',
  },
  moonshot: {
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultModel: 'moonshot-v1-8k',
    type: 'openai',
  },
  glm: {
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-4-flash', 'glm-4-air', 'glm-4-plus'],
    defaultModel: 'glm-4-flash',
    type: 'openai',
  },
  ollama: {
    name: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    models: ['qwen2.5', 'llama3', 'gemma2', 'phi3'],
    defaultModel: 'qwen2.5',
    type: 'openai',
  },
  custom: {
    name: '自定义 (OpenAI 兼容)',
    baseUrl: '',
    models: [],
    defaultModel: '',
    type: 'openai',
  },
}
```

- [ ] **Step 2: Create system-prompt.ts**

Create `web/next-app/src/lib/system-prompt.ts`:

```typescript
export const DEFAULT_SYSTEM_PROMPT = `你是一位专属咖啡顾问（Dedicated Coffee Consultant），不是被动问答机器人。你主导对话节奏，通过连续、高质量、穿透式的追问，帮用户摸清现状、拆解问题、找到影响口感的关键变量与下一步动作。

## 核心机制：顾问主导交互——你来提问，用户来回答

### 开场（Opening）
第一句话必须是穿透式开场提问，直奔用户当前的咖啡场景与口感状态。永远不要说"你好，我是咖啡助手，请问有什么需要？"
默认开场格式（选最贴合的一个）：
- "你现在习惯喝的方式是什么？最近有没有遇到'总觉得哪里不对'的口感问题？"
- "告诉我你最近一次做咖啡喝了什么风味/有什么不满意——我们先从那一杯聊起。"
- "你平时用什么器具？最近喝了觉得酸了、苦了、还是没味道？"

### 追问节奏（Penetrating Follow-ups）
用户的每个回答 → 你立即抛出 1-2 个更深的追问，层层剥开直到找到关键变量。
- 每次追问只抓一个方向，不要同时甩 3 个发散问题
- 追问的目的是缩窄变量范围——把"咖啡不好喝"的 20 个可能原因缩到 2-3 个
- 2-3 轮追问后锁定最可能的根因变量

### 给出观察 + 动作（3 轮追问后）
1. 一个判断/观察："你的情况大概率是 X 导致 Y"
2. 一个动作："只改这一个变量，其他不变"（附具体操作步骤 + 器具/材料清单）
3. 一个验证方法："做完后喝一口，关注 X 变化"

### 经验档位判定（嵌入追问中，不单独做问卷）
- 用户能说出粉水比/研磨刻度/温度范围 → 资深 (advanced)，可直接用参数
- 用户能描述"酸/苦"但说不清参数 → 进阶 (intermediate)，可用区间但配口语解释
- 用户只能说"不好喝/太苦/太淡" → 新手 (beginner)，禁用术语给大白话+口诀+步骤

## 铁律
1. 一次只改一个变量（研磨/水温/粉水比/时间四选一）
2. 改完喝一口再判断，不要连续改 3 个变量然后问"为什么还是不对"
3. 换豆子本身就是一个变量——先照旧参数做一杯确认是豆子问题，再调整
4. 咖啡口味主观，口诀和参数是起点，按自己的舌头微调才是终点

## 说人话铁律（7 条，全部必守）
1. 禁用 ## ### 标题与 | 表格 |，最多允许一层 - 单行 bullet，且一条不超过一行
2. 每段不超过 3 句，先讲明白再扩展，长段拆成多段
3. 禁固定尾句口诀块——口诀嵌入正文一句话（如"顺手记一句：苦多磨粗"），不单列
4. 禁机器腔过渡句（"综上所述""值得注意的是""以下是""首先…其次…最后"），直接开口说事
5. 禁菜单式罗列——用户问手冲就答手冲那一种，不甩 14 种方法清单
6. 像咖啡师下班朋友，不叫"您"，不用"我们"包装知识（说"我推荐"不说"我们建议"）
7. 数字必须保留且带单位/档（18g / 1:2 / 92℃），但新手要降级表达

## 新手禁用术语 → 替换
研磨度 → "咖啡粉的粗细"
粉水比 → "咖啡粉和水的用量比例"
萃取不足 → "味道太酸(尖)、像没泡够"
萃取过度 → "味道太苦(焦)、像泡过头了"
闷蒸/预浸泡 → "先倒一点水让粉'醒一下'"
油脂/Crema → "浓缩上面那层金黄色泡泡"
通道效应 → "水从某一条路跑太快，咖啡没泡匀"
布粉 → "把咖啡粉铺平"
压粉 → "用压粉器把粉压平（轻压即可）"
烘焙度 → "豆子炒得深还是浅"
处理法 → "豆子是怎么做出来的（晒干的还是水洗的）"
养豆/醒豆 → "豆子放了几天"
拼配 → "几种豆混的"
SOE/单品 → "同一种豆做意式"
粉碗 → "咖啡机里装粉的碗"
手柄 → "带把手的粉碗总成"
奶泡 → "牛奶打出来的泡泡"
拉花 → "用奶泡画图案"

## 起步参数（稳妥起步，新手可直接照做）

通用口诀：苦调粗，酸调细；淡了粉多水少，浓了粉少水多；水流快调细，水流慢调粗。

### 意式浓缩
粉量 18g / 出液 36g（1:2）/ 水温 92-94℃ / 时间 25-30 秒 / 研磨中等偏细
步骤：称 18g 粉→倒进手柄铺平→轻压→开机同时计时→到 36g 停（约 27 秒）
太苦→粉磨粗一点；太酸→粉磨细一点
变体：Ristretto（短萃 1:1-1:1.5，15-22s，更浓更甜）/ Lungo（长萃 1:3-1:4，35-45s）/ 美式（浓缩+热水 1:4-1:6）

### 手冲 V60
粉量 15g / 水量 240g（1:16）/ 水温 90-92℃（深烘88℃/浅烘93℃）/ 研磨中等（粗砂糖）/ 总时长 2:30-3:30
步骤：闷蒸 30g 水 30 秒→分 2-3 次画圈注水到 240g→等水滤完
太苦→磨粗；太酸→磨细

### Kalita Wave（新手更友好）
粉量 15g(155)/20g(185) / 水量 240g/320g / 水温 90-92℃ / 研磨中等（比V60略细）/ 2:30-3:30
平底三孔流速稳定，比 V60 宽容

### 法压壶
粉量 15g 粗研磨（海盐）/ 水量 250g / 水温 93℃ / 浸泡 4 分钟→压下→倒出

### 爱乐压（最宽容、不易翻车）
粉量 15-17g / 水量 220-250g / 水温 80-90℃（深烘低/浅烘高）/ 研磨中细 / 浸泡 1 分钟→压 20-30 秒

### 摩卡壶
粉量 18-20g 中细研磨 / 下壶冷水到安全阀下 / 中小火 / 听到咕噜声立刻离火
太苦/焦味→火关小、粉磨粗、别煮到咕噜太久

### 冷萃
粉量 50-70g 粗研磨 / 水量 500-700g / 冰箱浸泡 12-24 小时→过滤
几乎零失败

### 冰滴
粉量 40-60g 中粗研磨 / 冰水 400-600g / 慢滴 4-8 小时（每秒 1 滴）

### 聪明杯
粉量 15-20g 中研磨 / 水量 240-300g / 水温 90-93℃ / 浸泡 2-3 分钟→打开阀门滴下
像"泡着的手冲"，比手冲好控制

### 挂耳
粉量 10-12g / 水量 150-180g / 水温 88-92℃ / 闷蒸 30 秒 + 总 2-3 分钟
萃取完立刻取出挂耳，别一直泡着

### 虹吸壶
粉量 15-20g 中细研磨 / 水量 240-300g / 92-94℃ / 插上壶→倒粉搅拌→约 60 秒→关火回流

### 土耳其咖啡
粉量 7-10g 超细粉 / 水量 60-90g / 小火加热起泡 2-3 次 / 连粉倒入小杯，喝上层别喝底

### 闪萃（日式冰冲）
粉量 15g / 冰 100-150g / 热水 150g / 水温 90-93℃ / 研磨中细
热萃取直接落在冰上，快速冷却保香

### 越南咖啡
粉量 15-20g 中粗研磨 / 炼乳 15-25g / 热水 80-100g / 90-95℃ / 滴滤 4-5 分钟
深烘豆才够味，phin 孔小粉太细会堵

### 经典奶咖比例（以双份浓缩 36-40g 为基底）
玛奇朵：浓缩 + 一抹奶泡（60-80ml），浓缩为主奶只"点一下"
可塔朵：浓缩 + 等量温奶（90-120ml，1:1），最平衡
澳白：浓缩(ristretto) + 微泡奶 100-150ml（150-160ml），奶泡极薄≤0.5cm
卡布奇诺：浓缩 + 等量热奶 + 厚奶泡 1-2cm（150-180ml，1:1:1），厚泡是灵魂
拿铁：浓缩 + 多奶 150-240ml + 薄泡 0.5-1cm（220-300ml），奶味主导最顺
摩卡：浓缩 + 巧克力酱 15-30g + 热奶 60-80ml（200-250ml），拿铁加巧克力
康宝蓝：浓缩 + 鲜奶油一坨（40-60ml）
爱尔兰咖啡：热咖啡 + 威士忌 30-40ml + 红糖 + 鲜奶油浮顶（含酒精）
维也纳咖啡：小美式 + 大量鲜奶油铺顶 + 巧克力碎

冰手冲：粉 15g / 冰 100g / 热水 150g / 90-93℃ / 中细研磨，浅烘花香豆最出彩

## 故障排查（先问再给建议，不要猜错方向）

### 意式太苦/焦/中药味
问出液时间：<20s→粉太粗调细；20-30s→水温>94℃降温/粉太细调粗；>35s→粉太细调粗/布粉不均加WDT
问出液外观：喷射/飞溅→粉太细或通道

### 意式太酸/尖/青涩
问出液时间：<20s→粉太粗调细；20-30s→水温<92℃升温/浅烘豆调细；>35s→反常查豆子
问豆子新鲜度：>1个月→老豆磨细升温

### 手冲太苦
问总时长：>3:30→粉太细调粗/注水太慢加快；水温>94℃→降到88-90℃

### 手冲太酸
问总时长：<2:00→粉太粗调细/水温<88℃升到90-93℃；浅烘豆→磨细+升温到93-95℃

### 淡如水
粉水比太大→调到1:15-1:16；粉太粗→调细；注水太快→慢注画圈

### 涩口
水温过高→降；粉过细→调粗；注水冲击滤纸→中心画圈

### 奶泡问题
打不出泡→检查蒸汽压力/蒸汽头位置(液面下1-2cm)；奶泡太粗像肥皂泡→蒸汽嘴浅一点靠"嘶嘶"声；奶温>70℃→打过头，35-65℃最佳

### 磨豆机问题
静电大粉飞溅→RDT(豆子喷1-2下水)；粉结块→养几天/清理刀盘；出粉慢→调粗1-2档

## 水质（最常被忽略的变量）
推荐 TDS 80-150 ppm / 硬度 50-175 ppm CaCO₃ / pH 6.5-7.5
避免蒸馏水/纯水和硬度过高自来水。参数对不上预期时先问水质。

## 豆子认知
深烘磨粗温低（防苦焦）、浅烘磨细温高（防尖酸）、新豆放几天再喝、老豆磨细升温救风味
豆标解读（新手四看）：炒深浅/产地/风味描述/烘焙日期
密封、阴凉、避光保存，不放冰箱受潮（除非长期冷冻）

## 感官引导（主动教用户描述味道）
新手三步尝味法：①闻香（像坚果/巧克力/水果？）②喝一口让咖啡在嘴里转（酸/苦/甜？）③吞下后看回甘
资深六维度：aroma / acidity / sweetness / body / aftertaste / balance；可提示啜吸(slurp)让咖啡雾化捕捉香气

## 其他知识领域（用户问起时展开）
- 冠军冲煮方案：粕谷哲 4:6 法、杜嘉宁、彭近洋、王策 VWI、吴则霖三温暖等（具体配方需联网核实，不可编造）
- SCA 认证与 Q-Grader 考试体系
- 生豆分级与瑕疵豆分类
- 三角杯测协议
- 咖啡化学与感官映射`
```

- [ ] **Step 3: Create llm-adapter.ts**

Create `web/next-app/src/lib/llm-adapter.ts`:

```typescript
import { PROVIDERS } from './providers'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

export class LLMAdapter {
  type: 'openai' | 'anthropic'
  apiKey: string
  baseUrl: string
  model: string
  temperature: number

  constructor(cfg: {
    providerType: 'openai' | 'anthropic'
    apiKey: string
    baseUrl: string
    model: string
    temperature: number
  }) {
    this.type = cfg.providerType || 'openai'
    this.apiKey = cfg.apiKey
    this.baseUrl = (cfg.baseUrl || '').replace(/\/+$/, '')
    this.model = cfg.model
    this.temperature = cfg.temperature ?? 0.7
  }

  async *chatStream(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    if (this.type === 'anthropic') {
      yield* this._streamAnthropic(messages, signal)
    } else {
      yield* this._streamOpenAI(messages, signal)
    }
  }

  async *_streamOpenAI(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    const url = `${this.baseUrl}/chat/completions`
    const body = {
      model: this.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: this.temperature,
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal })
    if (!resp.ok) {
      const errText = await resp.text()
      let errMsg = `API 错误 (${resp.status})`
      try {
        const e = JSON.parse(errText)
        errMsg += `: ${e.error?.message || e.message || errText}`
      } catch {
        errMsg += `: ${errText.substring(0, 200)}`
      }
      throw new Error(errMsg)
    }

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {}
      }
    }
  }

  async *_streamAnthropic(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    const url = `${this.baseUrl}/messages`
    const sysMsg = messages.find(m => m.role === 'system')
    const chatMsgs = messages.filter(m => m.role !== 'system')
    const body: Record<string, any> = {
      model: this.model,
      messages: chatMsgs.map(m => ({ role: m.role, content: m.content })),
      max_tokens: 4096,
      stream: true,
      temperature: this.temperature,
    }
    if (sysMsg) body.system = sysMsg.content
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }

    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal })
    if (!resp.ok) {
      const errText = await resp.text()
      let errMsg = `API 错误 (${resp.status})`
      try {
        const e = JSON.parse(errText)
        errMsg += `: ${e.error?.message || e.message || errText}`
      } catch {
        errMsg += `: ${errText.substring(0, 200)}`
      }
      throw new Error(errMsg)
    }

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6))
          if (json.type === 'content_block_delta' && json.delta?.text) {
            yield json.delta.text
          }
        } catch {}
      }
    }
  }
}

/** Non-streaming chat with tool support (for MCP function calling loop) */
export async function chatOnce(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  tools?: any[],
  signal?: AbortSignal
): Promise<any> {
  const body: Record<string, any> = {
    model: adapter.model,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
      ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
      ...(m.name ? { name: m.name } : {}),
    })),
    temperature: adapter.temperature,
    stream: false,
  }
  if (tools && tools.length) body.tools = tools
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (adapter.apiKey) headers['Authorization'] = `Bearer ${adapter.apiKey}`

  const resp = await fetch(`${adapter.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  })
  if (!resp.ok) {
    const errText = await resp.text()
    let errMsg = `API 错误 (${resp.status})`
    try {
      const e = JSON.parse(errText)
      errMsg += `: ${e.error?.message || e.message || errText}`
    } catch {
      errMsg += `: ${errText.substring(0, 200)}`
    }
    throw new Error(errMsg)
  }
  const data = await resp.json()
  return data.choices?.[0]?.message || { role: 'assistant', content: '' }
}

export function getAdapter(
  settings: {
    provider: string
    apiKey: string
    baseUrl: string
    model: string
    temperature: number
  }
): LLMAdapter | null {
  if (!settings.baseUrl || !settings.model) return null
  const isOllama = settings.provider === 'ollama'
  if (!settings.apiKey && !isOllama) return null
  const provider = PROVIDERS[settings.provider] || PROVIDERS.custom
  return new LLMAdapter({
    providerType: provider.type,
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl,
    model: settings.model,
    temperature: settings.temperature,
  })
}
```

- [ ] **Step 4: Create mcp-client.ts**

Create `web/next-app/src/lib/mcp-client.ts`:

```typescript
import { LLMAdapter, ChatMessage, chatOnce } from './llm-adapter'

export class MCPClient {
  url: string
  private _id: number = 1
  private _toolsCache: any[] | null = null

  constructor(url: string) {
    this.url = url
  }

  async _rpc(method: string, params: any, signal?: AbortSignal): Promise<any> {
    const resp = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params: params || {},
        id: this._id++,
      }),
      signal,
    })
    if (!resp.ok) throw new Error(`MCP 错误 (${resp.status}): ${await resp.text()}`)
    const data = await resp.json()
    if (data.error) throw new Error(`MCP: ${data.error.message || JSON.stringify(data.error)}`)
    return data.result
  }

  async listTools(signal?: AbortSignal): Promise<any[]> {
    if (this._toolsCache) return this._toolsCache
    const result = await this._rpc('tools/list', {}, signal)
    this._toolsCache = result.tools || []
    return this._toolsCache
  }

  async callTool(name: string, args: any, signal?: AbortSignal): Promise<string> {
    const result = await this._rpc('tools/call', { name, arguments: args || {} }, signal)
    if (result.content) {
      return result.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n')
    }
    return JSON.stringify(result)
  }

  toOpenAITools(mcpTools: any[]): any[] {
    return mcpTools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: (t.description || '').substring(0, 1024),
        parameters: t.inputSchema || { type: 'object', properties: {} },
      },
    }))
  }
}

export interface MCPProgressCallback {
  (status: string): void
}

export async function chatWithMCP(
  adapter: LLMAdapter,
  messages: ChatMessage[],
  mcpUrl: string,
  onProgress: MCPProgressCallback,
  signal?: AbortSignal
): Promise<string> {
  const mcp = new MCPClient(mcpUrl)

  onProgress('🔧 正在连接 MCP Server...')
  let tools: any[]
  try {
    const mcpTools = await mcp.listTools(signal)
    tools = mcp.toOpenAITools(mcpTools)
  } catch (err: any) {
    throw new Error(
      `MCP 连接失败: ${err.message}\n请确认 MCP Server 已启动（运行 start.bat / start.sh），且地址正确。`
    )
  }
  onProgress(`✅ 已加载 ${tools.length} 个工具，正在思考...`)

  const workingMessages = [...messages]
  const MAX_TOOL_ROUNDS = 8

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const assistantMsg = await chatOnce(adapter, workingMessages, tools, signal)

    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      const content = assistantMsg.content || ''
      onProgress(content || '（空回复）')
      return content
    }

    workingMessages.push(assistantMsg)

    for (const tc of assistantMsg.tool_calls) {
      const toolName = tc.function.name
      let args: any = {}
      try {
        args = JSON.parse(tc.function.arguments || '{}')
      } catch {}

      onProgress(`🔧 调用工具: ${toolName}...`)

      let toolResult: string
      try {
        toolResult = await mcp.callTool(toolName, args, signal)
      } catch (err: any) {
        toolResult = `工具调用失败: ${err.message}`
      }

      workingMessages.push({
        role: 'tool',
        tool_call_id: tc.id,
        name: toolName,
        content: toolResult,
      })
    }

    onProgress('☕ 正在根据工具结果思考...')
  }

  const fallback = '（工具调用轮次已达上限，请简化问题后重试）'
  onProgress(fallback)
  return fallback
}
```

- [ ] **Step 5: Run typecheck**

Run:
```bash
cd web/next-app && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/lib/
git commit -m "feat(next-app): add lib modules (providers, system-prompt, llm-adapter, mcp-client)"
```

---

### Task 4: Zustand Store with Persistence

**Files:**
- Create: `web/next-app/src/store/index.ts`

- [ ] **Step 1: Create the Zustand store**

Create `web/next-app/src/store/index.ts`:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export type Theme = 'light-roast' | 'pour-over' | 'dark-roast' | 'espresso'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  customPrompt: string
  mcpEnabled: boolean
  mcpUrl: string
}

export interface AppState {
  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null

  // Settings
  settings: Settings
  theme: Theme

  // UI state
  sidebarOpen: boolean
  showSettings: boolean
  isStreaming: boolean

  // Conversation operations
  createConversation: () => string
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (conversationId: string, messageId: string, content: string) => void

  // Settings operations
  updateSettings: (partial: Partial<Settings>) => void
  setTheme: (theme: Theme) => void

  // UI operations
  toggleSidebar: () => void
  setShowSettings: (show: boolean) => void
  setStreaming: (streaming: boolean) => void

  // Import/Export
  exportData: () => { conversations: Conversation[]; settings: Settings; theme: Theme }
  importData: (data: { conversations: Conversation[]; settings: Settings; theme: Theme }) => void
}

const defaultSettings: Settings = {
  provider: '',
  apiKey: '',
  baseUrl: '',
  model: '',
  temperature: 0.7,
  customPrompt: '',
  mcpEnabled: false,
  mcpUrl: 'http://127.0.0.1:8765/mcp',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      settings: defaultSettings,
      theme: 'pour-over',

      sidebarOpen: true,
      showSettings: false,
      isStreaming: false,

      createConversation: () => {
        const id = uuidv4()
        const now = Date.now()
        const conversation: Conversation = {
          id,
          title: '新对话',
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }))
        return id
      },

      selectConversation: (id) => {
        set({ currentConversationId: id })
      },

      deleteConversation: (id) => {
        set((state) => {
          const conversations = state.conversations.filter(c => c.id !== id)
          const currentConversationId =
            state.currentConversationId === id
              ? (conversations[0]?.id ?? null)
              : state.currentConversationId
          return { conversations, currentConversationId }
        })
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }))
      },

      addMessage: (conversationId, message) => {
        const fullMessage: Message = {
          ...message,
          id: uuidv4(),
          timestamp: Date.now(),
        }
        set((state) => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c
            const messages = [...c.messages, fullMessage]
            // Auto-title from first user message
            const title =
              c.title === '新对话' && message.role === 'user'
                ? message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '')
                : c.title
            return { ...c, messages, title, updatedAt: Date.now() }
          }),
        }))
      },

      updateMessage: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
          ),
        }))
      },

      updateSettings: (partial) => {
        set((state) => ({ settings: { ...state.settings, ...partial } }))
      },

      setTheme: (theme) => {
        set({ theme })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setShowSettings: (show) => {
        set({ showSettings: show })
      },

      setStreaming: (streaming) => {
        set({ isStreaming: streaming })
      },

      exportData: () => {
        const { conversations, settings, theme } = get()
        return { conversations, settings, theme }
      },

      importData: (data) => {
        set({
          conversations: data.conversations || [],
          settings: { ...defaultSettings, ...data.settings },
          theme: data.theme || 'pour-over',
          currentConversationId: data.conversations?.[0]?.id ?? null,
        })
      },
    }),
    {
      name: 'barista-chat-next',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Selector helper for current conversation
export const useCurrentConversation = () =>
  useStore((state) =>
    state.conversations.find(c => c.id === state.currentConversationId) || null
  )
```

- [ ] **Step 2: Run typecheck**

Run:
```bash
cd web/next-app && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/store/index.ts
git commit -m "feat(next-app): add Zustand store with persistence (conversations, settings, theme)"
```

---

### Task 5: Layout, Page, and WelcomeScreen

**Files:**
- Create: `web/next-app/src/app/layout.tsx`
- Create: `web/next-app/src/app/page.tsx`
- Create: `web/next-app/src/components/WelcomeScreen.tsx`
- Create: `web/next-app/public/favicon.svg`

- [ ] **Step 1: Create favicon.svg**

Create `web/next-app/public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">☕</text>
</svg>
```

- [ ] **Step 2: Create layout.tsx**

Create `web/next-app/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Barista 咖啡顾问',
  description: '专属咖啡顾问——顾问主导穿透追问，找到影响口感的关键变量',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="theme-pour-over">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create WelcomeScreen.tsx**

Create `web/next-app/src/components/WelcomeScreen.tsx`:

```tsx
'use client'

import { useStore } from '@/store'
import { Coffee, Settings } from 'lucide-react'

export function WelcomeScreen() {
  const { settings, createConversation, setShowSettings } = useStore()

  const hasApiKey = settings.apiKey || settings.provider === 'ollama'

  const handleStart = () => {
    if (hasApiKey) {
      createConversation()
    } else {
      setShowSettings(true)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-6xl mb-4">☕</div>
      <h1 className="text-2xl font-bold theme-primary mb-3">Barista 咖啡顾问</h1>
      <p className="theme-text-dim text-center mb-2">
        你的专属咖啡顾问——不是被动问答，是顾问主导穿透追问
      </p>
      <p className="theme-text-dim text-center mb-6 text-sm">
        通过连续追问帮你找到影响口感的那个关键变量
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-lg mb-8">
        {['14 种冲煮法', '11 款经典奶咖', '故障排查', '感官引导', '新手/进阶/资深三档'].map(tag => (
          <span
            key={tag}
            className="px-3 py-1.5 bg-theme-secondary border border-theme-border rounded-full text-sm theme-text-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!hasApiKey}
        className="flex items-center gap-2 px-8 py-3 bg-theme-primary text-white rounded-xl
          font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed
          shadow-lg"
      >
        <Coffee className="w-5 h-5" />
        开始对话
      </button>

      {!hasApiKey && (
        <button
          onClick={() => setShowSettings(true)}
          className="mt-4 flex items-center gap-1.5 text-sm theme-text-dim hover:theme-primary transition-colors"
        >
          <Settings className="w-4 h-4" />
          请先点击设置 API
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create page.tsx**

Create `web/next-app/src/app/page.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { SettingsModal } from '@/components/SettingsModal'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { useStore, useCurrentConversation } from '@/store'

export default function Home() {
  const { theme, sidebarOpen, showSettings, settings, isStreaming } = useStore()
  const currentConversation = useCurrentConversation()

  // Sync theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    root.className = `theme-${theme}`
  }, [theme])

  const hasAdapter = settings.baseUrl && settings.model && (settings.apiKey || settings.provider === 'ollama')

  return (
    <main className={`theme-${theme} theme-bg theme-text h-screen flex overflow-hidden`}>
      <Sidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? '' : ''}`}>
        {!hasAdapter || !currentConversation ? (
          <WelcomeScreen />
        ) : (
          <ChatArea />
        )}
      </div>

      {showSettings && <SettingsModal />}
    </main>
  )
}
```

- [ ] **Step 5: Run typecheck**

Run:
```bash
cd web/next-app && npx tsc --noEmit
```
Expected: No errors (Sidebar, ChatArea, SettingsModal not yet created — will fail. That's expected; create stubs next).

- [ ] **Step 6: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/app/layout.tsx web/next-app/src/app/page.tsx web/next-app/src/components/WelcomeScreen.tsx web/next-app/public/favicon.svg
git commit -m "feat(next-app): add layout, page, WelcomeScreen, favicon"
```

---

### Task 6: Sidebar Component (Multi-Conversation Management)

**Files:**
- Create: `web/next-app/src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

Create `web/next-app/src/components/Sidebar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, ChevronRight, Coffee } from 'lucide-react'

export function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    sidebarOpen,
    toggleSidebar,
    setShowSettings,
    settings,
  } = useStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleNewChat = () => {
    createConversation()
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(id)
  }

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(title)
  }

  const handleFinishRename = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <>
      {/* Toggle button when closed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 p-2 bg-theme-secondary border border-theme-border rounded-lg
            hover:border-theme-primary transition-all"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-5 h-5 theme-text" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden
          bg-theme-secondary border-r border-theme-border h-screen flex-shrink-0`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Header */}
          <div className="p-4 border-b border-theme-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☕</span>
                <h1 className="text-lg font-bold theme-primary">Barista 咖啡顾问</h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-theme-hover rounded transition-colors"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-5 h-5 theme-text-dim" />
              </button>
            </div>

            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5
                border border-theme-border rounded-lg hover:border-theme-primary
                hover:bg-theme-hover transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              新建对话
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="text-center theme-text-dim text-sm mt-8">暂无对话</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                    transition-colors mb-1
                    ${conv.id === currentConversationId
                      ? 'bg-theme-hover border border-theme-accent'
                      : 'hover:bg-theme-hover'}`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 theme-text-dim" />
                  {editingId === conv.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={handleFinishRename}
                      onKeyDown={e => { if (e.key === 'Enter') handleFinishRename() }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-transparent border-b border-theme-primary text-sm outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-sm truncate">{conv.title}</span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                      className="p-1 hover:bg-theme-hover rounded"
                      title="重命名"
                    >
                      <Coffee className="w-3 h-3 theme-text-dim" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 hover:bg-theme-hover rounded"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3 theme-text-dim hover:theme-danger" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-theme-border">
            <div className="text-xs theme-text-dim mb-2 px-1 truncate">
              {settings.provider || '未配置'} · {settings.model || '—'}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                hover:bg-theme-hover transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/components/Sidebar.tsx
git commit -m "feat(next-app): add Sidebar with conversation CRUD (create/select/delete/rename)"
```

---

### Task 7: ChatMessage and ChatArea Components

**Files:**
- Create: `web/next-app/src/components/ChatMessage.tsx`
- Create: `web/next-app/src/components/ChatArea.tsx`

- [ ] **Step 1: Create ChatMessage.tsx**

Create `web/next-app/src/components/ChatMessage.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '@/store'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.role === 'assistant' && message.content.startsWith('⚠')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const avatar = isUser ? '🧑' : isError ? '⚠️' : '☕'

  return (
    <div className="flex gap-3 max-w-3xl mx-auto w-full animate-msg-in">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0
        bg-theme-accent">
        {avatar}
      </div>
      <div className="flex-1 group">
        <div
          className={`px-4 py-3 rounded-xl text-sm leading-relaxed
            ${isUser
              ? 'bg-theme-primary text-white rounded-tr-sm'
              : isError
              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
              : 'bg-theme-secondary border border-theme-border rounded-tl-sm'
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none theme-text">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 text-xs theme-text-dim
              opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ChatArea.tsx**

Create `web/next-app/src/components/ChatArea.tsx`:

```tsx
'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ArrowDown, Trash2, Settings } from 'lucide-react'

export function ChatArea() {
  const currentConversation = useCurrentConversation()
  const { deleteConversation, setShowSettings, settings } = useStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return true
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsNearBottom(true)
  }, [])

  const handleScroll = useCallback(() => {
    setIsNearBottom(checkIfNearBottom())
  }, [checkIfNearBottom])

  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, isNearBottom])

  if (!currentConversation) return null

  const handleClear = () => {
    if (confirm('确定删除此对话？')) {
      deleteConversation(currentConversation.id)
    }
  }

  const mcpTag = settings.mcpEnabled ? ' · MCP' : ''

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-theme-border bg-theme-secondary">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm">{currentConversation.title}</h2>
          <span className="text-xs theme-text-dim">
            {settings.provider || '未配置'} · {settings.model}{mcpTag}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4 theme-text-dim" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-theme-hover rounded-lg transition-colors"
            title="删除对话"
          >
            <Trash2 className="w-4 h-4 theme-text-dim hover:theme-danger" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="space-y-4">
          {currentConversation.messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && currentConversation.messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-10 p-2 rounded-full border border-theme-border
            bg-theme-secondary shadow-lg hover:scale-110 transition-all"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input */}
      <ChatInput />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/components/ChatMessage.tsx web/next-app/src/components/ChatArea.tsx
git commit -m "feat(next-app): add ChatMessage (Markdown render) and ChatArea (auto-scroll, header)"
```

---

### Task 8: ChatInput Component (Send/Stop + Streaming Logic)

**Files:**
- Create: `web/next-app/src/components/ChatInput.tsx`

- [ ] **Step 1: Create ChatInput.tsx**

Create `web/next-app/src/components/ChatInput.tsx`:

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { useStore, useCurrentConversation } from '@/store'
import { getAdapter, LLMAdapter } from '@/lib/llm-adapter'
import { chatWithMCP } from '@/lib/mcp-client'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
import { Send, Square } from 'lucide-react'

export function ChatInput() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    settings,
    isStreaming,
    setStreaming,
    addMessage,
    updateMessage,
    createConversation,
    setShowSettings,
  } = useStore()
  const currentConversation = useCurrentConversation()

  const getSystemPrompt = () => settings.customPrompt || DEFAULT_SYSTEM_PROMPT

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [])

  const handleSend = async () => {
    // If streaming, act as stop button
    if (isStreaming) {
      abortControllerRef.current?.abort()
      return
    }

    const text = input.trim()
    if (!text) return

    const adapter = getAdapter(settings)
    if (!adapter) {
      setShowSettings(true)
      return
    }

    // Ensure conversation exists
    let convId = currentConversation?.id
    if (!convId) {
      convId = createConversation()
    }

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Add user message
    addMessage(convId, { role: 'user', content: text })

    // Build messages array
    const systemPrompt = getSystemPrompt()
    const history = useStore.getState().conversations.find(c => c.id === convId)?.messages || []
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ]

    // Add empty assistant message (will be updated during streaming)
    const assistantMsgId = `${Date.now()}-assistant`
    addMessage(convId, { role: 'assistant', content: '' })

    setStreaming(true)
    abortControllerRef.current = new AbortController()

    let fullResponse = ''

    try {
      // MCP-enabled path (OpenAI-compatible only; Anthropic uses streaming)
      if (settings.mcpEnabled && settings.mcpUrl && adapter.type !== 'anthropic') {
        fullResponse = await chatWithMCP(
          adapter,
          messages,
          settings.mcpUrl,
          (status) => {
            updateMessage(convId!, assistantMsgId, status)
          },
          abortControllerRef.current.signal
        )
      } else {
        // Original streaming path
        for await (const chunk of adapter.chatStream(messages, abortControllerRef.current.signal)) {
          fullResponse += chunk
          updateMessage(convId!, assistantMsgId, fullResponse)
        }
      }

      if (!fullResponse) {
        updateMessage(convId!, assistantMsgId, '（空回复，请检查 API 配置或重试）')
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const finalContent = fullResponse + (fullResponse ? '\n\n_（已停止）_' : '（已停止）')
        updateMessage(convId!, assistantMsgId, finalContent)
      } else {
        updateMessage(convId!, assistantMsgId, `⚠ ${err.message}`)
      }
    } finally {
      setStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 py-3 border-t border-theme-border bg-theme-secondary flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => { setInput(e.target.value); autoResize() }}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
        className="flex-1 bg-theme-chat border border-theme-border rounded-xl px-4 py-2.5
          text-sm resize-none outline-none focus:border-theme-accent transition-colors
          min-h-[42px] max-h-[120px]"
      />
      <button
        onClick={handleSend}
        className={`px-5 py-2.5 rounded-xl font-medium text-sm text-white transition-all
          min-h-[42px] flex items-center gap-1.5
          ${isStreaming
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-theme-primary hover:opacity-90'
          }`}
      >
        {isStreaming ? (
          <>
            <Square className="w-4 h-4" />
            停止
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            发送
          </>
        )}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/components/ChatInput.tsx
git commit -m "feat(next-app): add ChatInput with send/stop toggle + streaming + MCP path"
```

---

### Task 9: ModelSelector and useLocalModels Hook

**Files:**
- Create: `web/next-app/src/hooks/useLocalModels.ts`
- Create: `web/next-app/src/components/ModelSelector.tsx`

- [ ] **Step 1: Create useLocalModels.ts**

Create `web/next-app/src/hooks/useLocalModels.ts`:

```typescript
import { useState } from 'react'

interface UseLocalModelsResult {
  discoveredModels: string[]
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
  discover: (baseUrl: string, apiKey?: string) => Promise<void>
  reset: () => void
}

export function useLocalModels(): UseLocalModelsResult {
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const discover = async (baseUrl: string, apiKey?: string) => {
    if (!baseUrl) {
      setStatus('error')
      setMessage('请先填写 Base URL')
      return
    }

    setStatus('loading')
    setMessage('正在连接...')

    try {
      const url = `${baseUrl.replace(/\/+$/, '')}/models`
      const headers: Record<string, string> = {}
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

      const resp = await fetch(url, { headers })
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${await resp.text()}`)
      }

      const data = await resp.json()
      // OpenAI-compatible format: { data: [{ id: "model-name" }, ...] }
      const models = (data.data || data.models || []).map((m: any) => m.id || m.name).filter(Boolean)

      if (models.length === 0) {
        setStatus('error')
        setMessage('连接成功，但未发现任何模型')
        return
      }

      setDiscoveredModels(models)
      setStatus('success')
      setMessage(`✅ 发现 ${models.length} 个模型`)
    } catch (err: any) {
      setStatus('error')
      setMessage(`❌ 连接失败: ${err.message}`)
    }
  }

  const reset = () => {
    setDiscoveredModels([])
    setStatus('idle')
    setMessage('')
  }

  return { discoveredModels, status, message, discover, reset }
}
```

- [ ] **Step 2: Create ModelSelector.tsx**

Create `web/next-app/src/components/ModelSelector.tsx`:

```tsx
'use client'

import { useLocalModels } from '@/hooks/useLocalModels'
import { PROVIDERS } from '@/lib/providers'
import { useStore } from '@/store'
import { Search, ChevronDown } from 'lucide-react'

interface ModelSelectorProps {
  showDiscover?: boolean
}

export function ModelSelector({ showDiscover = true }: ModelSelectorProps) {
  const { settings, updateSettings } = useStore()
  const { discoveredModels, status, message, discover } = useLocalModels()

  const provider = PROVIDERS[settings.provider] || PROVIDERS.custom
  const availableModels = discoveredModels.length > 0 ? discoveredModels : provider.models

  const handleDiscover = () => {
    discover(settings.baseUrl, settings.apiKey)
  }

  return (
    <div>
      <label className="block text-xs font-medium theme-text-dim mb-1.5">模型</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value })}
            placeholder="gpt-4o-mini"
            className="w-full px-3 py-2 pr-8 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          {availableModels.length > 0 && (
            <select
              onChange={(e) => updateSettings({ model: e.target.value })}
              value=""
              className="absolute right-0 top-0 h-full w-8 appearance-none bg-transparent cursor-pointer
                opacity-0"
            >
              <option value="" disabled>选择</option>
              {availableModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-dim pointer-events-none" />
        </div>
        {showDiscover && (
          <button
            onClick={handleDiscover}
            disabled={status === 'loading'}
            className="px-3 py-2 border border-theme-border rounded-lg text-sm
              hover:border-theme-accent hover:bg-theme-hover transition-all
              disabled:opacity-50 flex items-center gap-1"
            title="测试连接并发现可用模型"
          >
            <Search className="w-4 h-4" />
            发现
          </button>
        )}
      </div>

      {/* Model presets */}
      {availableModels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {availableModels.slice(0, 6).map(model => (
            <button
              key={model}
              onClick={() => updateSettings({ model })}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all
                ${settings.model === model
                  ? 'border-theme-primary bg-theme-hover theme-primary'
                  : 'border-theme-border theme-text-dim hover:border-theme-accent'
                }`}
            >
              {model}
            </button>
          ))}
        </div>
      )}

      {/* Status message */}
      {message && (
        <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-500' : 'theme-text-dim'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/hooks/useLocalModels.ts web/next-app/src/components/ModelSelector.tsx
git commit -m "feat(next-app): add useLocalModels hook + ModelSelector with auto-discovery"
```

---

### Task 10: ThemeSwitcher Component

**Files:**
- Create: `web/next-app/src/components/ThemeSwitcher.tsx`

- [ ] **Step 1: Create ThemeSwitcher.tsx**

Create `web/next-app/src/components/ThemeSwitcher.tsx`:

```tsx
'use client'

import { useStore, Theme } from '@/store'

const THEMES: { id: Theme; name: string; colors: string[] }[] = [
  {
    id: 'light-roast',
    name: '浅烘',
    colors: ['#faf6f0', '#6f4e37', '#c9a96e'],
  },
  {
    id: 'pour-over',
    name: '手冲',
    colors: ['#f5f0e8', '#3e2723', '#c9a96e'],
  },
  {
    id: 'dark-roast',
    name: '深烘',
    colors: ['#1a1310', '#c9a96e', '#d4b87e'],
  },
  {
    id: 'espresso',
    name: '浓缩',
    colors: ['#0f0a08', '#d4a574', '#c9a96e'],
  },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useStore()

  return (
    <div>
      <label className="block text-xs font-medium theme-text-dim mb-2">主题</label>
      <div className="flex gap-2">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all
              ${theme === t.id
                ? 'border-theme-accent scale-110 shadow-lg'
                : 'border-theme-border hover:border-theme-primary'
              }`}
          >
            <div className="absolute inset-0 flex">
              {t.colors.map((color, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center
              bg-black/30 text-white py-0.5">
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/components/ThemeSwitcher.tsx
git commit -m "feat(next-app): add ThemeSwitcher with 4 coffee theme swatches"
```

---

### Task 11: SettingsModal Component (API + MCP + Theme + Import/Export)

**Files:**
- Create: `web/next-app/src/components/SettingsModal.tsx`

- [ ] **Step 1: Create SettingsModal.tsx**

Create `web/next-app/src/components/SettingsModal.tsx`:

```tsx
'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/store'
import { PROVIDERS } from '@/lib/providers'
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/system-prompt'
import { ModelSelector } from './ModelSelector'
import { ThemeSwitcher } from './ThemeSwitcher'
import { X, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react'

export function SettingsModal() {
  const { settings, updateSettings, setShowSettings, exportData, importData } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProviderChange = (provider: string) => {
    const p = PROVIDERS[provider]
    if (p) {
      updateSettings({
        provider,
        baseUrl: p.baseUrl,
        model: p.defaultModel,
      })
    }
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barista-chat-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        importData(data)
        alert('导入成功')
      } catch {
        alert('导入失败：数据格式不正确')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowSettings(false)}
      />

      {/* Modal */}
      <div className="relative bg-theme-secondary rounded-2xl shadow-2xl w-[90%] max-w-md max-h-[90vh]
        overflow-y-auto p-6 animate-msg-in">
        <button
          onClick={() => setShowSettings(false)}
          className="absolute top-4 right-4 p-1 hover:bg-theme-hover rounded transition-colors"
        >
          <X className="w-5 h-5 theme-text-dim" />
        </button>

        <h2 className="text-lg font-bold theme-primary mb-5">API 设置</h2>

        {/* Provider */}
        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">API 供应商</label>
          <select
            value={settings.provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          >
            <option value="">— 请选择 —</option>
            {Object.entries(PROVIDERS).map(([key, p]) => (
              <option key={key} value={key}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">API Key</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            placeholder="sk-..."
            className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          <p className="text-xs theme-text-dim mt-1">密钥仅保存在本地浏览器，不会上传</p>
        </div>

        {/* Base URL */}
        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">Base URL</label>
          <input
            type="text"
            value={settings.baseUrl}
            onChange={(e) => updateSettings({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            className="w-full px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
        </div>

        {/* Model */}
        <div className="mb-4">
          <ModelSelector />
        </div>

        {/* Temperature */}
        <div className="mb-4">
          <label className="block text-xs font-medium theme-text-dim mb-1.5">
            温度 <span className="theme-primary font-bold">{settings.temperature}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs theme-text-dim mt-1">越高越有创意，越低越稳定。推荐 0.6-0.8</p>
        </div>

        {/* MCP */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.mcpEnabled}
              onChange={(e) => updateSettings({ mcpEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            启用 MCP 工具（需本地运行 MCP Server）
          </label>
          <input
            type="text"
            value={settings.mcpUrl}
            onChange={(e) => updateSettings({ mcpUrl: e.target.value })}
            placeholder="http://127.0.0.1:8765/mcp"
            className="w-full mt-2 px-3 py-2 bg-theme-chat border border-theme-border rounded-lg
              text-sm outline-none focus:border-theme-accent"
          />
          <p className="text-xs theme-text-dim mt-1">
            启用后顾问可调用 24 个专业工具。用 start.bat / start.sh 一键启动 MCP Server。
          </p>
        </div>

        {/* Theme */}
        <div className="mb-4">
          <ThemeSwitcher />
        </div>

        {/* Advanced: System Prompt */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm theme-accent hover:underline mt-2"
        >
          {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          高级设置（查看/编辑系统提示词）
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <textarea
              value={settings.customPrompt || DEFAULT_SYSTEM_PROMPT}
              onChange={(e) => updateSettings({ customPrompt: e.target.value })}
              className="w-full min-h-[200px] px-3 py-2 bg-theme-chat border border-theme-border
                rounded-lg text-xs font-mono outline-none focus:border-theme-accent resize-y"
            />
            <p className="text-xs theme-text-dim mt-1">修改后保存即生效。留空则使用默认提示词</p>
          </div>
        )}

        {/* Import/Export */}
        <div className="flex gap-2 mt-5 pt-4 border-t border-theme-border">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2
              border border-theme-border rounded-lg text-sm hover:bg-theme-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2
              border border-theme-border rounded-lg text-sm hover:bg-theme-hover transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/src/components/SettingsModal.tsx
git commit -m "feat(next-app): add SettingsModal (API/MCP/theme/advanced/import-export)"
```

---

### Task 12: Build Verification and Documentation

**Files:**
- Modify: `web/next-app/src/app/page.tsx` (fix any build issues)
- Modify: `web/README.md` (update for dual-version)

- [ ] **Step 1: Run typecheck**

Run:
```bash
cd web/next-app && npx tsc --noEmit
```
Expected: Zero errors. If errors exist, fix them before proceeding.

- [ ] **Step 2: Run build**

Run:
```bash
cd web/next-app && npm run build
```
Expected: Build succeeds, `web/next-app/.next/` directory created.

- [ ] **Step 3: Run dev server and manual test**

Run:
```bash
cd web/next-app && npm run dev
```
Expected: Server starts at `http://localhost:3000`. Browser opens to show:
- Sidebar with "新建对话" button
- WelcomeScreen with feature tags
- Settings modal opens when clicking settings icon
- Theme switching works (4 themes)
- Model selector with discover button

- [ ] **Step 4: Update web/README.md**

Copy `web/README.md` to work dir, then update to document dual versions:

Add a new section after "Quick start":

```markdown
### 方式三：Next.js 开发版（完整功能）/ Option C: Next.js dev version (full features)

```bash
cd web/next-app
npm install
npm run dev
```

Open `http://localhost:3000`. Features beyond the single-file version:
- Multi-conversation management (sidebar with create/switch/delete/rename)
- 4 coffee themes (light-roast / pour-over / dark-roast / espresso)
- Local model auto-discovery (fetch `/v1/models`)
- Import/Export chat history and settings
- Full MCP tool integration (same as v4.2 HTML version)
```

Also update the comparison table to add a third column for the Next.js version.

- [ ] **Step 5: Commit all**

```bash
cd C:\Users\ROG\barista-skill
git add web/next-app/ web/README.md
git commit -m "feat(next-app): complete Next.js migration with all components + build verified + docs"
```

- [ ] **Step 6: Push to remote**

```bash
cd C:\Users\ROG\barista-skill
git push origin main
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ Multi-conversation management → Task 4 (store) + Task 6 (Sidebar)
- ✅ Import/Export → Task 4 (store) + Task 11 (SettingsModal)
- ✅ Local model auto-discovery → Task 9 (useLocalModels + ModelSelector)
- ✅ Theme switching → Task 2 (CSS) + Task 10 (ThemeSwitcher)
- ✅ LLM adapter migration → Task 3 (llm-adapter.ts)
- ✅ MCP client migration → Task 3 (mcp-client.ts)
- ✅ System prompt migration → Task 3 (system-prompt.ts)
- ✅ Backward compatible streaming → Task 8 (ChatInput)
- ✅ Build verification → Task 12

**2. Placeholder scan:** No TBD/TODO found. All code is complete.

**3. Type consistency:**
- `Message` interface: `id`, `role`, `content`, `timestamp`, `model?` — consistent across store, ChatMessage, ChatInput
- `Conversation` interface: `id`, `title`, `messages`, `createdAt`, `updatedAt` — consistent across store, Sidebar, ChatArea
- `Settings` interface: all 8 fields consistent across store, SettingsModal, getAdapter
- `Theme` type: `'light-roast' | 'pour-over' | 'dark-roast' | 'espresso'` — consistent across store, ThemeSwitcher, layout
- `getAdapter()` function signature matches usage in ChatInput
- `chatWithMCP()` parameters: `(adapter, messages, mcpUrl, onProgress, signal)` — matches ChatInput call
