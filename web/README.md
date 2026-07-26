# Barista 本地咖啡顾问 / Local Coffee Consultant

三种使用方式：**纯浏览器单文件**（零依赖）、**一键启动**（HTML + MCP 工具）、**Next.js 开发版**（完整功能）。Three options: **single-file HTML** (zero deps), **one-click starter** (HTML + MCP tools), **Next.js dev version** (full features).

## 特性 / Features

- **多版本部署**：单文件 HTML（~41 KB）或 Next.js 全功能版，按需选择。
- **自带 API 适配层**：支持 OpenAI / Anthropic Claude / DeepSeek / 通义千问 / Kimi / 智谱 GLM / Ollama（本地）/ 任意 OpenAI 兼容端点。
- **顾问主导对话**：内嵌完整系统提示词（14 种冲煮法 + 11 款奶咖 + 故障决策树 + 新术语表 + 说人话铁律），AI 会用穿透式追问主导对话，而非被动问答。
- **流式响应 + 可中断**：实时打字效果，随时点"停止"保留已生成内容。
- **本地持久化**：API 配置与对话历史仅存于浏览器 `localStorage`，不上传任何服务器。
- **三档自适应**：根据用户描述自动判断新手/进阶/资深，切换术语与参数粒度。
- **[v4.2] 可选 MCP 工具调用**：启用后顾问可调用 24 个专业工具（冲煮参数查询、故障诊断、杯测评分、研磨校准等），数据源从静态提示词升级为 28 个 JSON 动态查询。需本地运行 MCP Server（用 `start.bat` / `start.sh` 一键启动）。
- **[v4.3] Next.js 全功能版**：多对话管理、4 种咖啡主题、本地模型自动发现、导入/导出。

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

### 方式三：Next.js 开发版（完整功能）/ Option C: Next.js dev version (full features)

```bash
cd web/next-app
npm install
npm run dev
```

> 需要 **Node.js 20 及以上**（Next.js 16 的运行要求）。

打开 `http://localhost:3000`。相比单文件 HTML 版的额外功能：
- **多对话管理**：侧边栏创建/切换/删除/重命名对话，自动生成标题
- **4 种咖啡主题**：浅烘 (light-roast) / 手冲 (pour-over) / 深烘 (dark-roast) / 浓缩 (espresso)
- **本地模型自动发现**：填写 Base URL 后点击"发现"按钮，自动获取 Ollama / LM Studio / vLLM 的可用模型列表
- **导入/导出**：对话历史和设置可导出为 JSON 文件，导入恢复
- **MCP 工具集成**：与 HTML 版相同的 MCP 工具调用能力

> **生产构建**：`npm run build && npm start`

#### 🪟 Windows 一键版（零安装 exe）/ Windows one-click exe

适合不想装 Node.js 的小白用户：

1. 从 [GitHub Releases](https://github.com/mkc2077/barista-skill/releases) 下载 `Barista.exe`
2. 双击运行 → 自动打开浏览器进入应用
3. 退出：网页右下角点「⏹ 退出本地服务」，或关闭程序窗口

构建：`cd web/next-app && npm install && pip install pyinstaller && npm run build:exe` → 生成 `dist/Barista.exe`（内嵌 Python 运行时 + 纯静态站点，无需本机安装 Node/Python）。

## 版本对比 / Version Comparison

| | 单文件 HTML (`barista-chat.html`) | Next.js 版 (`web/next-app/`) | MCP Server (`mcp-server/`) |
|---|---|---|---|
| 运行环境 | 浏览器（纯前端） | Node.js + 浏览器 | Python 进程 |
| 依赖 | 零依赖 | npm install | pip install |
| 多对话管理 | 单对话 | 多对话（侧边栏） | N/A |
| 主题切换 | 单一主题 | 4 种咖啡主题 | N/A |
| 本地模型发现 | 手动填写 | 自动发现 | N/A |
| 导入/导出 | 不支持 | 支持 | N/A |
| 数据源 | 内嵌系统提示词（静态） | 内嵌系统提示词 + MCP 动态查询 | 28 个 JSON 数据文件 |
| 工具调用 | 可选 MCP（[v4.2]） | 可选 MCP（[v4.3]） | 24 个双语 MCP 工具 |
| 适用场景 | 快速体验、零安装 | 日常使用、完整功能 | Agent 平台集成 |

## 隐私 / Privacy

- API Key、对话内容**仅保存在本地浏览器**（`localStorage`），不会发送到本仓库或任何第三方服务器。
- 对话内容会直接发送到你配置的 LLM API 端点（由该服务商的隐私政策管辖）。
- 清空浏览器数据 / 清空对话按钮即可彻底删除所有记录。

## 许可 / License

MIT，同主仓库。
