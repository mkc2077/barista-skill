# Barista 咖啡师教练技能 / Barista Coffee-Coach Skill



![License](https://img.shields.io/badge/license-MIT-green)

![Version](https://img.shields.io/badge/version-5.0.0-blue)
![MCP tools](https://img.shields.io/badge/MCP%20tools-25-blueviolet)

![Methods](https://img.shields.io/badge/brew-14%20methods-success)



一个通用 AI Agent **专属咖啡顾问 Skill** —— 顾问主导对话节奏、连续穿透式追问摸清现状、拆解问题、找到影响口感的关键变量。**中英双语** (MCP 工具支持 `language="zh"/"en"`)。兼容 WorkBuddy / Claude Code / Cursor / Codex。



"我的咖啡太苦了" → 顾问追问："焦苦还是尾端涩？最近换了豆子还是研磨度？" → 锁定变量 → "大概率深烘 + 研磨太细。只把研磨往粗调 1 格，别的都不动。喝完关注苦感变化。"



> 附一个标准 MCP server (`barista-mcp`,可通过 MCP 客户端调用)。见 [mcp-server/README.md](mcp-server/README.md)。



## 两种方案 / Two schemes



- **方案 A · Skill 模式**：下载目录 → 放入 Agent 的技能目录 → 即用。模型由你的 Agent 自带的 LLM 提供；随附 25 个 MCP 工具由 Agent 启动后调用。适合已在用某款 Agent 的用户。

- **方案 B · 本地独立版**：双击 `Barista.exe`（或运行 `web/next-app`）。自己填 API Key + 选择模型（OpenAI / Claude / DeepSeek / 通义 / Ollama 等）；内置 AnySearch 联网搜索（可选）；MCP 工具可一键启用；设置持久化在浏览器。源码在 `web/`，三种形态（零依赖单文件、一键启动、Next.js 全功能版）详见 [web/README.md](web/README.md)。



> 两套方案共享同一套咖啡知识库与 MCP 工具——区别只在"谁提供模型"。



## 覆盖内容 / Coverage



覆盖 **14 种冲煮 + 11 款经典奶咖 + 创意特调** / 咖啡豆选存 / 器具画像 / 水质 / 瑕疵品检 / 感官品鉴 / SCA 杯测 (10 维得分) + 研磨校准与金杯参数 / 故障排查 (决策树) + 冠军冲煮方案索引 / 滤杯滤纸方案 (粕谷哲 4:6/杜嘉宁/王策等) + 特调咖啡 SOP (8 项：基底萃取 / 茶底 / 自制糖浆 / 采购 / 拼装顺序) + 学习资源三级 + SCA 认证 & Q-Grader 考试 (六大模块 / 22 项测试 / 生豆评级 / 瑕疵豆 / 三角杯测 / CVA 评分)。全部知识通过**顾问主导穿透追问**交付——顾问先锁定问题后再派方案。中英双语全文覆盖。详见 `CHANGELOG.md` 历史版本详解。



## 核心机制 / Core: consultant-led penetrating questioning



**是你（顾问）提问，不是用户提问。** 连续、高质量穿透式追问 → 将"咖啡不好喝"的 20+ 可能原因压缩到一个可调整的关键变量。开场直指口感/目标（永不说"有什么可以帮你"）。每个答案 → 1–2 条更深追问。3 轮追问后给判断 + 单变量动作 + 验证方法。根据用户给出的参数细节自适应自适应交谈风格（新手/进阶/资深）。详见 [`SKILL.md`](SKILL.md)。



## MCP Server · 25 个双语工具 / MCP server: 25 bilingual tools



全部工具通过 `mcp-server/` 暴露为 MCP，每个工具带上 `language="zh"/"en"` 《中英输出自由切换》。用法详见 [`mcp-server/README.md`](mcp-server/README.md)。工具列表：



`get_recipe` · `get_milk_drink` · `get_craft_recipe` · `diagnose_flavor` · `calculate_cupping_score` · `calibrate_grinder` · `get_parameters_guide` · `get_flavor_wheel` · `get_sensory_training` · `get_learning_resources` · `search_references` · `rag_search` · `get_sca_path` · `get_sca_course` · `get_qgrader_exam` · `get_qgrader_study_plan` · `get_green_grade` · `get_defect_bean` · `calculate_cva_score` · `get_triangle_protocol` · `identify_flavor` · `start_brew_session` · `log_brew_result` · `next_step` · `search_sca_sources`



### 报告模板 / Report templates



顾问输出，套用 4 个结构化模板（recipe、diagnosis、cupping scorecard、grinder calibration，存于 `references/report_templates/`），强制铁律：**遵守"一次只改一个变量 + 改完喝一口验证 + 下次回退方案"**，避免 ChatGPT 式长篇指西而无实际可用性。



### 额外功能 · v4.5+ 亮点



- **设备 UI 工具卡片（方案 B Web 端）:** cupping / CVA / 三角杯测 / Q-Grader 备考的结果自动渲染为可视化卡片（自 4.5.0）。

- **`search_references` 中文 2-gram 混合检索:** 中文长查询（"柠爽酸酯"）也能命中文档（4.5.0）。

- **RAG 语义检索 `rag_search`（可选扩容）:** 本地 sentence-transformers 嵌入，中国网络友好；未安装时自动回退到 keyword 模式 (4.6.0)。

- **前端 CI 类型检查 + 后端 `pytest` 覆盖 + 自我例行自查 `self_check.py` 保持一致性##各发布门禁提前内置**



### 联网检索策略 / Live search



只在用户点名冠军/博主/变压曲线时联网检索，否则全部用内置标准参数回答。详见 `references/search-queries.md`。



## 边界 / Out of scope



咖啡机硬件维修/除垢/锅炉、开店/经营/商业分析、咖啡因与健康、咖啡历史文化不在范围。礼貌说明并给方向的建议。



## RAG 索引构建



`pip install "./mcp-server[rag]"` 后跑一次 `scripts/build_rag_index.py`，完成一次后 `rag_search` 功能即激活。



## 安装 / Install

**方案 A · Skill 模式（最快）**：

把仓库放入所用 Agent 的技能目录即可使用——不需要 npm/yarn/pip 额外步骤。兼容 Codex / Claude Code / Cursor / WorkBuddy 等所有遵循 Vercel Agent Skills 规范的平台（本仓库通过 `.claude-plugin/plugin.json` 声明元数据）.

**方案 B · 本地独立版（不需要 Agent）**：

Windows 用户双击 `Barista.exe`（或运行 `web/next-app`）。自己填模型 API Key，内置 25 MCP 工具 + AnySearch 联网搜索（可选，留空走免费用量），设置持久化在浏览器。详见 [`web/README.md`](web/README.md)。


## 本地版（方案 B）/ Local apps



详见 [`web/README.md`](web/README.md)：包含零配置单文件版、一键启动批处理版、Next.js 全功能版以及 `Barista.exe` 打包版。Windows 用户推荐打包版，无需安装 Node.js。



## 触发关键词 / Trigger keywords (`SKILL.md` 已集成)



详见 [`SKILL.md`](SKILL.md) ——**已内置完整的 80+ 条中英文触发关键词清单。**



## 文件结题 / License



MIT © [mkc2077](https://github.com/mkc2077)—— 自由使用、修改、分发 (MIT 宽松许可详见 LICENSE 文件)。

