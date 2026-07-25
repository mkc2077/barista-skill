# Q-Grader 完整备考指南（Q-Grader Complete Prep Guide）

> Q-Grader 是 SCA 咖啡品质鉴定师认证（2025 起 Evolved Q Grader）。本指南覆盖 8 大类考试、备考资源、训练计划。
>
> **新手转述**：Q-Grader 是咖啡界最难的认证之一，8 大类考试，包括笔试、味觉、嗅觉、杯测、三角、酸、生豆、烘焙。

## 零、Q-Grader 概览

- **历史**：CQI (1996-) -> 2025 SCA 接管为 Evolved Q Grader
- **Evolved Q 与旧版区别**：杯测打分从旧 100 分制改为 CVA 1-9 分制；闻香瓶 36 味保持不变
- **8 大类合计 20-22 单元**（口径差异说明见第五节）

## 一、考试 8 大类逐项详解

### 一-1 综合知识笔试（1 单元）
100 道选择题，覆盖种植/采摘/初加工/杯测/分级/烘焙/冲泡，限时 60 分钟，75% 正确率通过。

### 一-2 感官技巧-味觉（3 子单元）
分辨不同浓度的甜/酸/咸。参照组 100% -> 盲组 80% -> 混合组 70%。

### 一-3 嗅觉-闻香瓶 36 味（4 子单元）
Le Nez du Cafe 36 味，分四组：酶催化（浅烘 9 味）/ 焦糖化（中烘 9 味）/ 干馏（深烘 9 味）/ 瑕疵（9 味）。每组 75% 通过。红光教室，瓶子遮标。

### 一-4 杯测打分（4-5 轮）
对多款样品按 SCA 100 分（旧）/ CVA（新）打分。评分与考官一致性偏差 <= 1 分。

### 一-5 三角杯测（4-6 轮）
每组 3 杯（2 同 1 异），找出不一致杯。83% 正确率。红光教室。详见 [triangle-test-protocol.md](triangle-test-protocol.md)。

### 一-6 有机酸配对（1 单元）
8 组咖啡，每组 4 杯，找出加酸的 2 杯并命名酸种（柠檬酸/苹果酸/酒石酸/醋酸）。

### 一-7 生豆分级（1 单元）
350g 样品按 SCA 瑕疵表分级。详见 [green-coffee-evaluation.md](green-coffee-evaluation.md)。

### 一-8 熟豆/样品烘焙辨认（1-2 单元）
辨认样品烘焙度是否符合 SCA 标准 / 挑选 Quaker 豆。

## 二、备考资源

**官方**：SCA 课程 / WCR Lexicon / Le Nez du Cafe 36 / SCA Green Coffee Defect Handbook

**精选社区**：中国咖啡网 / Torch Coffee / Expertcafe / Barista Hustle

详见 MCP 工具 `search_sca_sources` 与 `data/qgrader_study_resources.json`。

## 三、训练计划（按天数）

使用 MCP 工具 `get_qgrader_study_plan(days, focus)` 生成个性化计划。

**权重分配**（闻香瓶最难，权重最高）：
| 类别 | 权重 |
|------|------|
| 嗅觉闻香瓶 | 20% |
| 感官技巧味觉 | 15% |
| 杯测打分 | 15% |
| 三角杯测 | 15% |
| 综合知识笔试 | 10% |
| 生豆分级 | 10% |
| 有机酸配对 | 8% |
| 熟豆/样品烘焙辨认 | 7% |

## 四、考试技巧与陷阱

- **闻香瓶记忆法**：分四组记忆（酶催化/焦糖化/干馏/瑕疵），每组 9 味，先记编号再记气味
- **三角杯测难度递进**：origin -> process -> roast -> batch（由易到难）
- **杯测打分**：与考官一致性是关键，不是绝对分数高低
- **考前注意**：考试期间避免改变饮食/吸烟习惯（味觉会受影响）

## 五、口径差异说明

| 来源 | 考试数 | 差异原因 |
|------|--------|---------|
| 中国咖啡网 | 22 门 | 杯测 5 轮 + 三角 5 轮 |
| Torch Coffee | 20 项 | 杯测 4 轮 + 三角 4 轮 |
| Expertcafe | 22 exams | 含 water/origin 等额外项 |

本仓库统一按 **8 大类**组织，逐单元收录，合计 20-22 单元。详见 `data/qgrader_exams.json`。

## 六、与其他参考文件的关系

- 认证全景见 [sca-certification.md](sca-certification.md)
- CVA 评估见 [sca-new-cva-guide.md](sca-new-cva-guide.md)
- 三角杯测协议见 [triangle-test-protocol.md](triangle-test-protocol.md)
- 生豆分级见 [green-coffee-evaluation.md](green-coffee-evaluation.md)
- 备考资料索引见 `data/qgrader_study_resources.json` + `data/sca_official_sources.json`

> 数据来源：sca.coffee/qgrader, torchcoffee.asia, expertcafe.be, gafei.com。核实日期 2026-07-26。
