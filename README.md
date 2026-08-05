# Barista Coffee Coach Skill

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-6.1.1-blue)
![MCP tools](https://img.shields.io/badge/MCP%20tools-29-blueviolet)
![Brew methods](https://img.shields.io/badge/brew-14%20methods-success)
![Tests](https://img.shields.io/badge/tests-195%20pass-success)

Dedicated coffee coach skill. The AI leads, asking deep follow-ups until it finds the ONE variable that will make the cup better. Bilingual (zh/en). 29-tool MCP server, one-click local app, RAG layer with auto-refreshing knowledge library.

---

## English

### v7 highlights

- **Auto-refreshing knowledge library** — enable "定期自动更新知识库" in Settings; new recipes / brewing methods / champion recipes are fetched via AnySearch, deduplicated, and stored locally on a daily/weekly/monthly schedule (frontend) or via MCP tools `sync_knowledge_now` / `check_knowledge_updates` / `set_knowledge_schedule` (Skill mode)
- **RAG v2** — metadata filtering (`rag_search filter="category=search"`), fast/precise two-tier retrieval, and a golden-QA harness (`evals/golden_qa.jsonl` + `scripts/run_rag_eval.py`, Recall@5)
- **Design context** — `DESIGN.md` codifies the anti-cliché rules (no card-in-card, no gray-on-color, spring physics, skeleton loaders); a CI gate blocks hardcoded colors outside the token allowlist

### v6.1 highlights

- Persistent user profile (gear / taste / beans / water) via localStorage
- Bean & grinder inventory tracked in Settings
- Personal knowledge library with one-click web refresh via AnySearch
- Multimodal image input: upload bean cards / grinder product pages / cupping gauge sheets

### Two ways to use it

**Scheme A — Skill (bring your own agent).** Load this repo as a Skill in WorkBuddy / Claude Code / Trae / Codex / Cursor. The MCP server exposes 29 bilingual tools; your agent's LLM does the thinking. No web-search dependency for core Q&A.

1. Clone the repo (or install the Skill)
2. Point your agent at `SKILL.md` and configure the MCP server (`mcp-server/`, see its README)
3. Optional: give the model an AnySearch key so `check_knowledge_updates` can refresh the knowledge library weekly

**Scheme B — Standalone one-click app (recommended for beginners).** Double-click `start.bat` (Windows) / run `./start.sh` (macOS / Linux) — it starts the local web app + built-in MCP automatically. Bring your own model API key; a 3-step guide appears in Settings on first launch.

1. Double-click start.bat (Windows) / ./start.sh (macOS / Linux)
2. In the Settings panel: pick a provider → paste your API key → choose a model (3-step guide shown)
3. Optional: paste an AnySearch key, enable "定期自动更新知识库", then start asking

### Quick start (standalone)

1. Python 3.10+ and Node.js 20+ on the machine
2. Double-click start.bat (Windows) or run ./start.sh (macOS / Linux)
3. Fill in your API key in the Settings panel
4. Start asking coffee questions - images and your memories load automatically

### Coverage

| Area | What |
|------|------|
| Brewing | 14 methods (V60 / Kalita / AeroPress / French / espresso / moka / cold brew / ice drip / Turkish / Vietnamese phin / ...) + 11 milk drinks + craft specialty recipes |
| Beans | Selection / storage / processing / roast / altitude / moisture / aging; 12 origins + 6 processing matrices |
| Sensory | SCA cupping (10 dims), CVA novel scale (SCA-102/103/104/105), flavor wheel, triangle cupping; chemistry maps to sensory |
| Grinder | 5 hand grinders + multiple electric models, calibration tack + use tips |
| Espresso | Yield rate, pressure curves, pre-infusion, variable pressure |
| Water | TDS, hardness, pH, chlorine, mineral impact |
| Champions | 4:6 method (Kasuya Tetso) and others, web-verified |
| SCA | 6 modules each Foundation / Intermediate / Professional |
| Q-Grader | 22 exams: full content as exam type, passing scores, study traps |
| Green | Defect beans I/II, scoring rules, sieve/SPE grading |
| Learning | Official sources + community (Xiaohongshu / WeChat / Zhihu / forums / Bilibili) |

### MCP tools (29)

| Group | Tools |
|-------|-------|
| Brew / Sensory | get_recipe, get_parameters_guide, diagnose_flavor, identify_flavor, get_sensory_training, get_craft_recipe, start_brew_session, next_step, log_brew_result |
| Milk / Flavor | get_milk_drink, get_flavor_wheel |
| Grinder | calibrate_grinder |
| Cupping | calculate_cupping_score, calculate_cva_score |
| SCA / Green | get_sca_path, get_sca_course, get_green_grade, get_defect_bean, search_sca_sources |
| Q-Grader | get_qgrader_exam, get_qgrader_study_plan, get_triangle_protocol |
| Learning / RAG | get_learning_resources, rag_search, search_references, add_knowledge, sync_knowledge_now, check_knowledge_updates, set_knowledge_schedule |

Every tool supports language=zh/en and a user_context JSON parameter for personalization. Full tool docs: mcp-server/README.md

### RAG

Hybrid retrieval: CJK 2-gram keyword + sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2) cosine over references/ documents. Falls back to pure keyword when sentence-transformers is not installed. SAG-style entity rerank (mcp-server/rag_entities.py) boosts chunks that share entities with the query. v7 adds metadata filtering (PixelRAG payload-filtering idea) and a golden-QA Recall@5 harness. PixelRAG screenshot pipeline deferred - see docs/adr/0001-pixelrag-screenshot-retrieval-deferred.md

### FAQ

- **How do I upload a bean card / photo?** Click the image button in the chat input, pick a photo; the model reads it (vision required on your model).
- **How does the knowledge library auto-update?** Turn on "定期自动更新知识库" in Settings and pick daily/weekly/monthly. Auto items are marked with `auto:` in their source — delete them anytime in the knowledge panel. A one-click "立即同步" button is also there.
- **Where do I get an AnySearch key?** https://www.anysearch.com/docs — optional; without it the app still works, just without web search / auto-refresh.
- **Do I need sentence-transformers?** Only for semantic RAG (recommended). Without it, retrieval degrades to keyword search and the app still works.
- **Both schemes at once?** Yes — Scheme B is the standalone app; Scheme A runs the same MCP server inside your agent. They share the same knowledge base (data/ + localStorage).

### Project structure

        barista-skill/
        data/            structured JSON
        references/      dual-language topic docs (en/ mirror)
        mcp-server/      MCP server + RAG engine + tests
        web/             Next.js 16.x frontend with profile/inventory/knowledge panel
        scripts/         repo utilities (build_rag_index / self_check)
        docs/            ADRs / roadmap / releases
        start.bat        one-click launcher (Windows)
        start.sh         one-click launcher (macOS / Linux)
        SKILL.md        skill protocol file

### Decision tracking

The project adopted hygiene patterns from mattpocock/skills and ponytail:

- ADRs (docs/adr/) record decisions, no re-litigation
- Out-of-scope (docs/out-of-scope/) documents deliberate non-features
- SKILL.md frontmatter lists triggers, one per branch

---

## Chinese

### v7 核心新功能

- **知识库定期自动更新** — 设置面板开启「定期自动更新知识库」，AnySearch 联网拉取最新配方/冲煮手法/冠军方案，去重后本地入库（每天/每周/每月）；方案A 由模型每周调用 `check_knowledge_updates` 自查
- **RAG v2** — 元数据过滤（`rag_search filter="category=search"`）、fast/precise 两档检索、黄金问答评估（`evals/golden_qa.jsonl` + Recall@5）
- **设计契约** — `DESIGN.md` 固化反俗套规则（禁卡片套卡片/禁彩底灰字/弹簧物理/骨架屏）；CI 门禁拦截白名单外的硬编码色值
- **小白引导** — 首次配置时 Settings 顶部显示 3 步快速开始

### v6.1 核心新功能

- 跨对话画像持久化 — 设备/口味/豆子/水质横跨对话保存，每个请求的 system prompt 都带上你的画像
- 手上豆库存 — 设置面板里随时增删手头上的豆子与磨豆机，存入 localStorage
- 个人知识库 + 一键联网刷新 — 搜索关键词，一键三秒 AskAnySearch，结果结构化存为 KnowledgeNote；最近 8 条注入每个对话
- 多模态图片理解 — 聊天输入框附带上传按钮，可发豆卡/磨豆机商品页/杯测图，模型会读内容并据此回答

### 两种用法

**方案A — Skill（自带 Agent 使用）**：把本仓库作为 Skill 加载进 WorkBuddy / Claude Code / Trae / Codex / Cursor。MCP 服务器提供 29 个双语工具，思考由你的 Agent 模型完成；核心问答不依赖联网搜索。

1. 克隆仓库（或安装 Skill）
2. 让 Agent 读 `SKILL.md`，按 `mcp-server/README.md` 配置 MCP 服务器
3. 可选：给模型一个 AnySearch Key，让 `check_knowledge_updates` 每周自动刷新知识库

**方案B — 本地独立一键启动（推荐小白）**：双击 `start.bat`（Windows）/ 运行 `./start.sh`（macOS / Linux），本地 Web 应用 + 内置 MCP 自动启动。用自己的模型 API Key；首次打开 Settings 会显示 3 步引导。

1. 双击 start.bat / 运行 ./start.sh
2. Settings 面板：选供应商 → 填 API Key → 选模型（有 3 步引导）
3. 可选：填 AnySearch Key 并开启「定期自动更新知识库」，然后开始提问

### 快速开始（独立版）

1. Python 3.10+ 与 Node.js 20+ 已安装
2. 双击 start.bat (Windows) / 运行 ./start.sh (macOS / Linux)
3. 在弹窗里：选一家供应商、填 Key、选 Model、保存
4. 开始输入咖啡问题 — 图片与用户记忆会自动加载

### 覆盖范围

| 域 | 内容 |
|-------|-------|
| 冲煮 | 14 器具（V60 / Kalita / 法压 / 爱乐压 / 意式 / 摩卡壶 / 冷萃 / 冰滴 / 土耳其 / 越南 phin...）+ 11 经典奶咖 + 特调配方 |
| 豆子 | 选购/保存/处理法/烘焙等级/海拔/含水率/养豆；12 产地 + 6 处理法参数矩阵 |
| 感官 | SCA 杯测 (10维度)、CVA 新标 (SCA-102/103/104/105) 与旧分制对照、风味车轮、三角杯测；化学反应 ↔ 感官映射 |
| 磨豆机 | 5 手磨 + 多台电磨的校正刻度 + 实战使用建议 |
| 意式 | 萃取率/压力曲线/预浸泡/变压分析 |
| 水质 | TDS、硬度、pH、氯、矿物质影响 |
| 冠军 | 粕谷哲 4:6 法等冠军配方，联网核实、不编造 |
| SCA | 6 模块（Barista/Brewing/Sensory/Roasting/Green/Q）各 Foundation/Intermediate/Professional，含目标与课时、考试形式 |
| Q-Grader | 22 项考试：每项考试形式（盲测/笔试/实操）、通过线、常错现场、备考材料索引 |
| 生豆 | 筛网 + SPE 分级 + 瑕疵豆一级/二级 + 扣分规则 |
| 特调 | 连锁品牌配方 + 咖啡奶茶特调（无咖啡因也记录） |
| 学习 | 新手至资深资源：官方 SCA/CQI 训练 + 社区（小红书/感官/公众号/论坛/B站） |

### MCP 工具 (29)

| 组 | 工具 |
|-------|------|
| 冲煮/感官 | get_recipe, get_parameters_guide, diagnose_flavor, identify_flavor, get_sensory_training, get_craft_recipe, start_brew_session, next_step, log_brew_result |
| 牛奶/风味 | get_milk_drink, get_flavor_wheel |
| 调磨 | calibrate_grinder |
| 杯测 | calculate_cupping_score, calculate_cva_score |
| SCA/生豆 | get_sca_path, get_sca_course, get_green_grade, get_defect_bean, search_sca_sources |
| Q-Grader | get_qgrader_exam, get_qgrader_study_plan, get_triangle_protocol |
| 学习/RAG | get_learning_resources, rag_search, search_references, add_knowledge, sync_knowledge_now, check_knowledge_updates, set_knowledge_schedule |

全部 29 个工具都支持 language=zh/en + user_context JSON，文档详见 mcp-server/README.md

### RAG 检索

混合检索：CJK 2-gram 关键词得分 + sentence-transformers（paraphrase-multilingual-MiniLM-L12-v2）余弦相似度，按 references/ 文档分块。若未装 sentence-transformers 自动退化为纯关键词检索。SAG-style 实体超边重排（rag_entities.py）会 boost 与查询共享实体的文档。v7 新增元数据过滤（PixelRAG payload-filtering 思路）与黄金问答 Recall@5 评估。PixelRAG 截屏通道延后 — 见 ADR 0001。

### 常见问题

- **怎么上传豆卡/照片？** 聊天输入框左侧图片按钮，选图即可；模型需支持视觉（vision）。
- **知识库怎么自动更新？** Settings 开启「定期自动更新知识库」并选间隔（每天/每周/每月）；自动条目来源带 `auto:` 标记，可在知识库面板随时删除；也有「立即同步」按钮。
- **AnySearch Key 哪来？** https://www.anysearch.com/docs —— 可选；不填也能用，只是没有联网搜索与自动刷新。
- **必须装 sentence-transformers 吗？** 只有语义检索（推荐）需要；未装时自动降级为关键词检索，功能不受影响。
- **两种方案能同时用吗？** 能——方案B 是独立应用，方案A 在 Agent 里跑同一套 MCP 服务器，共享同一份知识库（data/ + localStorage）。

### 决策追源

项目借鉴 mattpocock/skills 与 ponytail 的文档卫生规则：

- ADRs (docs/adr/) 记录"我们为何这样设计"，未来不再重复争辩
- Out-of-scope (docs/out-of-scope/) 记录有意图不做的东西，并说明为何不做
- SKILL.md frontmatter 把触发关键词拍平，一个分支一个触发

### 致敬与灵感来源

- Leonxlnx/taste-skill
- nextlevelbuilder/ui-ux-pro-max-skill
- pbakaus/impeccable
- DavidHDev/react-bits
- Zleap-AI/SAG
- StarTrail-org/PixelRAG
- mattpocock/skills
- Shubhamsaboo/awesome-llm-apps
- HKUDS/CLI-Anything
- nexu-io/open-design
- codecrafters-io/build-your-own-x
- ponytail
- andrej-karpathy-skills

### License

MIT.
