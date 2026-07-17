# Report Templates / 报告模板

顾问向用户**输出**结构化方案时复用本目录模板。模板用 `{{placeholder}}` 字段
标记由顾问在响应时填入的位置，**不是**由工具填充——其价值是结构化纪律而非数据。

The consultant **uses these templates** when presenting structured output to
users. Placeholders (`{{placeholder}}`) are filled by the consultant at
response time. Their value is structural discipline, not data.

## 借鉴来源 / Inspiration

借鉴自 audit skill「确定性替代 LLM 临场编造」的设计思路：把顾问四个
固定输出形态固化成模板，降幻觉、降每段重复格式成本。模板本身是
Markdown，可在任何 chat 后端直接渲染。

Borrowed from an audit skill's design principle of replacing LLM improvisation
with deterministic templates: by fixing the consultant's four recurring output
shapes, we lower hallucination and the cost of formatting every reply from
scratch.

## 候选模板 / Available templates

| 文件 / File | 用法 / Use case | 关键 placeholders |
|---|---|---|
| `recipe_card.md` | 给完整冲煮配方 | equipment, method, dose, water, ratio, temp, grind, time, technique, expected_flavor |
| `diagnosis_sheet.md` | 风味问题的最终观察+单变量动作+验证 | symptom_description, var1/2/3, primary_var, change, verification, expected_change, fallback_step |
| `cupping_scorecard.md` | SCA 100 分杯测评分 | bean, roast, cupper, date, 10 dimensions × (score+notes), total, grade |
| `grinder_calibration.md` | 研磨机校准方向+量+验证 | grinder_model, current_grind, target_method, direction, steps, target_grind, expected_time |

## 用法 / Usage from SKILL.md

| 触发场景 / Trigger | 模板 / Template |
|---|---|
| 用户要配方 / `get_recipe` 输出 / "怎么冲" | `recipe_card.md` |
| 追问链收尾给观察+动作 / `diagnose_flavor` 输出 / "为什么不好喝" | `diagnosis_sheet.md` |
| 杯测评分 / `calculate_cupping_score` 输出 | `cupping_scorecard.md` |
| 校准磨豆机 / `calibrate_grinder` 输出 / "调几格" | `grinder_calibration.md` |

## 铁律 / Iron rule

每个模板都遵守顾问的核心交互原则：**单变量**（一次只改一个变量）+
**验证**（每次改动都附检验方式 + 预期变化 + 无变化时的下一步）。
Every template enforces the consultant's core rule: change ONE variable,
verify after every change.
