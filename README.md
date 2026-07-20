# Barista 咖啡师教练技能 / Barista Coffee-Coach Skill

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-2.8.0-blue)
![Methods](https://img.shields.io/badge/brew-14%20methods-success)
![Milk drinks](https://img.shields.io/badge/milk%20drinks-11-success)
![MCP tools](https://img.shields.io/badge/MCP%20tools-11-blueviolet)
![References](https://img.shields.io/badge/references-17%20files-informational)

一个通用 AI Agent **专属咖啡顾问 Skill**（非被动问答机器）——顾问**主导对话节奏**，通过连续穿透式追问帮你摸清现状、拆解问题、找到影响口感的关键变量。A general-purpose AI-agent coffee-consultant Skill (not a Q&A bot) — the consultant **drives the conversation** with penetrating follow-up questions to map your situation, break down the problem, and find the ONE variable that will make your coffee better. **中文 / English 双语**（MCP 工具全部支持 `language="zh"/"en"`）。兼容 WorkBuddy / QoderWork / Claude Code / Cursor / 通用 Agent 平台。


> **v2.8 新增说人话改写层**：`get_recipe` / `get_milk_drink` / `get_craft_recipe` 改返 JSON 字段，必须走 [references/human-voice-rules.md](references/human-voice-rules.md) 的 7 条铁律改写 + 末尾预判问题。输出读起来像咖啡搭子在聊天，而不是 AI 报告。另见 [AGENTS.md](AGENTS.md) subagent 契约。

> **30 秒预览 / 30-second preview**：用户「我做的手冲好苦怎么办？」"My pour-over is too bitter." → 顾问：「哪种苦——焦苦还是尾段涩？最近有没有换豆子或调了研磨度？」→ 追问锁定了变量后：「大概率是研磨太细 + 深烘豆。只改研磨度：往粗的方向转 1–2 格，其他全不变。做完喝一口，关注苦感是否从焦苦变成柔和的微苦。」**顾问主导, 穿透追问, 一次只改一个变量。** Consultant-led, penetrating follow-ups, one variable at a time.

附带一个标准 MCP server（`barista-mcp`），可在 Claude Desktop / Cursor / ChatGPT 中直接调用（需 MCP 客户端）。详见 [mcp-server/README.md](mcp-server/README.md)。

> **部署方式 / Deployment** — 本 Skill 是为 Claude Code / Coze / WorkBuddy / QoderWork 等平台设计的 **Skill 文件**，由平台托管模型与 API key，你不需要 own 任何模型管理。下载目录 → 放入平台技能目录 → 即用。


## 覆盖内容 / Coverage

> 以下全部知识在**顾问主导穿透追问**模式下交付——顾问先锁定你的器具/豆子/口感问题，再精准给方案，而非一次性信息堆砌。
> All knowledge below is delivered in the **consultant-led penetrating questioning** model — the consultant locks in your gear/beans/taste problem first, then gives a targeted solution.

- **意式萃取 / Espresso** —— 浓缩、美式、拿铁、澳白、dirty；含 espresso / ristretto / lungo / 单份方案
- **冲煮方法 (14 种) / Brew methods (14)** —— 手冲(V60/Kalita Wave)、冰手冲、法压、爱乐压、摩卡壶、冷萃、冰滴、聪明杯、挂耳、虹吸(赛风)、土耳其、闪萃(日式冰冲)、越南 phin
- **经典奶咖 (11 款) / Classic milk drinks (11)** —— 玛奇朵、可塔朵、澳白、卡布奇诺、拿铁、摩卡、康宝蓝、美式、爱尔兰咖啡、维也纳咖啡、阿芙佳朵（比例已联网核实）
- **咖啡豆 / Beans** —— 豆标解读、选豆、烘焙度/处理法/产区/豆种对冲煮与萃取的影响、新鲜度与保存
- **器具画像 / Equipment profiling** —— 按咖啡机/磨豆机型号、粉碗容量、滤纸类型给"贴机器"的方案
- **水质 / Water** —— TDS/硬度/pH、家用水判断与建议（最常被忽略的变量 / the most-overlooked variable）
- **变压萃取 / Pressure profiling** —— 带变压的机器联网查曲线（含品牌社区方案）；**禁止凭记忆编造**
- **感官品鉴 / Sensory** —— 描述味道并据此调整；含 SCA 风味轮原理与使用、系统化感官训练方案
- **专业杯测 / Cupping** —— SCA 标准流程 + 100 分十维度评分体系
- **研磨校准 / Grind calibration** —— 粒径分布原理、C40/EK43/Eureka 等校准方法、Dose→Yield→Time
- **参数灵活应用 / Parameters** —— 金杯理论、溶出顺序、按产区/品种/处理法/烘焙度/口味调整矩阵
- **故障排查 / Troubleshooting** —— 决策树式诊断
- **冠军冲煮方案 / Champion brewing** —— 粕谷哲 4:6、王策 VWI、杜嘉宁、吴则霖三温暖、Carlos Medina（2023 冠军）、彭近洋（2025 冠军）等检索起点；含**滤杯/滤纸冲煮方案**（V60 / V60 Kasuya Model / Origami 一杯两用 / Kalita Wave / Chemex / 聪明杯 / 金属滤网）+ 滤纸形态对风味影响实测 + 名家滤杯使用索引；具体配方联网核实
- **特调咖啡（独立大类）/ Craft coffee (standalone category)** —— 8 项必填 SOP 框架：咖啡基底萃取方案（中深烘浓缩 / SOE ristretto / 手冲 / 冷萃）、茶底、自制糖浆 SOP、采购辅料、杯具冰、拼装顺序（带口诀）、呈现提示、来源；门店/博主索引（吉米"咖啡届直男"、JPG coffee、GABEE.、Onyx、SEY、Blue Bottle、% Arabica、Coffee Collective）
- **学习资源 / Learning resources** —— 入门/进阶/专业三级 + SCA 认证 + 咖啡师名录

> English coverage: 14 brew methods, 11 classic milk drinks, beans, water quality, pressure profiling, sensory training, SCA cupping, grinder calibration, golden-cup parameter matrices (incl. dripper/filter paper as the pour-over zero-th variable), troubleshooting, curated learning resources, a champion brewing recipes index (Kasuya 4:6, Du Jianing, Berg Wu, Carlos Medina, Peng, etc. with dripper/filter-paper map), and craft coffee as a standalone major category (base extraction specs / tea base / homemade syrup SOP / store-bought / full build SOP). 13/17 reference files mirrored in English under `references/en/`.

## 核心机制：顾问主导穿透提问 / Core: consultant-led penetrating questioning

> **本 Skill 不是"用户问你答"——是你（顾问）来提问，用户来回答。** 通过连续、高质量、穿透式的追问，把"咖啡不好喝"的 20 个可能原因缩到 1 个关键变量。
> **It is not Q&A — the consultant asks, the user answers.** Through continuous penetrating questions, narrow 20 possible causes to ONE key variable.

| 交互阶段 / Phase | 说明 / Description |
|---|---|
| **开场** / Opening | 穿透式开场提问（直奔口感问题或目标），永不说"有什么可以帮你"。A penetrating opening question targeting taste or goal; never "How can I help?" |
| **追问** / Follow-up | 每个答案 → 1–2 条更深的追问（"哪种苦？""最近换了豆子吗？""什么滤纸？"），缩窄变量范围。Each answer → 1–2 deeper follow-ups that narrow the variable space. |
| **观察+动作** / Observation + Step | 3 轮追问后给判断（"大概率是 X 导致 Y"）+ 单变量动作 + 验证方法。After ~3 rounds: observation → single‑variable action → verification check. |
| **档位判定** / Level detection | 嵌入追问中——用户说得出参数 → 资深；只能描述风味 → 进阶；只说"不好喝" → 新手。沟通语言按档位自动切换。Embedded in questioning — parameter fluency reveals level; speech adapts automatically (plain+mnemonics vs. parameters+logic). |

**给建议前必须锁定 / Always lock in before advising**：经验档位（经追问链判定）、器具画像 / equipment（咖啡机/磨豆机型号、粉碗容量）、豆卡 / bean card（烘焙度·处理法·产区·豆种）。特调与冰手冲先给配方与器材清单再动手。

## MCP Server（11 个双语工具）/ MCP server (11 bilingual tools)

把技能封装为标准 MCP 服务，任何 MCP 客户端可直接调用；每个工具带 `language` 参数。Packaged as a standard MCP service; every tool is bilingual. 见 / See [`mcp-server/README.md`](mcp-server/README.md)。

`get_recipe` · `get_milk_drink` · `get_craft_recipe` · `diagnose_flavor` · `calculate_cupping_score` · `calibrate_grinder` · `get_parameters_guide` · `get_flavor_wheel` · `get_sensory_training` · `get_learning_resources` · `search_references`

## 报告模板 / Report templates

顾问在四个固定输出场景下**套用**结构化模板（避免临场挥洒、降幻觉）。模板存于 `references/report_templates/`，由 `{{placeholder}}` 标记顾问在响应时填入的字段。The consultant reuses 4 structured output templates (live in `references/report_templates/`) to avoid improvisation and reduce hallucination; placeholders are filled by the consultant at response time.

| 场景 / Trigger | 模板 / Template |
|---|---|
| 用户要配方 / `get_recipe` 输出 | `recipe_card.md` |
| 追问收尾给观察+动作 / `diagnose_flavor` 输出 / “为什么不好喝” | `diagnosis_sheet.md` |
| 杯测评分 / `calculate_cupping_score` 输出 | `cupping_scorecard.md` |
| 校准磨豆机 / `calibrate_grinder` 输出 | `grinder_calibration.md` |

每个模板都强制铁律：一次只改一个变量 + 每次改动都附验证与无变化时的下一步。Every template enforces: change ONE variable + verify after every change + fallback step when the change has no effect.

## 联网检索（点名才搜）/ Live search (on request only)

点名某咖啡师 / 博主 / 冠军配方，或想试**变压萃取**时，技能联网检索并结构化呈现（适用器具/粉量/水量/水温/时间/研磨/手法；变压含压力曲线），标注来源与日期。未点名也未提变压时，直接用内置起步参数，不联网。Search only when a named expert / pressure-profile is requested; otherwise use built-in starter params. 模板见 `references/search-queries.md`。

## 边界 / Out of scope

礼貌说明聚焦"冲煮与品鉴"，并尽量给方向性建议或应急替代 / Focused on brewing & tasting; explains and gives direction or workarounds：
- ❌ 咖啡机硬件维修/除垢/锅炉 → 推荐品牌售后
- ❌ 咖啡馆开店/经营/商业分析 → 不在范围
- ❌ 咖啡因摄入与健康 → 建议咨询医生
- ❌ 咖啡历史/文化/品牌 → 不在范围

## 文件结构 / File structure

```
barista-skill/
├── SKILL.md                  # 技能主文件：机制/流程/示例/注意事项
├── CHANGELOG.md              # 版本历史
├── README.md                 # 本文件
├── LICENSE                   # MIT
├── .gitignore
├── mcp-server/               # MCP 服务 (11 bilingual tools)
│   ├── server.py / test_server.py
│   ├── pyproject.toml / README.md
├── data/                      # 13 个 JSON 数据文件 = 单一数据源 (recipes/milk/cupping/...)
├── scripts/                   # self_check.py — 一致性自检 (33 项 PASS/FAIL)
└── references/report_templates/  # 4 个顾问输出模板 + README
└── references/               # 17 个参考文件 (中文原版 = 真相源)
    ├── en/                   # English mirrors (13/17: 高/中价值文件全部完成)
    │   ├── recipes-baseline / troubleshooting / parameters-guide / cupping / sensory
    │   ├── beans / grind-calibration / water-quality / equipment-profiles / pressure-profiles
    │   ├── champion-brewing / craft-coffee / learning-resources / README.md (coverage table)
    ├── recipes-baseline.md   # 14 冲煮法 + 经典奶咖起步参数
    ├── sensory.md / beans.md / glossary.md
    ├── pressure-profiles.md / water-quality.md / equipment-profiles.md
    ├── troubleshooting.md / search-queries.md / example-dialogues.md
    ├── eval-cases.md / cupping.md / grind-calibration.md
    ├── parameters-guide.md / learning-resources.md
    ├── champion-brewing.md   # 冠军冲煮方案索引 + 滤杯滤纸冲煮方案 (v2.2/v2.3)
    └── craft-coffee.md       # 特调咖啡独立大类 + 8 项 SOP (v2.3)
```

## 安装 / Install

把整个目录放入所用 Agent 平台的技能目录 / Drop the folder into your agent's skill dir：

| 平台 / Platform | 技能目录 / Skill dir |
|------|------|
| WorkBuddy | `~/.workbuddy/skills/barista-skill/` |
| QoderWork | `~/.qoderworkcn/skills/barista-skill/` |
| Claude Code | `~/.claude/skills/barista-skill/`（在 CLAUDE.md 引用 / reference in CLAUDE.md） |
| Cursor | 项目根 `.cursor/skills/barista-skill/` |
| 其他 / Other | 放入项目上下文目录，在系统提示中引用 |

MCP 用法见 [`mcp-server/README.md`](mcp-server/README.md)（`pip install "mcp[cli]"` + 配置客户端）。

## 使用 / Usage

对话中说"帮我冲一杯手冲""这个萃取好苦怎么办""深烘豆怎么调"等，顾问自动用穿透式追问主导对话、锁定关键变量，而非被动等待指令。Say "brew me a pour-over" / "my espresso is too bitter" / "tune for dark roast" — the consultant auto-drives the conversation with penetrating follow-ups to lock in the key variable.

### 触发关键词速查 / Trigger keywords
- 萃取 / 研磨 / 风味 / 手冲 / 浓缩 / pour-over / espresso / grind / extraction / flavor
- 顾问 / consultant / 专属顾问 / 调整冲煮 / 改进萃取 / 问题排查 / diagnose
- 爱乐压 / 摩卡壶 / 冷萃 / 冰滴 / 聪明杯 / Kalita / AeroPress / moka / cold brew / ice drip
- 特调 / 澳白 / flat white / dirty / ristretto / SOE / lungo /Signature / flat white
- 卡布奇诺 / 拿铁 / 玛奇朵 / 摩卡 / 康宝蓝 / 爱尔兰咖啡 / 维也纳 / 可塔朵 / 馥芮白 / 美式 / cappuccino / latte / mocha / con panna / affogato
- 变压 / 咖啡师 / 品鉴 / 豆子 / 烘焙度 / 处理法 / 养豆 / 赏味期 / 豆标 / 粉碗 / 磨豆机 / pressure profile / beans / roast / process
- 挂耳 / 虹吸 / 赛风 / 闪萃 / 土耳其 / 越南咖啡 / phin / drip bag / syphon / turkish / flash brew
- 杯测 / cupping / 校准 / 刻度 / 粒径 / 金杯 / TDS / 萃取率 / calibration / golden cup
- 风味轮 / flavor wheel / 闻香瓶 / 三角杯测 / 味觉训练 / 嗅觉 / 感官训练 / sensory
- 学习资源 / SCA / Q-Grader / 粉水比 / 水温 / 萃取时间 / 流速 / ratio / temp
- 滤杯 / 滤纸 / V60 / Origami / Kalita Wave / Kasuya / 锥形 / 波浪 / drawdown
- 冠军冲煮 / 名家配方 / 粕谷哲 / 4:6 / 四六法 / 杜嘉宁 / 彭近洋 / 乔治队长 / 王策 / Berg Wu / 三温暖 / Carlos Medina / WBrC
- 创意特调 / 特调配方 / 萃取方案 / 中深烘浓缩 / SOE ristretto / 手冲基底 / 冷萃基底 / 茶底 / 糖浆 / 自制糖浆 / 椰子水 / 气泡水 / SOP / 拼装顺序

## 许可 / License

MIT —— 自由使用、修改、分发 / free to use, modify, distribute.
