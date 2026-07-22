# 变更日志

本文件记录 barista 技能的版本变更。版本号遵循 [语义化版本](https://semver.org/)：主版本.次版本.修订号。

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

## [2.9.0] - 2026-07-20  (博主特调 ASR 数据集 / Blogger craft-coffee ASR dataset)

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
