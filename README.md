# Barista 咖啡师教练技能

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Coverage](https://img.shields.io/badge/coverage-17%20methods-success)
![References](https://img.shields.io/badge/references-15%20files-informational)

一个通用 AI Agent 咖啡师教练技能，帮你把咖啡做好、也品明白。兼容 WorkBuddy / QoderWork / Claude Code / Cursor / 通用 Agent 平台。

> **30 秒预览**：用户：「我做的手冲好苦怎么办？」→ 技能：「先问 1 个问题：你是用 V60 还是 Kalita？水温多少？出液用了多久？」→ 拿到答案后给口诀「苦调粗」+ 下一步具体动作「把磨豆机往'粗'那边转 1–2 格」。**全程不甩术语。**

## 覆盖内容

- **意式萃取（Espresso）** —— 浓缩、美式、拿铁、澳白、dirty；含 espresso / ristretto / lungo / 单份方案
- **多种冲煮** —— 手冲（含 V60 / Kalita Wave）、冰手冲、法压、爱乐压、摩卡壶、冷萃、冰滴、聪明杯
- **咖啡豆（Beans）** —— 豆标/豆卡解读、按做法与豆性选豆、烘焙度/处理法/产区/豆种如何影响冲煮法与萃取、新鲜度与保存
- **器具与磨豆机画像** —— 结合咖啡机品牌型号（意式/手冲/法压等）、磨豆机型号（手摇/电动）、粉碗容量、滤纸类型，给"贴机器"的方案
- **水质** —— TDS/硬度/pH 参数、家用水判断与建议（最常被忽略的变量）
- **特调与经典奶咖** —— 特调/冰手冲/卡布奇诺/拿铁等经典奶咖提前给配方与器材清单（比例已联网核实）；带变压功能的机器联网查萃取曲线（含品牌社区方案）
- **感官品鉴（Sensory）** —— 教你描述喝到的味道，并据此调整；含 SCA 风味轮原理与使用、系统化感官训练方案（味觉/嗅觉训练、对比品鉴、个人风味记忆库）
- **故障排查** —— 意式/手冲/磨豆机/奶泡的决策树式诊断
- **专业杯测（Cupping）** —— SCA 杯测标准流程（干香→湿香→破渣→啜吸→评分→余韵）、100 分十维度评分体系、环境/器具/水质要求
- **研磨度校准（Grind Calibration）** —— 粒径分布原理、C40/EK43/Eureka 等磨豆机校准方法、Dose→Yield→Time 通用原则
- **参数灵活应用（Parameters Guide）** —— SCA 金杯理论、化合物溶出顺序、按产区/品种/处理法/烘焙度/口味调整矩阵与实例分析
- **权威学习资源（Learning Resources）** —— 按入门/进阶/专业三级分类的学习资源推荐、SCA 认证体系概览、可检索咖啡师/博主名录

## 核心机制：先问经验，再决定语气

| 档位 | 怎么沟通 |
|------|----------|
| 新手 | 全程大白话，禁用专业术语；给可直接照做的步骤 + 顺口口诀（如"苦调粗，酸调细""深烘磨粗温要低"） |
| 进阶 | 可用少量术语，每个术语第一次出现都解释；给区间而非精确值 |
| 资深 | 直接用粉水比、水温、流速、萃取时间、萃取率、压力曲线等专业参数 |

> 新手反馈味道问题时，技能会先做**诊断式提问**再给建议，避免猜错方向。完整决策树见 `references/troubleshooting.md`。

**给建议前必须先问清**：经验水平、器具画像（咖啡机品牌型号 / 磨豆机型号 / 粉碗容量）、以及豆卡信息（烘焙度·处理法·产区·豆种）。特调与冰手冲会先给配方与器材清单再动手。

## 联网检索（点名才搜）

当你点名某位咖啡师 / 咖啡博主 / 咖啡馆 / 比赛冠军配方，或想尝试**变压萃取**时，技能会联网检索并结构化呈现（适用器具 / 粉量 / 水量 / 水温 / 时间 / 研磨 / 手法，变压含压力曲线），并标注来源与日期。
未点名、也未提变压时，直接用内置起步参数，不联网。检索范围同时覆盖国内外名家，变压优先查该机型品牌社区/论坛（查询模板见 `references/search-queries.md`）。

## 边界（不触发的情况）

礼貌说明本技能聚焦"冲煮与品鉴"，并尽量给方向性建议或应急替代方案：
- ❌ 咖啡机硬件维修 / 除垢 / 锅炉问题 → 推荐品牌售后
- ❌ 咖啡馆开店 / 经营 / 商业分析 → 不在范围
- ❌ 咖啡因摄入与健康问题 → 建议咨询医生
- ❌ 咖啡历史 / 文化 / 品牌 → 不在范围

## 文件结构

```
barista/
├── SKILL.md                  # 技能主文件：机制、流程、示例、注意事项
├── CHANGELOG.md              # 版本历史
├── README.md                 # 本文件
├── LICENSE                   # MIT 许可
├── .gitignore                # 忽略临时文件
└── references/
    ├── recipes-baseline.md   # 17 种做法的稳妥起步参数（新手可直接照做）
    ├── sensory.md            # 风味问题 → 调整动作（双栏）+ 如何品咖啡
    ├── beans.md              # 豆标解读 / 选豆 / 豆性→萃取 / 新鲜度保存（双栏）
    ├── glossary.md           # 新手禁用术语表（完整版）
    ├── pressure-profiles.md  # 变压萃取：机型索引 + 联网核实话术
    ├── water-quality.md      # 水质参数与家用水的判断/建议
    ├── equipment-profiles.md # 常见咖啡机/磨豆机/器材画像 + 设备组合推荐
    ├── troubleshooting.md    # 故障决策树（意式/手冲/磨豆机/奶泡）
    ├── search-queries.md     # 联网检索查询模板
    ├── example-dialogues.md  # 补充示例对话（8 个场景）
    ├── eval-cases.md         # 评估用例与自检清单（21 个 Case）
    ├── cupping.md            # SCA 杯测教程：标准流程 + 100 分评分体系 + 环境/器具要求
    ├── grind-calibration.md  # 研磨度校准指南：粒径原理 + 多机型校准方法 + 故障排查
    ├── parameters-guide.md   # 参数灵活应用：金杯理论 + 按豆性/烘焙度/口味调整矩阵
    └── learning-resources.md # 权威学习资源整合：三级分类 + SCA 认证 + 咖啡师名录
```

## 安装

把 `barista/` 整个目录放入你所用 Agent 平台的技能目录：

| 平台 | 技能目录 | 触发方式 |
|------|----------|----------|
| WorkBuddy | `~/.workbuddy/skills/barista/` | `/barista` 或关键词自动触发 |
| QoderWork | `~/.qoderworkcn/skills/barista/` | `/barista` 或关键词自动触发 |
| Claude Code | `~/.claude/skills/barista/` | 在 CLAUDE.md 中引用或关键词触发 |
| Cursor | 项目根目录 `.cursor/skills/barista/` | 在 .cursorrules 中引用 |
| 其他 Agent | 将 SKILL.md 及 references/ 放入项目上下文目录，在系统提示中引用 | 按平台配置 |

方式二：用 WorkBuddy 的 `package_skill.py` 把本目录打包成 `barista.skill`（zip 格式）后，在支持的平台一键安装。

## 使用

对话中说"帮我冲一杯手冲""这个萃取好苦怎么办""深烘豆怎么调"等，技能会自动识别并先确认你的经验水平。

### 触发关键词速查
- 萃取 / 研磨 / 风味 / 手冲 / 浓缩
- 爱乐压 / 摩卡壶 / 冷萃 / 冰滴 / 聪明杯 / Kalita
- 特调 / 澳白 / flat white / dirty / ristretto / SOE / lungo
- 卡布奇诺 / 拿铁 / 玛奇朵 / 摩卡 / 康宝蓝 / 爱尔兰咖啡 / 维也纳咖啡 / 可塔朵 / 馥芮白 / 美式
- 变压 / 咖啡师 / 品鉴 / 豆子 / 烘焙度 / 处理法 / 养豆 / 赏味期 / 豆标 / 粉碗 / 磨豆机
- 挂耳 / 虹吸 / 赛风 / 闪萃 / 土耳其 / 冰冲 / 越南咖啡 / phin
- 杯测 / cupping / 校准 / 刻度 / 粒径 / 金杯 / TDS / 萃取率
- 风味轮 / flavor wheel / 闻香瓶 / 三角杯测 / 味觉训练 / 嗅觉 / 感官训练
- 学习资源 / SCA / Q-Grader / 粉水比 / 水温 / 萃取时间 / 流速

## 许可

MIT —— 自由使用、修改、分发。
