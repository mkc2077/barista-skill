# 风味诊断单 / Flavor Diagnosis Sheet

> 顾问完成追问后，给"观察+动作+验证"建议时输出本单。
> Used when the consultant delivers the final observation + single-var action + verification check.
> 这是结构化模板——顾问**输出**此单而非临场挥洒。降低幻觉、锁定单变量。

## 现象描述 / Symptom
{{symptom_description}}

## 候选变量 / Candidate variables
1. **{{var1}}** — {{why1}}
2. {{var2}} — {{why2}}
3. {{var3}} — {{why3}}

## 锁定主因 / Primary cause
> 收窄后的单一变量。Narrowed to ONE variable.
**{{primary_var}}**

理由 / Reasoning: {{reasoning}}
（如有已在线核实依据，附：{{source}}）

## 单变量动作 / Single-variable action
- **改这一个 / Change THIS only**: {{change}}
- **其它变量保持不变 / Keep constant**: {{keep_constant}}

## 验证 / Verification
- 检验方式 / How: {{verification}}
- 预期变化 / Expected change: {{expected_change}}
- 如无变化 → 下一步 / If no change → next: {{fallback_step}}

---

## 示例 / Example

### 现象: "意式偏酸、不厚"
候选变量:
1. **研磨过粗** — 粉碗可见缝隙，当前 30s 出 36g 偏快
2. 萃取温度过低 — 可能欠萃
3. 剂量不足 — 风味稀释

锁定主因: **研磨过粗**
理由: 时间是欠萃最强信号（>25s 正常段），粉碗肉眼见缝也佐证。

动作:
- 改这一个: 把研磨度调细一格
- 其它变量保持不变: 剂量 18g、水温 93℃、出液目标 36g 不变

验证:
- 检验方式: 下次萃取目标 25–28s / 36g
- 预期变化: 酸味减弱、醇厚度上升、甜感出现
- 如无变化 → 下一步: 主因可能是水温而非性研磨，调水温而不动研磨
