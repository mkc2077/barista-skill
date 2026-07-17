# 研磨校准卡 / Grinder Calibration Card

> 顾问帮用户校准磨豆机时输出本卡。
> Used when the consultant helps calibrate a grinder toward a target brew method.
> 结构化捕捉"方向 / 量 / 验证"三要素，避免误调多变量。

## 起点 / Starting point
- 磨豆机 / Grinder: {{grinder_model}}
- 当前刻度 / Current grind: {{current_grind}}
- 目标冲煮法 / Target method: {{target_method}}
- 参考档位 / Level reference: {{level_ref}}

## 方向 / Direction
{{direction}} — {{direction_reason}}
（**仅调方向**：加粗 / 调细 / 不变 / 换磨盘方向调整）

## 量 / Amount
- 调整步数 / Steps: {{steps}}（每次只调 {{step_size}}）
- 目标刻度 / Target grind: {{target_grind}}

## 验证 / Verification
- 用本粉量 / Using dose: {{verification_dose}}
- 萃取器具 / Basket/vessel: {{verification_setup}}
- 预期时间 / Expected time: {{expected_time}}
- 通过判据 / Pass criterion: {{pass_criterion}}

## 铁律提醒 / Iron rule
**不要**同时调粉量或水温。先验研磨，再判下一轮要不要动其它变量。
Do NOT also change dose or water temp. Verify grind first, then iterate.

---

## 示例 / Example

### DF64V -> 意式
起点: DF64V 标 30#（用户报"偏酸、30s 出 40g 偏快"）
方向: 调细 — 时间偏快且粉碗可见缝隙，欠萃信号
量: 调 2 格（30# → 28#），每格约 0.5 click
目标: 28#
验证:
- 粉量: 18g（不变）
- 器具: 标准 18g 粉碗 + VST 篮
- 预期时间: 25–28s / 36g
- 判据: 时间达标且酸甜均衡 = OK；时间太长 = 主因是粉量而非研磨，加粉而非再调细
