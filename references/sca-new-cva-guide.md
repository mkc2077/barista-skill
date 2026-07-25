# SCA 新 CVA 评估体系指南（SCA New CVA Assessment Guide）

> SCA 于 2024-11 正式采纳 CVA (Coffee Value Assessment)，分四表 SCA-102~105。本指南基于 sca.coffee 官方公告与 Affective Score Calculator。
>
> **新手转述**：SCA 2024 年出了新评估体系 CVA，把"打分"改成 1-9 分制，老 100 分制还在用，两者可以换算。

## 零、CVA 是什么

- **CVA** = Coffee Value Assessment（咖啡价值评估）
- SCA 于 **2024 年 11 月**正式采纳，替代 2004 年杯测协议
- 核心变化：从单一 100 分评分 -> 多维度价值评估

## 一、CVA 四表概览

| 标准 | 名称 | 用途 |
|------|------|------|
| SCA-102 | Sample Preparation and Tasting Mechanics（样品准备与杯测机制） | 规范所有杯测变量 |
| SCA-103 | Descriptive Assessment（描述性评估） | 客观风味属性描述（不评分） |
| SCA-104 | Affective Assessment（情感/感受性评估） | 1-9 分制喜好度评分 |
| SCA-105 | Extrinsic Assessment（外在属性评估） | 产地/认证/价格等非感官属性 |

> 注：四表中文译名以 SCA 官方为准。`data/sca_cva.json` 含完整结构。

## 二、SCA-104 Affective 1-9 分制

| 分段 | 评级 | 说明 |
|------|------|------|
| 1-3 | 差（Bad） | 品质不佳，有明显缺陷 |
| 4-6 | 一般（Average） | 可接受品质 |
| 7-9 | 优秀（Excellent） | 精品级别 |

**与旧 6-10 分制的区别**：
- 旧制：6-10 分十维度，总分 100
- 新制：1-9 分单一喜好度，扩大评分范围与分辨度
- 甜度独立评分，不再并入风味

**精品级门槛**：Affective 7 分（对应旧 100 分制约 75 分）

## 三、1-9 到旧 100 分制换算

SCA 官方提供 Affective Score Calculator 作为新旧系统桥梁。

**换算公式**：`100_pt = (affective_9 - 1) / 8 * 100`

| Affective (1-9) | 旧 100 分制 | 评级 |
|-----------------|------------|------|
| 1 | 0.0 | 差 |
| 3 | 25.0 | 差 |
| 5 | 50.0 | 一般 |
| 7 | 75.0 | 优秀（精品门槛） |
| 9 | 100.0 | 优秀 |

使用 MCP 工具 `calculate_cva_score(affective_overall)` 可自动计算。

## 四、SCA-103 Descriptive 与 SCA-105 Extrinsic

**SCA-103 描述性评估**：
- 使用 WCR Sensory Lexicon 标准术语
- 强度参照刻度 1-15
- 只描述不评分（客观）

**SCA-105 外在属性评估**：
- 五维度：故事与背景 / 可持续认证 / 价格与价值 / 包装与呈现 / 可得性
- 具体评分方法仍在演化中

## 五、CVA 与旧 100 分制的过渡

- 业界仍广泛使用旧 100 分制（尤其采购环节）
- CVA 是未来方向，2025 起 Q-Grader 改用 CVA
- 两套并行的现状预计持续数年
- SCA 提供 Affective Score Calculator 做数值桥梁

## 六、与其他参考文件的关系

- 旧 100 分制见 [cupping.md](cupping.md)
- Q-Grader 见 [qgrader-complete-guide.md](qgrader-complete-guide.md)
- 认证全景见 [sca-certification.md](sca-certification.md)
- CVA 数据结构见 `data/sca_cva.json`

> 数据来源：sca.coffee/sca-news/sca-new-cva-cupping-standards-7ga28, sca.coffee/value-assessment。核实日期 2026-07-26。
