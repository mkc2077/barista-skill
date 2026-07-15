# Barista 咖啡师教练技能 / Barista Coffee-Coach Skill

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Methods](https://img.shields.io/badge/brew-14%20methods-success)
![Milk drinks](https://img.shields.io/badge/milk%20drinks-11-success)
![MCP tools](https://img.shields.io/badge/MCP%20tools-9-blueviolet)
![References](https://img.shields.io/badge/references-15%20files-informational)

一个通用 AI Agent 咖啡师教练技能，帮你把咖啡做好、也品明白。A general-purpose AI-agent coffee coach skill that helps you brew better coffee and taste it more clearly. **中文 / English 双语**（MCP 工具全部支持 `language="zh"/"en"`）。兼容 WorkBuddy / QoderWork / Claude Code / Cursor / 通用 Agent 平台。

> **30 秒预览 / 30-second preview**：用户「我做的手冲好苦怎么办？」"My pour-over is too bitter." → 技能：「先问 1 个问题：你是用 V60 还是 Kalita？水温多少？出液用了多久？」→ 拿到答案后给口诀「苦调粗」+ 下一步具体动作「把磨豆机往'粗'那边转 1–2 格」。**全程不甩术语。** No jargon, plain language, one actionable step at a time.

## 覆盖内容 / Coverage

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
- **学习资源 / Learning resources** —— 入门/进阶/专业三级 + SCA 认证 + 咖啡师名录

> English coverage: 14 brew methods, 11 classic milk drinks, beans & roast/process/origin guidance, water quality, pressure profiling, sensory training, SCA cupping, grinder calibration, golden-cup parameter matrices, troubleshooting, and curated learning resources.

## 核心机制：先问经验，再决定语气 / Core: assess experience first

| 档位 / Level | 怎么沟通 / Tone |
|------|----------|
| 新手 / Beginner | 全程大白话，禁用专业术语；给可直接照做的步骤 + 顺口口诀（"苦调粗，酸调细""深烘磨粗温要低"） |
| 进阶 / Intermediate | 可用少量术语，首次出现都解释；给区间而非精确值 |
| 资深 / Advanced | 直接用粉水比、水温、流速、萃取时间、萃取率、压力曲线等专业参数 |

> 新手反馈味道问题时先做**诊断式提问**再给建议，避免猜错方向。For beginners, the skill asks one diagnostic question before advising. 完整决策树见 `references/troubleshooting.md`。

**给建议前必须先问清 / Always confirm first**：经验水平 / experience、器具画像 / equipment（咖啡机/磨豆机型号、粉碗容量）、豆卡 / bean card（烘焙度·处理法·产区·豆种）。特调与冰手冲先给配方与器材清单再动手。

## MCP Server（9 个双语工具）/ MCP server (9 bilingual tools)

把技能封装为标准 MCP 服务，任何 MCP 客户端可直接调用；每个工具带 `language` 参数。Packaged as a standard MCP service; every tool is bilingual. 见 / See [`mcp-server/README.md`](mcp-server/README.md)。

`get_recipe` · `get_milk_drink` · `diagnose_flavor` · `calculate_cupping_score` · `calibrate_grinder` · `get_parameters_guide` · `get_flavor_wheel` · `get_sensory_training` · `get_learning_resources`

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
├── mcp-server/               # MCP 服务 (9 bilingual tools)
│   ├── server.py / pyproject.toml / README.md
└── references/               # 15 个参考文件
│   └── en/                  # English mirrors (5 core: recipes/trouble/param/cup/sensory)
    ├── recipes-baseline.md   # 14 冲煮法 + 经典奶咖起步参数
    ├── sensory.md / beans.md / glossary.md
    ├── pressure-profiles.md / water-quality.md / equipment-profiles.md
    ├── troubleshooting.md / search-queries.md / example-dialogues.md
    ├── eval-cases.md / cupping.md / grind-calibration.md
    ├── parameters-guide.md / learning-resources.md
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

对话中说"帮我冲一杯手冲""这个萃取好苦怎么办""深烘豆怎么调"等，技能自动识别并先确认经验水平。Ask "brew me a pour-over" / "my espresso is too bitter" / "tune for dark roast" — it auto-detects and confirms your level first.

### 触发关键词速查 / Trigger keywords
- 萃取 / 研磨 / 风味 / 手冲 / 浓缩 / pour-over / espresso / grind / extraction / flavor
- 爱乐压 / 摩卡壶 / 冷萃 / 冰滴 / 聪明杯 / Kalita / AeroPress / moka / cold brew / ice drip
- 特调 / 澳白 / flat white / dirty / ristretto / SOE / lungo /Signature / flat white
- 卡布奇诺 / 拿铁 / 玛奇朵 / 摩卡 / 康宝蓝 / 爱尔兰咖啡 / 维也纳 / 可塔朵 / 馥芮白 / 美式 / cappuccino / latte / mocha / con panna / affogato
- 变压 / 咖啡师 / 品鉴 / 豆子 / 烘焙度 / 处理法 / 养豆 / 赏味期 / 豆标 / 粉碗 / 磨豆机 / pressure profile / beans / roast / process
- 挂耳 / 虹吸 / 赛风 / 闪萃 / 土耳其 / 越南咖啡 / phin / drip bag / syphon / turkish / flash brew
- 杯测 / cupping / 校准 / 刻度 / 粒径 / 金杯 / TDS / 萃取率 / calibration / golden cup
- 风味轮 / flavor wheel / 闻香瓶 / 三角杯测 / 味觉训练 / 嗅觉 / 感官训练 / sensory
- 学习资源 / SCA / Q-Grader / 粉水比 / 水温 / 萃取时间 / 流速 / ratio / temp

## 许可 / License

MIT —— 自由使用、修改、分发 / free to use, modify, distribute.
