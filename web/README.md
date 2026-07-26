# Barista 本地 HTML 版 / Local HTML runner

一个**纯浏览器、零后端**的本地咖啡顾问——把 `barista-skill` 的核心知识装进单个 HTML 文件，用户自己接入 LLM API Key 即可运行。A **browser-only, zero-backend** local coffee consultant — the core knowledge of `barista-skill` packed into a single HTML file; bring your own LLM API key.

## 特性 / Features

- **单文件部署**：一个 `barista-chat.html`（约 41 KB），双击即开，无需安装任何依赖。
- **自带 API 适配层**：支持 OpenAI / Anthropic Claude / DeepSeek / 通义千问 / Kimi / 智谱 GLM / Ollama（本地）/ 任意 OpenAI 兼容端点。
- **顾问主导对话**：内嵌完整系统提示词（14 种冲煮法 + 11 款奶咖 + 故障决策树 + 新手术语表 + 说人话铁律），AI 会用穿透式追问主导对话，而非被动问答。
- **流式响应 + 可中断**：实时打字效果，随时点"停止"保留已生成内容。
- **本地持久化**：API 配置与对话历史仅存于浏览器 `localStorage`，不上传任何服务器。
- **三档自适应**：根据用户描述自动判断新手/进阶/资深，切换术语与参数粒度。
- **[v4.2] 可选 MCP 工具调用**：启用后顾问可调用 24 个专业工具（冲煮参数查询、故障诊断、杯测评分、研磨校准等），数据源从静态提示词升级为 28 个 JSON 动态查询。需本地运行 MCP Server（用 `start.bat` / `start.sh` 一键启动）。

## 快速开始 / Quick start

### 方式一：纯浏览器（零依赖）/ Option A: Browser-only (zero deps)

1. 双击打开 `barista-chat.html`（任何现代浏览器：Chrome / Edge / Firefox / Safari）。
2. 点击右上角 ⚙ 设置图标。
3. 选择 API 供应商 → 填入 API Key →（可选）调整 Base URL / 模型名 / 温度。
4. 保存 → 回到主界面点"开始对话"，顾问会用穿透式提问开场。
5. 或直接在输入框提问，例如："我手冲太苦了怎么办"、"新手想做拿铁"、"SOE 直饮太酸"。

> **Ollama 用户**：无需填 API Key，确保本地已运行 `ollama serve` 并已 `ollama pull` 对应模型即可。

### 方式二：一键启动（HTML + MCP 工具）/ Option B: One-click starter (HTML + MCP tools)

1. 双击仓库根目录的 `start.bat`（Windows）或终端运行 `bash start.sh`（macOS / Linux）。
2. 脚本自动：检测 Python → 安装依赖 → 启动 MCP Server (HTTP) → 打开浏览器。
3. 在浏览器设置里勾选「启用 MCP 工具」（地址已预填 `http://127.0.0.1:8765/mcp`）。
4. 顾问现在可以调用 24 个专业工具——问"帮我查手冲参数"时它会调 `get_recipe`，说"浓缩太苦"时它会调 `diagnose_flavor`。

> **注意**：MCP 工具模式仅支持 OpenAI 兼容 API（OpenAI / DeepSeek / Qwen / Kimi / GLM / Ollama / 自定义）。Anthropic Claude 暂不支持工具调用，会自动回退流式模式。

## 隐私 / Privacy

- API Key、对话内容**仅保存在本地浏览器**（`localStorage`），不会发送到本仓库或任何第三方服务器。
- 对话内容会直接发送到你配置的 LLM API 端点（由该服务商的隐私政策管辖）。
- 清空浏览器数据 / 清空对话按钮即可彻底删除所有记录。

## 与 MCP Server 的关系 / Relation to MCP server

| | 本地 HTML 版 (`web/`) | MCP Server (`mcp-server/`) |
|---|---|---|
| 运行环境 | 浏览器（纯前端） | Python 进程 |
| 数据源 | 内嵌于系统提示词（静态） | 28 个 JSON 数据文件（动态查询） |
| 工具调用 | 可选：启用 MCP 后支持 24 个工具（[v4.2]） | 24 个双语 MCP 工具（原生） |
| 适用场景 | 个人本地使用、快速体验 | Agent 平台集成、程序化调用 |
| 联网检索 | 不支持 | 支持（点名冠军/博主/变压时） |

HTML 版是"轻量体验版"，MCP Server 是"完整功能版"。v4.2 起，通过 `start.bat` / `start.sh` 一键启动可让 HTML 版调用 MCP Server 的全部 24 个工具，兼顾简洁界面与完整功能。

## 许可 / License

MIT，同主仓库。
