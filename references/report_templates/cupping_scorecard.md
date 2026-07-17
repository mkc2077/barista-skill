# SCA 杯测评分单 / SCA Cupping Scorecard

> 用户做 SCA 100 分杯测时，顾问帮用户记录结构化评分结果时输出本单。
> Used when scoring a coffee by SCA 100-pt protocol across 10 dimensions.

## 豆样 / Sample
- 豆 / Bean: {{bean}}
- 烘焙度 / Roast: {{roast}}
- 处理法 / Process: {{process}}
- 杯测人 / Cupper: {{cupper}}
- 日期 / Date: {{date}}

## 10 维评分 / Ten-dimension scores

评分区间 6–10（步长 0.25；7.00 = 商用；8.00 = 进阶精品；9.00+ = 卓越精品）。

| 维度 / Dimension | 评分 / Score | 备注 / Notes |
|---|---|---|
| 香气（干） / Fragrance (dry) | {{fragrance_dry}} | {{fragrance_dry_notes}} |
| 香气（破壳） / Fragrance (break) | {{fragrance_wet}} | {{fragrance_wet_notes}} |
| 风味 / Flavor | {{flavor}} | {{flavor_notes}} |
| 余韵 / Aftertaste | {{aftertaste}} | {{aftertaste_notes}} |
| 酸度 / Acidity | {{acidity}} | {{acidity_notes}} |
| 醇厚度 / Body | {{body}} | {{body_notes}} |
| 平衡 / Balance | {{balance}} | {{balance_notes}} |
| 一致性 / Uniformity (×5) | {{uniformity}} | {{uniformity_notes}} |
| 干净度 / Clean Cup (×4) | {{clean_cup}} | {{clean_cup_notes}} |
| 甜度 / Sweetness (×4) | {{sweetness}} | {{sweetness_notes}} |
| 整体印象 / Overall | {{overall}} | {{overall_notes}} |

## 总评 / Total
- **总分 / Total: {{total}} / 100**
- 等级 / Grade: {{grade}}

### 等级说明 / Grade key
- ≥85: outstanding specialty / 卓越精品
- 80–84: specialty / 精品
- <80: below specialty / 商用以下
- 任一单项 <6 或 >10: **out of range**（提示评错或样品异常，重测）

## 关键评语 / Cupper notes
{{notes}}

---

## 示例 / Example

### 耶加雪菲水洗 / 桃花香
- 豆: 耶加雪菲 G1 水洗
- 烘焙: 中浅
- 杯测人: 陈凡
- 日期: 2026-07-17

| Dimension | Score | Notes |
|---|---|---|
| 香气（干） | 8.25 | 桃子、茉莉 |
| 香气（破壳） | 8.50 | 强烈花香 |
| 风味 | 8.50 | 桃、柑橘、白花 |
| 余韵 | 8.25 | 清甜、长 |
| 酸度 | 8.50 | 明亮、柑橘 |
| 醔厚度 | 7.75 | 中等、茶感 |
| 平衡 | 8.25 | 酸甜均衡 |
| 一致性 | 9.00 | 三杯一致 |
| 干净度 | 9.00 | 无杂味 |
| 甜度 | 9.00 | 明显甜感 |
| 整体印象 | 8.50 | 优雅典型耶加 |

总分: 84.75
等级: specialty（70–79 low / 80–84 specialty / 80–84 high specialty）
