# 变更日志

本文件记录 barista 技能的版本变更。版本号遵循 [语义化版本](https://semver.org/)：主版本.次版本.修订号。

---
---
## [6.0.0] - 2026-08-03

### 前端完全重构 v6.0 — Design System Rebuild

UI 根据 taste-skill / impeccable / ui-ux-pro-max 参考资源完全重构：
- 新设计令牌（Light 浅炭 / Dark 深炭），单一 accent（copper/amber），去除 AI-slop
- Instrument Serif editorial + PingFang body + JetBrains Mono keystroke
- 反-AI 规则：无紫蓝渐变 / 无 aurora / 无嵌套卡片 / 尊重 reduced-motion
- calm-hover（+1px 上升），重写 7 核心组件

### SAG-style RAG 实体层 (mcp-server/rag_entities.py)
- 从 data/*.json 抽取咖啡实体（bean/origin/roast/method/flavor）
- query-time 动态超边：共享实体调整 chunk 排序，遵守 ponytail（无新增依赖）
- rag_search 现 pull top_k*3，entity rerank 后截断

### PixelRAG 评估
- 咖啡知识以文本为主，截图管道不饵咈，后期另行跟踪

### 一键启动验证
- start.bat / start.sh 通过；172 tests pass；self_check 26 tools aligned

### mattpocock/skills 参考
- 借鉴 wayfinder / ADR / changeset / out-of-scope 文档结构，强化项目决策痕迹
- 参考其 writing-great-skills SKILL.md 样式优化主 SKILL.md 的 描述/触发/工作流清晰度

## [5.1.0] - 2026-08-02

### 前端设计 v5.1 — Anti-AI-signature 改造
- globals.css v5.1 — 移除 bezel-double / glass-panel / star-border 等 AI 设计指纹
  - 4 个咖啡主题保留（Light Roast / Pour Over / Dark Roast / Espresso），色调微调
  - 单一 shadow system（tinted ambient，去掉纯黑 drop shadow）
  - 简化 typography token：Instrument Serif editorial + JetBrains Mono keystroke
  - 加入 grain texture（0.015-0.03 opacity），radial-gradient aurora 背景
- WelcomeScreen 重写为单列居中 editorial hero
- Sidebar 简化为可折叠浮层，去掉 bezel-shell
- SettingsModal / ChatInput / ChatArea / ChatMessage / 卡片 清除 bezel-* / glass-* class 引用
- 修复 ChatInput.tsx 输入框截断 bug（到目前为止的声明）
- Next.js build 通过（TypeScript 0 error）
- self_check.py 正则修复：26 工具对齐通过
- 175 个 pytest 单元测试全部通过
---
## [5.0.0] - 2026-08-02

### 重大重构
- **版本飞跃至 5.0.0**：反映项目从 v4 系列到完全重写的架构级跃迁
- **前端设计系统重构**（详见 v4.7.0 / v4.7.1 / v4.8.0）：
  - Double-Bezel 嵌套外壳、Editorial 字体层级（Instrument Serif + JetBrains Mono）
  - 弹簧物理微交互、电影颗粒覆盖层、Aurora Glow、Glass Panel
  - 4 个咖啡主题（浅烘/手冲/深烘/浓缩）oklch 色板
- **RAG 搜索引擎增强**（借鉴 SAG 架构）：_strip_query_noise 噪声过滤、hybrid retrieval（语义 0.6 + 词法 0.4）
- **API 供应商扩展**：从 8 家扩至 16 家（新增 Gemini / Mistral / Grok / MiniMax / 混元 / SiliconFlow / OpenRouter / 百川）
- **一键启动优化**：start.bat 从打开旧 HTML 改为 Next.js dev server；自动检测 Node/Python/npm 依赖
- **全栈验证**：tsc --noEmit 零错；next build 编译成功；self_check ALL PASSED；pytest 159 passed

---
## [4.8.0] - 2026-08-02

### 新增（RAG 增强 + API 供应商扩充）
- **RAG 查询噪声过滤**：借鉴 SAG 检索服务思路，新增 _strip_query_noise 函数；自动剥离用户查询中的低信号短语（知识库、帮我查、tell me 等），提升 embedding 检索精度
- **API 供应商扩充**：从 8 家增至 16 家 —— 新增 Google Gemini、Mistral AI、xAI Grok、MiniMax、腾讯混元、硅基流动 (SiliconFlow)、OpenRouter、百川 (Baichuan)
- **一键启动优化**：start.bat 从打开旧 HTML 改为自动检查 Node/npm deps + 启动 Next.js dev server + 打开浏览器；支持 Windows & Unix
- **版本同步**：5 源同步至 4.8.0

---
## [4.7.1] - 2026-08-01

### 优化（前端增量迭代）
- **bezel-double 统一**：SettingsModal 改用 bezel-double 嵌套外壳；rounded-xl 统一替换残留 rounded-lg
- **精简 SettingsModal**：从 326 行精简至 140 行，移除冗余注释、压缩 JSX 布局
- **UI 文本英文化**：SettingsModal 标签/placeholder/alert 统一英文，Sidebar/WelcomeScreen 保留中文
- **CSS 注释重写**：globals.css 加入 Editorial Luxury/Soft Structuralism 设计哲学注释
- **版本同步**：5 源同步至 4.7.1；验证：tsc --noEmit 零错；next build Compile成功；pytest 175 passed

---
## [Web 本地版 web-v1.0.0] - 2026-07-27

### 新增（方案 B 本地版 / Barista.exe）
- **两种方案架构**：仓库同时支持「方案 A · Skill 模式」（放入 Agent 技能目录，模型由 Agent 提供）与「方案 B · 本地独立版」（`Barista.exe` / Next.js，用户自填模型 API）。详见 README「两种方案」章节。
- **AnySearch 联网搜索**：内置 [AnySearch](https://www.anysearch.com/docs) 联网搜索，设置可填自己的 API Key（留空走匿名免费额度），顾问在回答前自动拼接实时资料上下文（失败优雅降级）。
- **MCP 自动启动**：运行 `Barista.exe` 自动拉起本地 MCP Server（24 工具），无需手动配置。
- **设置持久化**：模型 API、MCP 开关、联网搜索开关键均存浏览器 localStorage。
- 校验：`next build` 静态导出 + PyInstaller 单文件 exe（约 8 MB），启动 HTTP 200、MCP 24 工具、`/__quit` 整树退出无残留。

> 方案 A（Skill）版本仍为 4.4.2，本条目仅记录 Web 本地版发布，二者共享同一套知识库与 MCP 工具。

## [4.7.0] - 2026-07-31

### 新增（前端 Premium 设计系统重构）
- **Web 本地版 UI 重设计（web-v1.1.0 轨）**：借鉴 taste-skill 的"Editorial Luxury × Soft Structuralism"语汇，为方案 B 本地应用（Barista.exe / Next.js）铺一层 premium token，回应用户"要更有高级感"的诉求。
  - **Double-Bezel 嵌套外壳**：新增 `bezel-shell` / `bezel-shell-sm` / `bezel-core` 三层结构件，用于侧栏按钮、欢迎页 CTA、聊天输入框、设置弹窗、消息气泡；视觉上像一体切削而非堆叠卡片。
  - **Editorial 字体层级**：标题用 `font-editorial`（Instrument Serif 字族）+ `eyebrow` 小字签；技术读数/温度/配置状态用 `font-keystroke`（JetBrains Mono）；移除 Inter，系统字栈兜底。
  - **弹簧物理微交互**：`press-physics` 按下缩放回弹、`ease-spring` / `ease-editorial` 缓动曲线；`animate-entry` / `animate-stagger` 配合 CSS keyframes 做滚动入场（无 JS / 无 Framer Motion）。
  - **电影颗粒覆盖层**：`body::after` 极低透明度（0.022-0.03）SVG 噪点固定层，`pointer-events: none`，4 主题各有独立 `--grain-opacity`。
  - **消息头像去 emoji**：聊天头像由咖啡 emoji 改为 U/C/! 双层嵌套 monogram 圈，侧栏 Logo 改 `font-editorial` Barista 字标 + beta 标签。
- **零新依赖、零行为回归**：纯 CSS/Tailwind 原生类；4 个咖啡主题（浅烘/手冲/深烘/浓缩）全部保留，premium token 叠加在既有调色板上而非替换；方案 A（Skill 模式）与方案 B（exe）知识库 / 25 个 MCP 工具 / 数据文件完全未触碰。
- **验证**：tsc --noEmit 零错；next build 编译成功；Chrome headless 截图渲染正常；self_check.py 5 源 4.7.0 同步 ALL CHECKS PASSED；pytest 175 passed。

> 本次为前端仅改动，主版本号 4.6.1 -> 4.7.0 反映设计系统级新特性；Web 本地版内部版本 web-v1.1.0（package.json 维持 1.0.0，exe 构建未重打）。

## [4.6.1] - 2026-07-31

### 补充（专业级学习与社区来源扩充）
- **`learning_resources.json` professional 级扩充**：从 4 条（仅官方/工具）增至 9 条，补上中文社区实战来源（咖啡沙龙论坛 / HackCoffeeStudio 公众号 / CafeCulture 啡言食语 / 知乎 SCA·Q-Grader 话题 / B站咖啡学习区）。对齐 v3.0 计划“大幅扩展 professional 级别，新增公众号/论坛等实战来源”的残留缺口。代码逻辑零改动。
- **`sca_official_sources.json` community_curated 扩充**：从 5 条增至 10 条，新增知乎/B站/CafeCulture/HackCoffeeStudio/咖啡沙龙论坛五条已验证中文来源；保留原有单行紧凑格式与 CRLF 行尾。
- 诚实边界：未捏造小红书 note_id / xsec_token（手头无经验证的真实笔记 ID，避免违反“禁止编造”铁律），仅收录有公开 URL 的平台频道。
- 验证：`self_check.py` ALL CHECKS PASSED；`pytest` 157 passed（2 rag 测试需模型未本地安装，按惯例 deselected）。

## [4.6.0] - 2026-07-29

### 新增（RAG 语义检索）
- **`rag_search` 混合语义检索 MCP 工具**：`query → keyword (CJK 2-gram) score + cosine(384-D sentence-transformers embedding) weighted fusion (0.6 : 0.4) → top-k`。本地运行、零网络查询：`paraphrase-multilingual-MiniLM-L12-v2`（384 维多语言嵌入）一次性下载后离线缓存，后续每次查询都从本地读权重。
- **可重启索引**：`scripts/build_rag_index.py` 把 `references/*.md`（zh + en，共 45 篇）按 markdown 头部 + 段落切成 ~800 字带 ~120 字重叠的 583 个 chunk，逐段嵌入并归一化存为 `data/rag_index.pkl`。新增豆子/特调/参考文档后跑一次脚本即可刷新索引。索引文件已 `.gitignore`，每位用户本地构建（已验证：62 秒完成 583 chunks）。
- **优雅降级**：`rag_search` 当 `sentence-transformers` 未安装、或 `data/rag_index.pkl` 不存在时，自动回退到现有 `search_references` 关键词检索。SKILL.md 工具数同步升级 24 → 25。
- **嵌入模型离线加载**：rag_index.py 检测到本地 HF 缓存时自动设 `HF_HUB_OFFLINE=1 / TRANSFORMERS_OFFLINE=1`，跳过 huggingface_hub 在中国网络上间歇性 SSL / httpx "client has been closed" 失败的"是否有更新版本"网络检查；首装用户照常下载（已验证本地 hf-mirror.com 镜像 62 秒拿到权重）。
- **依赖处理**：`mcp-server/pyproject.toml` 新增 `rag` 可选 extras：`pip install "./mcp-server[rag]"`；wheel `only-include` 加入 `rag_index.py`。
- **架构借鉴**：从 `awesome-llm-apps/rag_tutorials/{local_hybrid_search_rag, corrective_rag, autonomous_rag}` 抽取三范式（可重启索引、关键词+语义融合、优雅降级），但拒绝其 torch + llama-cpp + spacy + Qdrant 的重型栈，仅保留 sentence-transformers + 本地 pickle。
- 验证：本地 `tsc --noEmit` 零错；前端解析冒烟 37 通过；`pytest` 175 passed（新增 2 条 rag_search 测试）；`self_check.py` ALL CHECKS PASSED，5 源版本 = 4.6.0；RAG 端到端实测（5 个语义查询 × top-3）全部命中相关咖啡文档。

## [4.5.1] - 2026-07-29

### 修复（CI 门禁 / 依赖上限）
- **修复 CI 自检红**：`mcp 2.0.0` 当日发布，`mcp.server.fastmcp` 子模块被重构移除（已验证：1.29.0 仍在、2.0.0 移走），而项目依赖 `mcp[cli]>=1.8.0` 无上限，CI 重新解析时拉到 2.0.0，`server.py` 的 `from mcp.server.fastmcp import FastMCP` 在自检时 `ModuleNotFoundError`，`self_check` 在版本同步校验之前就崩了。改为 `mcp[cli]>=1.8.0,<2.0` 封住未经验证的大版本，CI 回退解析到 1.29.x，导入与自检恢复。代码逻辑零改动。
- 验证：本地 `mcp` 1.28.1 下 `self_check.py` ALL CHECKS PASSED、`pytest` 173 passed、5 源版本同步 = 4.5.1。

## [4.5.0] - 2026-07-28

### 新增（工具可视化 + 中文混合检索）
- **生成式 UI 工具卡片（方案 B Web 端）**：`calculate_cupping_score` / `calculate_cva_score` / `get_triangle_protocol` / `get_qgrader_study_plan` 四个结构化工具的结果不再只以纯文本呈现，自动渲染为可视化卡片——杯测 10 维评分条 + 等级徽章、CVA 情感分/旧百平方对照进度条、三角杯测轮数·杯数·通过线网格、Q-Grader 备考阶段时间线。前端 MCP 客户端拦截工具原始返回，专用解析器转成结构化卡片数据，与模型对话流解耦、对模型上下文零负担（解析失败仍回退 Markdown）。
- **`search_references` 中文 2-gram 混合检索**：旧实现 `query.lower().split()` 只按空格切分，中文长查询（如「柠檬酸的风味」）整段当作单一 token，几乎从不命中；且只搜文档前 2000 字符，正文后半不可达。改为零依赖的中英混合分词（英文按词、中文取相邻 2 字 bigram）+ 全文 count 打分 + 标题加权 + 去重。中文长查询命中率显著提升，英文检索行为保持不变。
- **验证**：前端 `tsc --noEmit` 零错（已纳入 CI `web-typecheck` 并行任务）；前端解析器对 `server.py` 真实输出的冒烟测试 37 通过（4 工具 × 中英双语，关键字段精确断言）；新增 3 条中文 2-gram 回归测试，`pytest` 173 passed；`self_check.py` ALL CHECKS PASSED。

## [4.4.2] - 2026-07-26

### 修复（pip 安装 / CI 包装）
- **修复 `pip install ./mcp-server` 构建失败**：hatchling 无法确定 wheel 内文件。改为 `[tool.hatch.build.targets.wheel] only-include = ["server.py"]` 并显式 `force-include` 整个 `../data` 目录到 wheel。
- **修复安装后运行时数据加载**：`server.py` 的 `_load_data` 现在同时支持源码树布局（`repo_root/data/`）和安装后的 wheel 布局（`data/` 与 `server.py` 同级），安装包可正确读取 `version.json` 与全部数据文件。

## [4.4.1] - 2026-07-26

### 修复（门禁根治 + 同步）
- **根治 `test_no_dead_imports` 误报**：原测试用子串匹配 `"import sys"` 误判 `_run_http` 函数内合法导入，导致发布版 `origin/main` 门禁变红（误报型回归）。改为 AST 仅检查**模块级**未使用导入，函数内导入不再误伤。
- **还原 `server.py` `_run_http` 缺依赖守卫**：恢复为干净的 3 行 stderr 提示（`import sys` + 3×`print(..., file=sys.stderr)`），不再需要 workaround。
- **合并分叉**：本地未推送的 `817545b` 与远端 `fea6f6d`（web SSE 解析修复）已对齐，工作副本与 `origin/main` 完全一致。
- **新增 CI**：`.github/workflows/test.yml` 在 push/PR 到 main 时自动跑 `self_check.py` + `pytest`，防止门禁再悄悄变红。
- 验证：self_check.py ALL CHECKS PASSED；pytest 170 passed（`test_no_dead_imports` 已修复）。

---
## [4.4.0] - 2026-07-27

### 新增（动态模型发现）
- **供应商上游模型获取** — Next.js 版和 HTML 版均新增「获取模型」按钮，可直接从供应商 API `/models` 端点拉取可用模型列表：
  - **`providers.ts`** 新增 `fetchModels()` 函数，支持 OpenAI 兼容格式（Bearer 认证）和 Anthropic 原生格式（x-api-key + anthropic-version 头）。
  - **`useLocalModels` Hook** 重构为通用模型发现，不再局限于 Ollama，支持所有供应商。
  - **`ModelSelector` 组件** 新增「获取模型」按钮，获取成功后展示实际可用模型列表，支持点击切换。
  - **`barista-chat.html`** 同步新增 `fetchModelsFromAPI()` 函数、「获取模型」按钮、CSS 样式，切换供应商时自动重置已发现模型。
- **模型列表更新** — 所有供应商默认模型列表更新至 2026 最新版本：
  - OpenAI: gpt-5.4 / gpt-5.4-mini / gpt-4o / gpt-4o-mini
  - Anthropic: claude-sonnet-4-5 / claude-opus-4-5 / claude-haiku-4-5
  - DeepSeek: deepseek-v4-flash / deepseek-v4-pro
  - 通义千问: qwen3.7-max / qwen3.7-plus / qwen3.7-flash
  - Kimi: kimi-k2-turbo / kimi-k2-thinking / moonshot-v1-128k
  - 智谱 GLM: glm-5 / glm-4-plus / glm-4-flash / glm-4-air
  - Ollama: llama3.3 / qwen3 / gemma3 / phi4

### 验证
- TypeScript 类型检查通过（`npx tsc --noEmit`，零错误）
- Next.js 生产构建通过（`npm run build`，零错误）
---
## [4.3.0] - 2026-07-26

### 新增（Next.js 全功能版）
- **`web/next-app/`** — Next.js 14 + TypeScript + Tailwind CSS + Zustand 全功能咖啡顾问应用：
  - **多对话管理**：侧边栏支持创建/切换/删除/重命名对话，首条用户消息自动生成对话标题，Zustand persist 中间件自动持久化到 localStorage。
  - **4 种咖啡主题**：浅烘 (light-roast) / 手冲 (pour-over) / 深烘 (dark-roast) / 浓缩 (espresso)，CSS 变量驱动，实时切换。
  - **本地模型自动发现**：`useLocalModels` Hook 通过 fetch `/v1/models` 自动发现 Ollama / LM Studio / vLLM 可用模型，支持连接测试。
  - **导入/导出**：对话历史和设置可导出为 JSON 文件，导入恢复，方便备份和迁移。
  - **完整 MCP 集成**：与 HTML 版相同的 MCP 工具调用循环（`chatWithMCP`），支持 24 个专业工具。
  - **组件化架构**：8 个 React 组件（Sidebar / ChatArea / ChatMessage / ChatInput / WelcomeScreen / SettingsModal / ModelSelector / ThemeSwitcher），TypeScript 类型安全。
  - **LLM 适配层迁移**：`llm-adapter.ts` + `mcp-client.ts` + `providers.ts` + `system-prompt.ts` 从 HTML 版迁移为 TypeScript 模块。
- **`docs/superpowers/specs/2026-07-26-nextjs-migration-design.md`** — 迁移设计文档。
- **`docs/superpowers/plans/2026-07-26-nextjs-migration-plan.md`** — 12 任务实现计划。

### 保留
- `web/barista-chat.html` 单文件 HTML 版保留为零依赖轻量版，行为与 v4.2.0 一致。

### 验证
- TypeScript 类型检查通过（`npx tsc --noEmit`，零错误）
- Next.js 生产构建通过（`npm run build`，零错误）
- 构建产物：首页 53.5 kB，First Load JS 141 kB

---
## [4.2.0] - 2026-07-26

### 新增（一键启动 + HTML ↔ MCP 联动）
- **一键启动脚本 `start.bat` / `start.sh`** — 双击即可完成"检查 Python → 安装依赖 → 启动 MCP Server (HTTP) → 打开浏览器"全流程，零手动配置：
  - 自动检测 `py.exe` / `python3` / `python`，缺 `mcp` / `starlette` / `uvicorn` 时自动安装。
  - 后台启动 MCP Server（`--transport http --host 127.0.0.1 --port 8765`），轮询等待就绪后自动打开 `web/barista-chat.html`。
- **MCP Server 新增 HTTP 传输模式**（`server.py --transport http`）：
  - 基于 FastMCP `streamable_http_app()` + Starlette CORS 中间件，浏览器可直接 `fetch` 调用 `tools/list` 与 `tools/call`。
  - `stateless_http=True` 免除 MCP session-id 握手，浏览器无需维护会话状态。
  - 保留原 `stdio` 传输（默认），Claude Desktop / Cursor / TRAE 等 MCP 客户端零影响。
- **HTML 版新增 MCP 工具调用**（`web/barista-chat.html`）：
  - 设置面板新增「启用 MCP 工具」开关 + MCP Server 地址输入框（默认 `http://127.0.0.1:8765/mcp`）。
  - 内置 `MCPClient` 类：JSON-RPC over HTTP，缓存 `tools/list` 结果，将 MCP 工具 schema 转为 OpenAI function-calling 格式。
  - `chatWithMCP()` 函数调用循环：LLM → tool_calls → 执行 MCP 工具 → 结果回传 → LLM 再思考，最多 8 轮，实时显示「🔧 调用工具: xxx」状态。
  - 启用 MCP 后顾问可调用全部 24 个专业工具（冲煮参数 / 故障诊断 / 杯测评分 / 研磨校准等），数据源从静态提示词升级为 28 个 JSON 动态查询。
  - 向后兼容：未启用 MCP 时走原流式路径，行为与 v4.1.0 完全一致；Anthropic Claude 自动回退流式模式（暂不支持工具调用）。
- **`pyproject.toml`** 新增 `[http]` optional dependencies（`starlette` + `uvicorn`），`mcp` 最低版本提升至 `1.8.0`。

### 验证
- Python 语法检查通过（`py_compile`）
- JavaScript 语法检查通过（`new Function()` 构造成功）
- MCP Server stdio 模式向后兼容（默认传输不变）
- HTML 未启用 MCP 时行为与 v4.1.0 一致（流式 + 可中断 + 本地持久化）

---
## [4.1.0] - 2026-07-26

### 新增（本地 HTML 版）
- **`web/barista-chat.html`** — 纯浏览器、零后端的本地咖啡顾问单文件应用（约 41 KB）：
  - **通用 API 适配层**：支持 OpenAI / Anthropic Claude / DeepSeek / 通义千问 / Kimi / 智谱 GLM / Ollama（本地）/ 任意 OpenAI 兼容端点，用户自选供应商并接入自己的 API Key。
  - **内嵌完整系统提示词**：14 种冲煮法起步参数 + 11 款经典奶咖比例 + 故障排查决策树 + 新手禁用术语表 + 说人话铁律 + 三档自适应（新手/进阶/资深）+ 每轮必加"你可能接着想问"。
  - **流式响应 + 可中断**：实时打字效果，流式过程中发送按钮变红色"停止"，点击中断并保留已生成内容。
  - **本地持久化**：API 配置与对话历史仅存于浏览器 `localStorage`，不上传任何服务器；Ollama 无需 API Key。
  - **咖啡主题 UI**：响应式设计，支持 Markdown 渲染（代码块/加粗/斜体）。
- **`web/README.md`** — 本地 HTML 版使用说明、隐私声明、与 MCP Server 的能力对比表。

### 修复（HTML 文件 5 项 bug）
- `fetch` body 未 `JSON.stringify` 导致 400 错误（OpenAI + Anthropic 两处）
- 流式过程无停止按钮，用户无法中断
- 中断后保存的是"（已停止）"占位文本而非已生成内容
- Ollama 无需 API Key 却被强制要求
- 错误消息 avatar 显示用户头像而非警告图标

### 验证
- Node.js 语法检查通过（`new Function()` 构造成功）
- HTML 结构完整（DOCTYPE + 标签平衡）
- DOM ID 交叉引用全部匹配（24 个 JS 引用 / 25 个 HTML 定义）
- 8 个事件监听器绑定正确
- 系统提示词 6 大章节齐全 + 14 种冲煮法全覆盖



## [4.0.1] - 2026-07-26  (文档：补译 en 镜像债 — 7 篇 references 全镜像)

### Changed
- 补齐英文镜像：将 `brewing-coach-protocol` / `sca-certification` / `qgrader-complete-guide` / `sca-new-cva-guide` / `green-coffee-evaluation` / `triangle-test-protocol` / `coffee-sensory-chemistry` 七篇 references 翻译为 `references/en/` 镜像，并从 `allowed_mono` 豁免清单移除；剩余 5 篇 mono（eval-cases / example-dialogues / glossary / search-queries / human-voice-rules）保持中文原版。
- `references/en/README.md` 刷新为 20 / 25；`SKILL.md` 英文镜像说明同步为 21 of 25。

### Notes
- 纯文档改动，不涉及 MCP 工具、data 结构或运行时行为；版本号仅作发布标记。

## [4.0.0] - 2026-07-26  (闭环教练 + 风味辨识 — 合并原路线图 v3.1→v3.4 为大版本)

### Added
- **闭环教练（closed-loop coach）**：新增 4 个工具，把 A 给参数 → B 救风味 → 记录 → 再调 串成可迭代私人陪练回路（工具数 20 → 24）：
  - `identify_flavor` — 风味辨识引导树：模糊抱怨（"尖酸刺舌"/"木头味"）定位到具体子类 + 根因 + 新手/进阶调整建议。
  - `start_brew_session` — 开会话骨架（符合 `data/brew_session_schema.json`），给出 next_action 指针。
  - `log_brew_result` — 记录一轮参数/自评/反馈，按自评给出下一步指针（诊断 or 调参）。
  - `next_step` — 据问题/目标给下一轮调参维度（grind/temp/time/ratio/dose 增减）+ 单变量铁律。
- **风味辨识引导树**（`data/flavor_identification_tree.json`，6 大家族 / 19 叶子）；`diagnose_flavor` 新增 `guided` 模式做识别引导。
- **覆盖度扩展**：产区 +6（`data/parameters_origin.json` 6→12）、处理法 +2（`data/parameters_process.json` 4→6）、风味诊断 +4（`data/flavor_diagnosis.json` 8→12，新增 woody/rubber/over_fermented/medicinal）；新增器具画像 `data/equipment_profiles.json`（手冲壶/法压/爱乐压/摩卡壶）。
- **特调拓展**：连锁门店招牌框架 + 无咖啡因饮品框架（`data/craft_chains_and_caffeine_free.json`，不编造链接）；`references/craft-coffee.md` 新增第十一/十二节。
- **协议文档**：`references/brewing-coach-protocol.md` 定义闭环各节点调用约定与宿主职责红线（mono-lingual，登记 allowed_mono）。

### Changed
- `get_recipe` / `get_parameters_guide` 新增可选 `user_context`，按器具/口味个性化输出；`diagnose_flavor` 新增 `guided` 模式。
- 闭环采用"宿主持有状态、工具消费上下文"混合架构；`data/user_profile_schema.json` / `data/brew_session_schema.json` 为契约文档（server.py 不加载）。
- `README.md` / `mcp-server/README.md` 工具表与徽章同步到 24 工具。

### Fixed
- 修复 v4.0 实现中 `user_context`/`guided` 参数插入位置导致既有调用方位置错乱；修正 `next_step` / `log_brew_result` 中英双语标签倒置（L(zh,en) 调用与 L(en,zh) 定义不一致）。

## [3.0.0] - 2026-07-26  (SCA / Q-Grader 深度扩展 — 认证体系 + 考试体系作为一级模块)

### Added
- **SCA / Q-Grader 一级模块**：把 SCA 认证体系与 Q-Grader 考试体系深度嵌入，新增 8 个 data JSON + 6 篇 references + 9 个 MCP 工具（工具数 11 → 20）。
- 8 个数据文件：
  - `data/sca_certification.json` — SCA Coffee Skills Program 六大模块（Introduction / Barista / Brewing / Green Coffee / Roasting / Sensory，各分 Foundation / Intermediate / Professional 三级）课程树；Q-Grader 认证作为独立并列块（非 CSP 模块）。
  - `data/sca_cva.json` — SCA 新 CVA 评分体系四表（SCA-102 Sample Preparation / 103 Descriptive / 104 Affective 1-9 分制 / 105 Extrinsic）+ 1-9 → 旧 100 分制换算。
  - `data/qgrader_exams.json` — Q-Grader 8 大类（综合知识 / 感官味觉 / 嗅觉闻香瓶 / 杯测 / 三角杯测 / 有机酸配对 / 生豆分级 / 熟豆辨认）逐单元考试，标注 20-22 项口径差异 + Evolved Q 变化。
  - `data/qgrader_study_resources.json` — 分项备考资料索引（官方 + 社区入口级）。
  - `data/green_coffee_grading.json` — 生豆分级（SCA 筛网 + SPE 物理分级 + 粒径 + 含水率）。
  - `data/defect_beans.json` — 瑕疵豆一级 / 二级分类 + SCA 扣分体系。
  - `data/coffee_chemistry_sensory.json` — 咖啡化学与感官映射（酸类 / 糖类 / 酚类 / 烘焙反应）。
  - `data/sca_official_sources.json` — 已验证官方 / 社区来源索引。
- 6 篇参考文档（先中文，登记 en 镜像豁免）：`references/sca-certification.md` / `qgrader-complete-guide.md` / `sca-new-cva-guide.md` / `green-coffee-evaluation.md` / `triangle-test-protocol.md` / `coffee-sensory-chemistry.md`。
- 9 个 MCP 工具：`get_sca_path` / `get_sca_course` / `get_qgrader_exam` / `get_qgrader_study_plan` / `get_green_grade` / `get_defect_bean` / `calculate_cva_score` / `get_triangle_protocol` / `search_sca_sources`。

### Changed
- `SKILL.md` 触发关键词已含 SCA / Q-Grader / 认证 / 考试 / 杯测 / 生豆分级 / CVA / 瑕疵豆 / 三角杯测，新增考试顾问模式指引；参考资料清单 +6。
- `data/learning_resources.json` 扩展 professional 级别；`references/learning-resources.md` 专业级章节重写。
- `mcp-server/README.md` 与 `README.md` 工具表 / 徽章同步到 20 工具 / 23 篇 references。

### Fixed
- 修复 4 处现存不一致：SKILL.md version 漂移（2.9.0 → 3.0.0）、`data/online_craft_recipes.json` 未注册进 KNOWN_DATA_FILES、工具计数文案滞后（10 / 11 工具）、CHANGELOG 重复 [2.9.0] → [2.8.1]。

### Notes
- 版本号与来源采集事实均按 SCA / CQI 官方核实修正（CVA 四表官方译名、1-9 分制而非 1-100、Q-Grader 非 CSP 模块、考试 8 大类口径差异）。
- 6 篇新 reference 先发布中文版，英文镜像（en/）于后续版本补齐并解除豁免。

---

## [2.10.1] - 2026-07-22  (hotfix: 恢复 SKILL.md 正确 UTF-8 + 指向文字版特调清单)

### Fixed
- **修复 SKILL.md 全文乱码**：v2.10.0 的版本同步提交误将 SKILL.md 整体以 GBK 解码再以 UTF-8 重编码，导致全文中文变为 mojibake（并混入 BOM）。本次从 v2.10.0 前的干净版本恢复，行尾维持 CRLF、无 BOM，与仓库其他文档保持一致；版本号同步更新到 2.10.1。

### Added
- **SKILL.md 指向文字版特调清单**：特调「门店/博主索引」一节新增 `data/online_craft_recipes.json` 检索入口（小红书图文/文字版特调笔记，链接标注，非本仓库转录）。
- `data/online_craft_recipes.json` 顶部新增 `xsec_expiry` 说明：小红书 `xsec_token` 有时效，链接过期可用 `note_id` 在小红书搜索栏直接查找。

### Changed
- `references/craft-coffee.md` 吉米条目补充：自 v2.10 起本仓库不再收录吉米视频的字幕 ASR 转录配方（转录成本高且非作者原意）；文字版特调请见 `data/online_craft_recipes.json`。

---

## [2.10.0] - 2026-07-21  (特调改为文字版联网标注 / Craft → text-only online index)

### Changed
- **特调配方改为纯文字版**：废弃吉米视频 ASR 数据集（转录成本高，且原作者仅发视频、不写文字配方）。特调只收录文字 / 图文版——优先门店与知名博主的公开文字配方 / SOP。
- 新增 `data/online_craft_recipes.json`：12 条来自小红书搜索、出自门店 / 知名博主且带完整配方的**文字 / 图文笔记**标注（`note_id` / `title` / `author` / `type` / `url` / `xsec_token` + `_meta` 来源/原则/归因）。视频类笔记已剔除。
- README「博主特调数据集（ASR 转写）」专章改写为「博主特调联网标注清单（文字版）」；版本徽章 2.9.0 → 2.10.0；`data/` JSON 计数 18 → 14。

### Removed
- `data/jimmy_craft_recipes.json` / `jimmy_transcripts.json` / `jimmy_craft_recipes.schema.json` / `jimmy_craft_recipes.example_import.json` / `jimmy_sync_config.example.json`
- `scripts/sync_jimmy_recipes.py`、`.github/workflows/sync-jimmy-recipes.yml`、`docs/jimmy-recipe-sync.md`
- 同步框架与 `MACHINE_TRANSCRIBED` 出处标记相关逻辑。

### Notes
- 本清单仅为公开笔记**链接标注**（非本仓库转录内容），配方以原作者当下发布为准，需联网核实；请在小红书关注并支持原作者。

---

## [2.9.0] - 2026-07-21  (API breaking: diagnose_flavor + calibrate_grinder 转 JSON)

### Added
- 新增 `get_recipe` / `get_milk_drink` / `get_craft_recipe` JSON 已存在于 v2.8 中。

### Breaking Changes
- **`diagnose_flavor` 返回值切换 JSON**: 不再返 `## 诊断表`，改 `{"problem":...,"symptoms":...,"root_cause":...,"beginner_fix":"...",...}` 各位字段。
- **`calibrate_grinder` 返回值切换 JSON**: 不再返 `## 校准表`，改 `{"grinder_model":...,"recommended_settings":...,"zero_steps":...,"principle":...,...}` 各位字段。
- 两者均含 `"verify"` 字段（单变量铁律替换旧尾句）。
- 版本号 2.8.0 → 2.9.0。

### Changed
- 测试断言 acc: `calibrate_grinder_all` 检查 `startswith("{")` + `"recommended_settings"` 字段名。pytest 121 passed；self_check ALL PASSED。

---

## [2.8.1] - 2026-07-20  (博主特调 ASR 数据集 / Blogger craft-coffee ASR dataset)

### Added
- **`data/jimmy_craft_recipes.json`** — 25 条判为 craft 配方的结构化数据。`recipe_id` / `drink_name` / `source_video`（含**出处链接**）/ `ingredients` / `steps` / `ratio`。`ingredients` 由 Whisper 转写稿启发式抽取（真实出现的 数字+单位+名词），**未人工核实**，`provenance = MACHINE_TRANSCRIBED`。
- **`data/jimmy_transcripts.json`** — 42 条视频的 Whisper **逐字转写**（含 `listUrl` 出处链接），作为权威来源；结构化字段与之冲突时以 verbatim 为准。
- **`data/jimmy_craft_recipes.schema.json`** — 数据集 JSON Schema（`additionalProperties: false`），新增诚实出处标记 `MACHINE_TRANSCRIBED` 与 `verbatim_transcript` / `transcript_meta` 字段。
- **`data/jimmy_craft_recipes.example_import.json`** — 已核实导入示例（演示 `VERIFIED_USER_IMPORT` 用法）。
- **`data/jimmy_sync_config.example.json`** — 同步配置示例。
- **`scripts/sync_jimmy_recipes.py`** — 同步框架脚本（**明确拒绝编造配方**，仅接受已核实导入 / 示例）。
- **`.github/workflows/sync-jimmy-recipes.yml`** — 定时拉取骨架（需仓库配置 `XHS_SESSION_COOKIE` / `XHS_USER_ID` Secrets 后启用）。
- **`docs/jimmy-recipe-sync.md`** — 同步机制说明。
- **README / CHANGELOG** — 新增「博主特调数据集（ASR 转写）」专章，版本徽章 2.8.0 → 2.9.0。

### Changed
- `data/` 数据文件 13 → 18 个（新增吉米数据集 5 个文件）。

### 数据来源与声明 / Provenance & disclaimer
- 来源博主：小红书「吉米-咖啡届直男」(Jim950707)。其特调**只在视频里、不写文字配方**（见 `references/craft-coffee.md` 第 149 行），本数据集以 Whisper ASR 补此缺口。
- 数据集为**机转、未人工核实**，可能存在 ASR 误差（原料名/用量识别偏差）。**使用前务必人工校验**；`verbatim_transcript` 为权威来源。
- 所有配方版权归原作者吉米所有，本仓库仅作学习索引与归因。引用时请注明出处并支持原博主。

---

## [2.8.0] - 2026-07-20  (API breaking: 说人话改写层 / human-voice rewrite layer)

### Added
- **`references/human-voice-rules.md`**：7 条说人话改写铁律、档位分级口语化、内部 5 列事实表（工作草稿，不外显）、末尾预判问题 3-5 个、3 个对比示例。
- **`AGENTS.md`**：subagent 契约定义 3b (改写) 和 3c (预判问题) 两步可由 luna subagent 并行、含任务卡模板。
- **SKILL.md 步骤 3.5**：3a 抽事实 / 3b 人话改写 / 3c 末尾预判问题 三管线。
- **`references/example-dialogues.md`** 8 段范例每段末尾补 3 个预判问题。
- `references/craft-coffee.md` 吉米条目扩至 Q-Grader / 视频形式 / 星运舍咖啡 / 分身账号（2026-07 核实）。

### Breaking Changes
- **`get_recipe` / `get_milk_drink` / `get_craft_recipe` 返回值从 markdown 表格切换为 JSON 对象**。下游脚本需 `json.loads()` 适配。其余 8 个工具返回不变。
- 版本号 bump 2.7.0 → 2.8.0（5 源同步）。

### Changed
- 三工具 JSON 含 "verify" 字段（替代旧联网核实尾句），"mantra" 字段嵌入单词不单列块。
- 测试断言从 check ## 表格 → check JSON 字段名（dose / espresso / base_spec）。pytest 137 passed；self_check ALL PASSED。

### Fixed
- self_check.py + test_data_consistency.py ALLOWED_MONO 追加 human-voice-rules.md。

## [2.7.0] - 2026-07-17  (P1 ???????? + ???? + search_references ??)

### ?? / Added
- **`scripts/self_check.py`**??????????????5 ?? 33 ???????10 ????? / 12 data/*.json ?? / 5 ????? / references ?? mirror / 13 ? _load_data ?????? / 4 ???? ?5 placeholder / SKILL.md ?? templates??rc=0 ???? `test_self_check_script_passes` ???????????
- **`references/report_templates/` ??????**?4 + README??`recipe_card.md` / `diagnosis_sheet.md` / `cupping_scorecard.md` / `grinder_calibration.md`??? audit skill?????? LLM ?????????????????????? `{{placeholder}}` ???????????????????????????? + ???????? + ??????????
- **? 11 ? MCP ?? `search_references`**?? `references/` 31 ??? md ? fnmatch+body ?????????? top_k ??? + ????? MCP ??????????????????? token??????2026-07-17 ???????/?????????????? 5 ??????

### ?? / Changed
- `SKILL.md`????? `10 tools` -> `11 tools`??? `## ???? / Report templates` ????? `references/report_templates/`??
- `mcp-server/server.py` ?? docstring?`9 tools cover...` -> `11 tools cover ... reference search, ...`??? `search_references` ?????96 ???
- `mcp-server/test_server.py`?`test_tool_count_is_ten` -> `test_tool_count_is_eleven`?+`search_references`???? 5 ? `test_search_references_*` ???
- `mcp-server/test_data_consistency.py`?`test_server_tool_count_matches_skill_md` ?? 10 ? 11??? 4 ? report_templates ?? + 1 ??????????
- `scripts/self_check.py` ???????? regex ? `search_\w+`??????? `get_recipe...search_references`?

### ?? / Tests
- ?? `pytest -q`?**137 passed**?116 ?? 2.6.1 ?? + 10 ??? + 5 search_references + 4 report_templates + 1 ???? + 1 test_tool_count rename??????
- `python scripts/self_check.py`?33 ???? PASS?rc=0?

## [2.6.1] - 2026-07-17  (????? + ????? / single-source-of-truth refactor)

### ?? / Changed
- **????? / single source of truth**?? `mcp-server/server.py` ? 12 ??????????`RECIPES` / `MILK_DRINKS` / `FLAVOR_DIAGNOSIS` / `CUPPING_DIMENSIONS` / `GRINDER_SETTINGS` / `PARAMETERS_BY_ROAST` / `PARAMETERS_BY_ORIGIN` / `PARAMETERS_BY_PROCESS` / `FLAVOR_WHEEL` / `LEARNING_RESOURCES` / `MANTRAS` / `SENSORY`???? `data/*.json`??? `_load_data(filename)` ?????`data/` ?????????? dict/list?????????"`references/*.md`?LLM ??? `server.py` ?? dict?MCP ??????????"??????
- **????? / version single source**??? `data/version.json`?`{"version": "2.6.1"}`??????????`mcp-server/pyproject.toml` ?? `dynamic = ["version"]` + hatchling regex source ? `../data/version.json`?`server.py` ?? `__version__ = _load_data("version.json")["version"]`?SKILL.md / CHANGELOG.md / pyproject / server.py ??? + data/version.json ?????? `test_version_single_source_sync` ?????

### ?? / Tests
- ?? `mcp-server/test_data_consistency.py`?10 ????????data?server ????SKILL.md ???=server.py `@mcp.tool` ??references h2 ????/? references mirror????????semver ???
- `test_no_dead_imports`?`import json` ? dead-symbol ??????`_load_data` ???????
- ???? `pytest -q`?**126 passed**?116 ?? + 10 ????????

## [2.6.0] - 2026-07-16  (顾问主导穿透提问 / Consultant-led penetrating questioning)

### 核心变更 / Core change — 交互模式从"被动问答"升级为"顾问主导节奏"

- **交互模式重构**：Skill 从"用户问你答"的被动 Q&A 升级为**专属咖啡顾问**，顾问**主动主导对话节奏**，通过连续穿透式追问帮用户拆解问题、锁定关键变量
- **SKILL.md 核心机制重写**：
  - 新增 "顾问主导交互——你来提问，用户来回答" 章节（A 开场/B 追问节奏/C 观察+动作/D 档位判定）
  - 永不说"有什么可以帮你"——第一句话必须是穿透式开场提问
  - 追问节奏表：用户每个答案 → 1–2 条更深追问（"哪种苦？""什么滤纸？""最近有没有换豆子？"）
  - 经验档位嵌入追问链中自动判定（不开头单独做问卷）
  - 工作流程重写为 "顾问主导版"——开场追问链锁变量→联网核实→顾问口吻建议→风味调整追问链
  - 触发关键词新增：顾问 / consultant / 咖啡顾问 / 帮我调咖啡 / 调整冲煮 / 改进萃取 / 问题排查
  - English summary 同步更新：新增 consultant-led interaction 与 level detection 段落
- **SKILL.md frontmatter**：description 更新为 "专属咖啡顾问 Skill"，version `2.5.1` → `2.6.0`
- **部署路线**：从 "本地离线应用"回归 "平台 Skill（Claude/Coze/WorkBuddy）"，由平台托管模型与 API key

### 夺走 / Removed
- **`mcp-server/local_app.py`** 已删除（v2.5.1 的纯离线本地应用）。理由：用户希望由 Claude/Coze/WorkBuddy 托管模型与 API key，不想 own 模型管理
- **`mcp-server/pyproject.toml`** `[local]` 可选依赖（`ollama>=0.5.0`）已移除
- **`mcp-server/pyproject.toml`** `barista-local` 脚本入口已移除
- **`mcp-server/pyproject.toml`** `py-modules` 中 `local_app` 已移除，仅保留 `server`

### 变更 / Changed
- **`SKILL.md`**：version `2.5.1` → `2.6.0`；核心机制段与工作流程段全面重写为顾问主导穿透提问模式；English summary 同步
- **`README.md`**：version badge `2.5.1` → `2.6.0`；移除 "本地运行应用" 整段；核心机制段重写为 "顾问主导穿透提问"；文件结构树移除 `local_app.py`
- **`mcp-server/pyproject.toml`**：version `2.5.1` → `2.6.0`

### 保留 / Retained
- **10 个 MCP 双语工具**（`barista-mcp`）全部保留，无改动
- **references/** 全部 17 个中文原版 + 13 个英文镜像保留
- **联网核实能力**（名家配方 + 变压曲线）保留
- **所有专业知识**（冠军冲煮/特调 SOP/SCA 杯测/金杯矩阵/滤杯滤纸等）完整保留

---

## [2.5.1] - 2026-07-16  (纯离线本地应用 / 100% offline local app)

### 更改 / Changed — Agent 路线从 OpenAI SDK 切到全离线内置工具

- 不再需要 `openai-agents` 依赖、不再需要 OpenAI API key、不再需要网络
- `mcp-server/agent.py` 与 `mcp-server/test_agent.py` 移除（v2.5.0 产物），已被以下新文件取代
- **`mcp-server/local_app.py`**（10678 chars）：全新纯离线咖啡师本地应用
  - `run_offline()`：关键词→工具调度→内置 MCP 工具直答（0 网络）
  - `_dispatch_tool()`：正则意图映射——"手冲/V60/Kalita/苦/卡布/校准 C40/EK43/特调"等 80+ 关键词 → 10 个 MCP 工具自动调用
  - `_guess_language()`：从用户输入 ASCII 占比自动判 zh/en
  - `run_ollama()`：可选本地 LLM 模块——`--ollama` flag 连 `localhost:11434`，默认模型 `llama3.2:3b`
  - `run_hybrid()`：离线工具回答 + 可选 ollama 改写（不添加新事实）
  - `repl()` 交互式对话，`main()` 支持 `--info` / `--ollama` / 一句一问
- `mcp-server/pyproject.toml`：version `2.5.0` -> `2.5.1`
  - `[agent]` extra 改为 `[local]`（`ollama>=0.5.0`，可选）
  - `barista-agent` 入口改为 `barista-local = "local_app:main"`
  - `py-modules` 改为 `["server", "local_app"]`
- `README.md` 对应更新：名为「本地运行应用」的章节，注明离线/cd/可选 ollama，去掉 API key/OpenAI 依赖的旧指示
- `SKILL.md` frontmatter version 更新为 2.5.1

### 测试 / Tests
- `test_server.py` 116 条 MCP 工具测试全部通过
- `local_app.py` 100% 纯 Python + 正则 + importlib，无外部网络依赖

---

## [2.5.0] - 2026-07-16  (独立 Agent MVP / Standalone Agent MVP)

### 新增 / Added — 路径 A 独立 Agent (OpenAI Agents SDK)

- `mcp-server/agent.py`（5346 chars）：
  - 用 OpenAI Agents SDK 把项目重构成一个**独立运行的 coffee-coach Agent**（无需 MCP 客户端）
  - SKILL.md 全文作为 Agent 系统指令；10 个 MCP 工具通过 `MCPServerStdio` 注册为 Agent 工具
  - `_load_instructions()` 把 SKILL.md 与 bilingual header 拼成统一系统提示
  - `_load_default_model()` 从 `BARISTA_MODEL` 环境变量读取模型名（默认 `gpt-4o-mini`），支持 monkeypatch 测试
  - 双模式：`run_once()` 一句一答、`repl()` 交互式对话
  - `main()` 入口，cli 支持 `--en`（英文通道）、`--model`（每轮覆写模型）、`-h`（帮助输出）
  - 无 `OPENAI_API_KEY` 直接 exit 2，避免静默连接的外部前端挂在启动失败
- `mcp-server/pyproject.toml`：
  - version `2.4.0` -> `2.5.0`
  - `[agent]` extra 新增 `openai-agents>=0.0.10`
  - scripts 新增 `barista-agent = "agent:main"`（与 `barista-mcp` 并列）
  - `py-modules` 加 `"agent"`
- `mcp-server/test_agent.py`（3130 chars，10 tests）：
  - 用 `pytest.importorskip("agents")` 在不装 openai-agents 时完全跳过
  - 覆盖：指令加载、路径完好、模型 env fallback / 覆写、参数解析/默认/en 前缀/无参数/无 key exit 2、Agent 构造
  - 已验证：装后以 `python -m pytest` 在真实 `openai-agents` 库上通过 10/10

### 其他 / Other

- `README.md`：新增「独立 Agent 用法 (v2.5)」章节，含 pip/pyproject 安装与 env 指示；badge version `2.4.0`->`2.5.0`
- `SKILL.md` frontmatter：version `2.4.0` -> `2.5.0`
- 完整的测试流水：`test_server.py` 116 条 pyted（MCP tools） + `test_agent.py` 10 条 pyted（Agent 逻辑） -> **126 条**

### 不变 / Unchanged

- MCP server 源代码 `server.py` 保持原样；所有 `test_server.py` 的 116 条测试一致
- references 系列不变

### 环境依赖 / Pre-reqs

- 需 `pip install -e "mcp-server[agent]"` 一次（装 openai-agens + mcp[cli]）
- 需 `export OPENAI_API_KEY=sk-...`（别漏掉，无此直接 exit 2）

---

## [2.4.0] - 2026-07-16

### 新增（MCP 第 10 个工具 get_craft_recipe + 滤杯原则入 parameters-guide / Craft coffee SOP tool + dripper principle in parameters-guide）

#### MCP server 新增工具 / New MCP tool — `get_craft_recipe`
- **第 10 个 MCP 工具** `get_craft_recipe(base, include_tea, language)`：返回特调咖啡 8 项必填 SOP 框架（咖啡基底/茶底/自制辅料/采购辅料/杯具冰/拼装/呈现/来源），把 `references/craft-coffee.md` 第六节的 SOP 模板固化进 MCP，AI agent 调一条即得可执行骨架。
- **基底四选一**（预填默认方案）：`espresso_classic` 中深烘浓缩 18g/36g/1:2；`soe_ristretto` 中浅烘 SOE ristretto 18–20g→18–27g/1:1–1:1.5 只取前中段；`pour_over` 手冲 1:15–1:16；`cold_brew` 1:8–1:12 冷浸。
- **茶底开关** `include_tea=True` 时填入茶类+茶水比+水温+时间默认区间（茉莉/乌龙/红茶/冷泡茶），否则标"无"。
- 未核实基底返回可用列表；具体克数/萃取参数/门店当下配方提示联网核实并标来源日期（见铁律）。

#### 参数灵活应用增强 / parameters-guide enhanced — `references/parameters-guide.md` (+ en mirror)
- 新增 **1.4.1 滤杯与滤纸：手冲的"零号变量"**：明确手冲第一道变量是滤杯几何+滤纸形态而非研磨；列出 V60/V60 Kasuya Model/Origami(一杯两用)/Kalita Wave/Chemex/聪明杯/金属滤网的取向（锥形=明亮酸香、波浪=圆厚甜感、厚纸=极干净）。
- 第五节变量优先级补"手冲专属前提：先固定滤杯+滤纸，再走 滤杯/滤纸 → 研磨 → 水温 → 粉水比 → 时间"。

#### 测试 / Tests
- 工具数断言 9 → 10（更名为 `test_tool_count_is_ten`）
- 新增 5 个 craft 测试：未知基底 zh/en、espresso_classic zh SOP 结构校验、soe_ristretto en、茶底开关
- **116 条 pytest 全部通过**（原 111 + 新 5）

#### 其他 / Other
- `SKILL.md`：version 2.3.0 -> 2.4.0；"9 bilingual tools" -> "10 bilingual tools"；MCP 工具枚举补 `get_craft_recipe`
- `README.md` & `mcp-server/README.md`：工具数 9 -> 10；工具表新增 `get_craft_recipe` 一行
- 测试基线：`test_tool_count_is_nine` -> `test_tool_count_is_ten`（按新增功能同步更新期望，非规避失败）

### 不变 / Unchanged
- 中文 prompt 主体、其余 MCP 工具实现、reference 中文原内容保持不变

---

## [2.3.0] - 2026-07-16

### 增强（滤杯冲煮方案 + 特调独立大类 SOP / Dripper recipes + craft coffee as a standalone major category with SOP）

#### 冠军冲煮方案索引增强 / Champion brewing index enhanced — `references/champion-brewing.md` (+ en/镜像)
- **新增「二、滤杯冲煮方案索引」整章**：
  - 主流滤杯特性对照表（V60 / V60 Kasuya Model / Origami / Origami Air / Kalita Wave / Chemex / 聪明杯 / 金属滤网）
  - **滤纸形态对风味的影响实测**：锥形(V60型)=明亮活泼酸香、果汁感；波浪(Kalita型)=圆润甜厚、酸更柔；厚纸(Chemex)=极干净；结论"Origami 一杯两用，只换纸即换风格"
  - **名家滤杯使用索引**（联网核实）：粕谷哲用 Hario V60（联名 Kasuya Model 去底部螺旋肋减流）、杜嘉宁 2019 用 Origami、Carlos Medina 2023 冠军用 Origami Air
- **补全官方完整配方**：
  - 粕谷哲 4:6 法官方配方（HARIO 访谈核实）：20g/300ml/1:15/92℃，完整注水分段 50→70→60→60→60 ml @ 3:30
  - Carlos Medina 2023 冠军配方：哥伦比亚 Finca Potosí 自然 Sidra / 16g/250ml/1:16.1/91℃/3:00 五段各 50ml（+ 另版赛事配方）
- **索引新增**：Martin Wölfl（2024 WBrC 冠军，奥地利）
- 输出格式与常见误区补充"滤杯/滤纸当第一变量"原则

#### 特调咖啡重构为独立大类 / Craft coffee rebuilt as a standalone major category — `references/craft-coffee.md` (+ en/镜像)
- **特调独立成大类**（不是奶咖延伸），含自完整规范体系
- **第二节 咖啡基底萃取方案规范**（四选一，写配方必填）：
  - A. 中深烘浓缩（奶基/浓体）18g/36g/1:2
  - B. 中浅烘 SOE ristretto（突出豆子本身）18–20g→18–27g/1:1–1:1.5，只取前中段
  - C. 手冲基底（清饮/茶咖）1:15–1:16
  - D. 冷萃基底（低酸顺滑）1:8–1:12 冷浸 12–24h
  - 注：SOE 浅烘 crema 较薄（前街实测已核实，分层能力弱需调呈现）
- **第三节 茶底方案**：茉莉/乌龙/红茶/冷泡茶/茶浓缩液 萃取规范，茶与咖啡分两套 SOP
- **第四节 自制糖浆/辅料 SOP**（禁止写"适量糖浆"）：基础糖浆 1:1/1:2 做法 + 香草/焦糖/生姜/肉桂八角变体；芒果泥/莓果酱/咖啡果皮糖浆 SOP；利口酒含酒精注明
- **第五节 采购辅料清单**：椰子水/气泡水/鲜榨果汁/奶/枫糖/可可抹茶粉，注明品牌取向与甜度校准
- **第六节 特调 SOP 框架**（核心）：8 项必填模板——咖啡基底/茶底/自制辅料/采购辅料/杯具冰/拼装顺序(口诀)/呈现饮用提示/来源
- 保留门店/博主索引（吉米"咖啡届直男" / JPG coffee / GABEE. / Onyx / SEY / Blue Bottle / % Arabica / Coffee Collective）作为第七节检索出口

#### SKILL.md / Other
- frontmatter version `2.2.0` -> `2.3.0`
- 触发关键词扩充：滤杯/滤纸/V60/Origami/Kalita Wave/锥形/波浪/Kasuya/流速/drawdown/Carlos Medina/Martin Wölfl/萃取方案/中深烘浓缩/SOE ristretto/手冲基底/冷萃基底/茶底/茉莉/乌龙/红茶/糖浆/自制糖浆/椰子水/气泡水/果泥/SOP/操作步骤/拼装顺序
- 「特调咖啡」章节重写为独立大类，补 5 条必填子项（基底/茶底/自制辅料/采购辅料/拼装 SOP）
- 「冠军冲煮方案索引」专业模块补 1 条滤杯滤纸行
- 参考资料索引两条描述更新
- en/README 描述对齐：champion 加"drippers & filters"、craft 改为"standalone major category"

### 测试 / Tests
- 111 条 pytest 全部通过（纯文档增强，无功能代码改动）

### 不变 / Unchanged
- mcp-server 代码、中文 prompt 主体、其余 reference 内容保持不变

---

## [2.2.0] - 2026-07-16

### 新增（冠军冲煮方案索引 + 特调咖啡索引，双语 / Champion brewing & craft coffee indexes, bilingual）

#### 冠军冲煮方案索引 / Champion brewing index
- **references/champion-brewing.md (+ en/champion-brewing.md)**：
  - SCA 金杯标准先行校准 + WBrC 赛制说明（Open Service / Compulsory Service）
  - 7 位联网核实名家：粕谷哲 4:6 法（2016 WBrC 冠军）、王策 VWI（2017）、杜嘉宁（2019 冠军，中国首位世锦赛冠军）、吴则霖 Berg Wu 三温暖手冲法（2016 WBC 冠军）、徐诗媛 Sherry Hsu（2022）、彭近洋/乔治队长（2025 最新冠军，"温度"哲学）、Andrea Allen / Onyx Coffee Lab（2020 USBC 冠军、2021 WBC 亚军）
  - 4:6 风味调整逻辑对照表（太酸→前段集中/太淡→后段集中）+ 三温暖手冲法完整流程
  - 其他可检索冠军（Matt Winton 2021 / Diego Campos 2021 / 李震 / 林东源 GABEE.）
  - 检索起点 + 输出模板 + 铁律（具体粉量/水温/比例/时间必须再次联网核实，标注来源 + 日期）

#### 特调咖啡索引 / Craft coffee index
- **references/craft-coffee.md (+ en/craft-coffee.md)**：
  - 国内博主/门店：吉米"咖啡届直男"（抖音/小红书）、store by .jpg / JPG coffee（广州，含可可/瑞夫/波比系列、寺右限定 Dirty、茉莉冷萃、争气芒芒、ALOHA）、GABEE.（台北，林东源）
  - 海外门店：Onyx Coffee Lab（Rogers, AR）、SEY Coffee（Brooklyn，2019 Food&Wine 美国最佳）、Blue Bottle（Hayes Valley Espresso + Kyoto-Style Espresso）、% Arabica、Coffee Collective（Copenhagen）
  - 意式特调通用要点（豆子/辅料顺序/冰量/平衡/分层）+ 检索话术 + 输出模板

#### 其他改动 / Other
- **SKILL.md**：frontmatter version 2.1.0 -> 2.2.0；触发关键词扩充（冠军冲煮/名家配方/4:6/四六法/粕谷哲/杜嘉宁/彭近洋/乔治队长/王策/WVI/吴则霖/Berg Wu/三温暖/徐诗媛/SCA 冲煮/WBrC/创意特调/吉米/咖啡届直男/JPG coffee/GABEE/Onyx/SEY/Blue Bottle/% Arabica/Coffee Collective/signature/craft coffee）；新增「冠军冲煮方案索引」与增强「特调与创意饮专项」两个专业子章节；获取方案触发原则点名链接到两个新文件；参考资料索引补两条
- **references/en/README.md**：覆盖表更新 -> 12/17（新增 champion-brewing、craft-coffee 两条）
- 全部数字联网核实；遵守"禁止编造"铁律——未核实配方仅作检索起点

### 测试 / Tests
- 111 条 pytest 全部通过（纯文档新增，无功能代码改动）

### 不变 / Unchanged
- mcp-server 代码、中文 prompt 主体、原有 15 个 reference 内容保持不变

---

## [2.1.0] - 2026-07-15

### 重构与双语化 / Refactor & bilingualization (zh/en)

#### 修复 / Fixed
- **入口点失效修复 / entry point**: 新增 `main()`,`barista-mcp` 命令脚本现在可用 / Added `main()` so the `barista-mcp` console script works.
- **删除死代码 / dead code removed**: 移除从未调用的 `KNOWLEDGE`/`load_reference` 加载与 5 个未用导入(`sys/os/json/re/Optional`) / Removed the never-used `KNOWLEDGE` loader and 5 unused imports.
- **单一数据源 / single source**: `calculate_cupping_score` 现复用 `CUPPING_DIMENSIONS`,消除两份重复定义 / cupping scoring now consumes `CUPPING_DIMENSIONS`, removing duplicate definitions.
- **打包配置 / packaging**: `packages=["."]` -> `py-modules=["server"]`,避免把整目录打进 wheel / Fixed packaging to ship only the single module.

#### 新增 / Added
- **双语 / bilingual**: 全部 9 个 MCP 工具新增 `language="zh"/"en"` 参数,返回对应语言 / All 9 MCP tools now take a `language` arg returning localized output.
- **扩展覆盖面 / expanded coverage**: 冲煮法从 9 -> **14 种**(补 挂耳/虹吸/土耳其/闪萃/越南 phin);新增 `get_milk_drink` 工具覆盖 **11 款经典奶咖**(比例沿用联网核实) / Brew methods 9 -> 14 (drip bag/syphon/Turkish/flash brew/Vietnamese phin); new `get_milk_drink` tool for 11 classic milk drinks.
- **文档对齐 / docs aligned**: README 徽章与方法数对齐(14 brew / 11 milk / 9 tools / 15 references);SKILL.md 加英文速览块与英文总结 / README badges aligned; English summary block added to SKILL.md.
- 安装说明简化为 `pip install "mcp[cli]"` 最短路径 / Shortened install to the shortest path.

#### 测试 / Tests
- **新增 test_server.py**: 111 条 pytest 覆盖 9 工具的 zh/en 返回、未知输入兜底、杯测扣分与等级、参数矩阵等 / Added test_server.py: 111 pytest cases covering all 9 tools' zh/en output, unknown-input fallbacks, cupping deductions & grades, parameter matrices.
- 运行: `pip install -e ".[test]" && pytest mcp-server/test_server.py`(需 `mcp[cli]` 可导入)/ Run with the `test` extra; requires `mcp[cli]` importable.
- **打包修复 / packaging**: 剥离 Set-Content 误加的 UTF-8 BOM(pyproject/server/test/README),修正 pytest 与 tomllib 加载 / Stripped an accidentally-added UTF-8 BOM from pyproject/server/test/README so pytest & tomllib load cleanly.

#### 不变 / Unchanged
- SKILL.md 中文 prompt 主体与 references 15 文件内容保持不变,仅加英文层 / The tuned Chinese prompt body and the 15 reference files are unchanged; only an English layer was added.

---

## [2.0.0] - 2026-07-15

### 新增（五大专业模块）
- **references/cupping.md — 专业杯测教程模块**：
  - SCA 杯测标准八步流程（干香→注水→破渣→撇沫→降温→啜吸→评分→余韵）
  - 100 分十维度评分体系（Fragrance/Aroma、Flavor、Aftertaste、Acidity、Body、Uniformity、Balance、Clean Cup、Sweetness、Overall）及权重说明
  - 缺陷扣分体系（小瑕疵 2 分/杯、大缺陷 4 分/杯）、精品级门槛 ≥80 分
  - 杯测环境要求、器具准备清单、样品烘焙标准（Agtron #58/#63、8-24h 放置、空气冷却）、水质标准（TDS 125-175ppm、93°C）
  - 操作注意事项与常见错误规避表
- **references/grind-calibration.md — 研磨度校准指南模块**：
  - 研磨科学原理（粒径分布与均匀度、细粉问题、化合物溶出顺序）
  - Comandante C40 手摇磨归零校准步骤 + 其他手摇磨参考刻度表
  - Mahlkönig EK43 意式刻度校准步骤 + Matt Perger 高级校准方法
  - Eureka/惠家/Baratza 等家用电动磨校准要点
  - 商用大型磨豆机（E65S/Mythos/Fiorenzato/EG）校准要点
  - 通用校准原则（Dose→Yield→Time）与常见问题解决方案表
- **references/parameters-guide.md — 参数灵活应用专题模块**：
  - SCA 金杯标准（萃取率 18-22%、TDS 1.15-1.35%）与金杯区间解读
  - 核心参数原理（粉水比、水温、时间、流速、化合物溶出顺序）
  - 按产区调整矩阵（埃塞/肯尼亚/哥伦比亚/巴西/巴拿马/云南）
  - 按品种调整（瑰夏/铁皮卡/波旁/SL28/帕卡马拉/卡杜艾）
  - 按处理法调整（水洗/日晒/蜜处理/厌氧发酵）
  - 按烘焙度调整（浅/中/深，含溶解度原理说明）
  - 按个人口味偏好调整 + 3 个实例分析
- **references/learning-resources.md — 权威咖啡知识资源整合模块**：
  - 三阶段成长路线图（入门 0-3 月 / 进阶 3-12 月 / 专业 12 月+）
  - 入门级资源（咖啡沙龙、中国咖啡网、Sweet Maria's、咖啡爱好者网）
  - 进阶级资源（Barista Hustle、Perfect Daily Grind、EHS 学院、明谦咖啡学院、Tim Wendelboe）
  - 专业级资源（WCR Lexicon、SCA 课程、CQI Q-Grader、Le Nez du Café、Scentone T100）
  - SCA 认证体系概览（六大模块）+ 可检索咖啡师/博主/机构名录
- **references/sensory.md 大幅扩展**：
  - 风味词典从 5 词扩充至 30+ 词，按 SCA 风味轮九大类别分组（水果/花香/坚果可可/焦糖甜感/香料/烘烤/发酵酒香）
  - 新增第四节「咖啡风味轮的构成原理与使用方法」：WCR Sensory Lexicon 背景、分层结构、"缝隙距离"原理、正确使用方法
  - 新增第五节「系统化感官训练方案」：五味溶液训练（含 CQI 酸质专项）、Le Nez du Café 36 味闻香瓶四大群组、对比品鉴（三角杯测/产区比较/瑕疵/烘焙度对比）、个人风味记忆库六步搭建法

### 改进
- 版本号 1.4.1 → 2.0.0（主版本号升级：新增 5 大专业模块，功能覆盖范围显著扩大）
- SKILL.md 新增「专业模块（进阶/资深用，新手需转述）」章节，作为五个新模块的入口
- SKILL.md 触发关键词新增：杯测/cupping/校准/刻度/粒径/金杯/TDS/萃取率/风味轮/闻香瓶/三角杯测/味觉训练/嗅觉/感官训练/学习资源/SCA/Q-Grader/粉水比/水温/萃取时间/流速
- SKILL.md 参考资料列表新增 4 个文件条目，sensory.md 描述更新
- README.md 覆盖内容新增 5 项、文件结构新增 4 个文件、触发关键词速查新增 3 组
- 参考文件数 11 → 15

### 不兼容变更
- 无（向后兼容 1.4.1；新模块为增量添加，不影响现有功能）

### 新增（特调 / 经典奶咖完善，联网核实）
- **references/recipes-baseline.md 第九节「咖啡特调、经典奶咖与冰手冲」大幅扩展**：
  - 新增「经典意式奶咖比例速查表」（浓缩 / 热奶 / 奶泡 / 总量 / 口感定位，以双份浓缩 ≈ 36–40g 为基底）
  - 新增逐款做法与核实来源：卡布奇诺（1:1:1 三层、奶泡≥2cm）、拿铁、澳白、可塔朵、玛奇朵（意式 vs 拿铁玛奇朵，两种做法相反）、摩卡、康宝蓝 Con Panna、爱尔兰咖啡、维也纳咖啡
  - **阿芙佳朵 Affogato 原已存在，本次核实并补全比例**：香草 gelato 1–2 球（50–100g）+ 现萃浓缩 25–40ml，ristretto 更佳，立即享用不搅拌；补充"杯先冷冻延缓融化""中深烘最搭"
  - 创意示例由 4 个精简为 3 个（生椰拿铁 / 柠檬美式 / 椰云拿铁），Affogato 上移至经典奶咖逐款
- 各经典配方均于 2026-07-15 联网核对比例（expertcafe / completehomebarista / coffeebros / coffee-guide.jp / brewingcoffees / myreverbcoffee）

### 改进
- 版本号 1.4.0 → 1.4.1；SKILL 触发词补充经典奶咖名称（卡布奇诺 / 拿铁 / 玛奇朵 / 摩卡 / 康宝蓝 / 爱尔兰咖啡 / 维也纳咖啡 / 可塔朵 / 馥芮白）

### 不兼容变更
- 无（向后兼容 1.4.0）

---

## [1.4.0] - 2026-07-15

### 修复（正确性）
- **SKILL.md 例 1 逻辑错误**：原示例"好苦 + 水流快 → 磨粗"与萃取原理矛盾（苦=过萃=水流慢/粉太细）。改为"水流慢 → 粉太细 → 磨粗"，并移除残留的自我纠正桥段（此前 CHANGELOG 宣称已移除，实际仍在）
- **water-quality.md TDS 自相矛盾**：农夫山泉实测 TDS 30–60 低于推荐区间 80–150，已注明其"可用但偏低"，并补充拉满风味应选 TDS 80–150 的方案
- **README 悬空引用**：`barista.skill` 打包文件仓库内不存在，改为说明由 `package_skill.py` 生成
- **触发词"速溶"死触发**：速溶无对应内容且非现磨冲煮，移出触发词并加入"不触发"列表

### 新增
- **references/recipes-baseline.md**
  - 新增「十四、越南咖啡（Vietnamese Phin）」独立做法（深烘 + 炼乳 + 滴漏壶）
  - 意式节新增「一-C、全自动 / 胶囊机用户指引」（研磨/水温微调不适用，重点转豆子选择 + 奶比例）
  - 做法总数 16 → 17
- **pressure-profiles.md**：变压段新增"不推荐自行刷机/改装固件"的对齐说明（与 SKILL 铁律一致）

### 改进
- 版本号 1.3.0 → 1.4.0；SKILL/README 描述与 badge 的"16 种"同步更新为"17 种"

### 不兼容变更
- 无（向后兼容 1.3.0）

---

## [1.3.0] - 2026-07-15

### 新增
- **SKILL.md**
  - 新增「触发关键词」独立段（从 description 中拆出）
  - 新增「铁律」统一段（一次只改一个变量 / 改完再判断 / 换豆先对比 / 口味主观），各 reference 文件不再重复
  - 新增「跨会话记忆」段：引导 agent 保存用户器具画像与经验档位
  - 新增「季节与环境微调」段：夏季/冬季/潮湿/干燥/高海拔的调参提示
  - 新增「搜不到时降级」策略：联网无结果时给通用起步参数并标注来源
  - 新增多轮对话示例（例 7：新手连续调整 3 轮）
- **references/example-dialogues.md**（新文件）
  - 从 SKILL.md 迁出的 4 个补充示例 + 4 个新场景（进阶手冲/资深多变量/搜索降级/换豆调整/水质排查/夏季微调）
- **references/recipes-baseline.md**
  - 新增「季节与环境微调」表（夏季/冬季/潮湿/干燥/高海拔）
- **references/equipment-profiles.md**
  - 新增「七、设备组合推荐」：按预算和用途推荐意式/手冲/便携设备组合
- **references/eval-cases.md**
  - 新增 Case 21（联网搜索失败降级）
  - 评分维度量化：每个维度增加 100%/60%/0% 三档打分锚点 + 评分操作说明

### 改进
- **SKILL.md 结构性瘦身**：正文压缩约 35%，移除重复口诀卡/具体参数/多余示例，聚焦行为指令
- **frontmatter description 精简**：从 ~300 字缩到 2 句话，触发关键词移至正文
- **消除 reference 文件间重复**：sensory.md / beans.md / troubleshooting.md / pressure-profiles.md / recipes-baseline.md 中的铁律内容统一指向 SKILL.md
- **示例 1 修正**：移除 agent 自我纠正的桥段，改为自然引出口诀
- **README.md**：多平台安装路径（WorkBuddy / QoderWork / Claude Code / 通用 Agent）
- **版本号**：1.2.1 → 1.3.0

### 不兼容变更
- 无（向后兼容 1.2.1）

---

## [1.2.1] - 2026-07-15

### 新增
- **references/beans.md**：新增「六、风味偏好 → 选豆方向」，按口味（巧克力坚果/花香果香/果汁感/平衡）映射产区·处理法·烘焙度，含新手白话与资深参数双栏、引导话术与示例；原「使用说明」顺延为第七節

### 改进
- 版本号同步至 1.2.1（SKILL.md frontmatter、README badge）

### 不兼容变更
- 无（向后兼容 1.2.0）

---

## [1.2.0] - 2026-07-15

### 新增
- **references/recipes-baseline.md**：扩到 16 种做法，新增 **挂耳咖啡 / 虹吸壶(赛风) / 土耳其咖啡 / 闪萃(日式冰冲)** 四节
- **SKILL.md**
  - 加「跳过/未回答经验提问 → 默认按新手」的 fallback 规则
  - 加「首杯引导」降低新手放弃率
  - 新增 例 6（进阶用户示例），原反面示例顺延为 例 7、例 8
  - 新增触发关键词：挂耳 / 虹吸 / 赛风 / 闪萃 / 土耳其 / 冰冲 / 速溶
  - 注意事项新增「不推荐用户自行刷机/改装固件/拆机」
- **LICENSE**（MIT）、**.gitignore** 新文件
- **README**：版本号、coverage/references badge 同步更新，关键词速查补充，文件结构补 LICENSE/.gitignore

### 改进
- **recipes-baseline.md** 开头「十二种」更正为「十六种」

### 不兼容变更
- 无（向后兼容 1.1.0）

---

## [1.1.0] - 2026-07-14

### 新增
- **SKILL.md**
  - 重写 frontmatter：精简 description、加反例（不触发场景）、加 `license` / `version` 字段
  - 瘦身正文：内联内容指过去，SKILL.md 仍保持核心机制与示例
  - 新增 2 个反面示例：越界问（机器漏水）/ 信息不足（"我想冲好喝的咖啡"）
  - 注意事项新增"水质""越界问"提醒
- **references/glossary.md**（新文件）
  - 把 SKILL.md 中的禁用术语表独立成完整文件
  - 扩充高频遗漏词：WDT / 分布器 / 布粉器 / 接粉杯 / 毛细 / 粉坑 / 干香湿香 / 杯测 / pH / 银皮 / 冰博克 / 拉花 等
  - 新增"容易写错的近义词"和"行为约束"两节
- **references/pressure-profiles.md**（新文件）
  - 变压萃取：变压功能机型索引（Decent / LM / Slayer / Modbar / Lelit Bianca / Ascaso / Breville / Profitec / Rocket）
  - 三套通用起步曲线范例（浅烘 SOE / 中深烘 / 深烘）
  - 联网核实话术 + 给建议的输出格式
  - "禁止编造任何具体压力/时间数字"铁律
- **references/water-quality.md**（新文件）
  - 关键参数：TDS 80–150 ppm / 硬度 50–175 ppm / pH 6.5–7.5
  - 推荐方案（商用 / 家用性价比 / 直接用）
  - 家用判断话术（新手/资深两版）
  - 水对各类做法的影响表
  - "不要用纯净水/蒸馏水做咖啡"等避坑提醒
- **references/equipment-profiles.md**（新文件）
  - 常见咖啡机画像（入门 / 中端 / 高端三档）
  - 常见磨豆机画像（手摇 / 电动，按价位分组）
  - 各品牌型号的"贴机器"参数（粉碗容量、变压支持、刻度）
  - 给"贴机器"建议的输出模板
- **references/troubleshooting.md**（新文件）
  - 意式味道问题决策树（出液时间 / 时间 / 水温 / 布粉等分支）
  - 手冲味道问题决策树
  - 磨豆机问题表（静电 / 结块 / 刻度松动 等）
  - 奶泡问题表（打不出 / 太粗 / 太薄 / 拉花失败 等）
  - 给新手的固定话术模板
  - 给资深的参数化诊断表
- **references/search-queries.md**（新文件）
  - 变压萃取查询模板（按品牌/机型）
  - 名家配方查询模板（国际/国内）
  - 磨豆机刻度查询模板
  - 豆子特性查询模板
  - 检索注意事项（优先英文 / 加来源限定 / 必须含来源+日期）
- **references/eval-cases.md**（新文件）
  - 20 个评估用例（新手术语 / 资深参数 / 联网核实 / 流程 / 边界 / 特调专项 / 输出格式）
  - 6 维度评分建议

### 改进
- **references/recipes-baseline.md**
  - 数量从 9 种扩到 12 种
  - 新增 **Kalita Wave 蛋糕杯**（新手更友好的手冲滤杯）
  - 新增 **意式变体**：单份 espresso / Ristretto / Lungo / 美式
  - 新增 **椰云拿铁** 和 **Affogato** 配方
  - 新增 **热奶泡 vs 冰奶泡** 详细步骤
  - 新增 **拉花入门参数**
  - 重要提醒扩充（指向新文件）
- **README.md**
  - 加 6 个 badges（License/Version/Skill/Coverage/References）
  - 加 30 秒预览
  - 加"边界（不触发）"段
  - 文件结构更新为 9 个 references
  - 加触发关键词速查
- **SKILL.md**
  - 新增"水质"段（指向 references/water-quality.md）
  - 新增"反面示例"（例 6、7）
  - 注意事项新增"水质""越界问"等

### 修复
- 前置 frontmatter 误带 `agent_created: true`（非规范字段）
- description 过长（7 行）→ 精简到 4 行，加反例段
- 新手禁用术语表不全（WDT / 分布器 / 毛细 / 银皮 等高频词缺失）

### 不兼容变更
- 无（向后兼容 1.0.0）

---

## [1.0.0] - 2026-07-14

### 新增
- 首次发布
- 核心机制：先问经验档位（新手/进阶/资深），新手全程大白话禁用术语
- 9 种做法的起步参数（意式/手冲/法压/爱乐压/摩卡壶/冷萃/冰滴/聪明杯/特调）
- 感官品鉴双栏（新手三步尝味 / 资深六维度）
- 咖啡豆双栏（豆标解读 / 选豆 / 豆性→萃取 / 新鲜度）
- 联网核实机制（点名/变压才搜）
- 5 个示例对话
- 3 个 references：recipes-baseline.md / sensory.md / beans.md

---

[1.4.0]: #140---2026-07-15
[1.3.0]: #130---2026-07-15
[1.2.1]: #121---2026-07-15
[1.2.0]: #120---2026-07-15
[1.1.0]: #110---2026-07-14
[1.0.0]: #100---2026-07-14
