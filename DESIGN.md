# Barista — Design Context (v7)

> 设计上下文 / design contract。本文件是 UI 改动的**第一参考**：动手前先读，
> 审计时逐条对照。产品定位：**product，不是 brand**（impeccable 的区分）。
> 面向：家庭冲煮玩家（一号用户）+ 职业咖啡师/备考者（延展层）。

---

## 0. 设计读法（Design Read）

**"咖啡师的工作台，不是咖啡店菜单。"** 工具质感优先于装饰：信息密度高但克制，
材质真实（纸感/金属/油墨），氛围安静（咖啡馆白噪音，不是酒吧灯光）。

- 现有系统基线：v6.0「Full Rebuild」已实现大部分反 AI 俗套规则（见 §3 现状清单）
- v7 增量 = 文档化 + 补漏（弹簧物理、彩底灰字、滚动监听、骨架屏），**不推倒换肤**
- **调色板（2026-08-05 已定）**：**Terracotta + Slate**（暖陶土强调 + 冷板岩/石墨底），
  已落地 `globals.css` 两套主题 token：浅色=暖灰纸感（hue 250）、深色=石墨（hue 260），
  强调色统一陶土（oklch hue 40）——避开咖啡类默认的 cream/brass/espresso 盘

---

## 1. 反参考（Anti-references）——本项目禁止出现

来自 taste-skill 与 impeccable 的原文规则（逐条可溯源）：

| # | 规则 | 来源 |
|---|------|------|
| 1 | 禁 AI 默认组合：紫色渐变、居中 hero + 深色网格背景、三等分特性卡片、到处玻璃拟态、无限循环微动画、Inter + slate-900 | taste-skill SKILL.md L39 |
| 2 | **默认禁用 Instrument_Serif / Fraunces**（LLM 最爱显示衬线）；本项目例外已论证：编辑气质（editorial）是产品基调，v6.0 明确选型 | taste-skill L180 |
| 3 | serif 不得作为整体默认字体；无衬线 display 才是默认 | taste-skill L174-178 |
| 4 | 强调词用**同族字体的粗体/斜体**，禁止在无衬线标题里塞衬线单词混排 | taste-skill L179 |
| 5 | 图标默认禁用 lucide-react（优先 @phosphor-icons/react）；**本项目接受偏差**：lucide 已装且全仓在用，迁移 30+ 文件的收益 < 成本，记为技术债 | taste-skill L141-142 |
| 6 | 禁 **卡片套卡片**（never nest cards inside cards）——一层 surface 层级一个元素 | impeccable distill.md L54 |
| 7 | 禁**彩底灰字**（never gray on color）：彩底上用该色更深的同色相或透明度 | impeccable quieter.md L57 |
| 8 | 禁 window scroll 监听（每帧触发、jank）；用 CSS scroll-driven animations 或 IntersectionObserver | taste-skill L511 |
| 9 | loading 用**骨架屏**（贴合最终布局形状），禁通用圆形 spinner | taste-skill L221 |
| 10 | 动效一律**弹簧物理** `type: spring, stiffness: 100, damping: 20`，禁 linear easing；信息型区块保持静止，不每卡无限循环 | taste-skill L358 |
| 11 | 反居中偏向：`DESIGN_VARIANCE > 4` 时禁 centered hero，用分屏/左对齐/不对称留白 | taste-skill L210 |
| 12 | 单强调色系：每主题一个色相家族，禁多色渐变混搭 | v6.0 globals.css 内建 |

---

## 2. 调色板与令牌（Tokens）

现有 `globals.css` 的语义变量即令牌源（`--page / --surface / --text* / --accent* / --border* / --user-bubble ...`），
**组件必须引用变量，禁止硬编码色值**。新增 token 必须先加变量再加使用。

- 主题：`.theme-light`（Light Slate 暖灰纸感）+ `.theme-dark`（Dark Slate 石墨），主题切换经 `ThemeSwitcher`
- 强调色：单色相陶土（oklch hue 40；浅色 58% 0.17，深色 70% 0.16）
- 文字层级：text / text-secondary / text-muted / text-faint 四级，全部 oklch 明度递减（hue 260 冷灰）
- 材质：电影颗粒（--grain-opacity 0.018）+ 阴影分层（ambient/sm/md/lg）
- **审计门禁**：`scripts/self_check.py` [7.1] 扫描 tsx/ts 中硬编码 hex 与 oklch()（白名单仅 ThemeSwitcher 两枚有意镜像）

## 3. 字体与排版

- 显示/标题：Instrument Serif（editorial 例外，§1#2 已论证）；正文：Inter + PingFang；
  等宽（指标/时间戳/终端）：JetBrains Mono
- 强调：同族粗体/斜体（§1#4）
- 数字/参数一律等宽展示（咖啡参数表格的"仪表感"）

## 4. 审计清单（每次 UI 改动自检）

1. 色值是否全部走 CSS 变量？硬编码 hex/oklch → 打回
2. 有无卡片套卡片？一层 surface 一个元素
3. 有无彩底灰字？彩底文字用同色相深色或透明
4. 动效是否弹簧物理？有没有给信息型元素加无限循环动画？
5. loading 是骨架屏还是 spinner？
6. 有没有 window scroll 监听？
7. 有没有居中 hero 滥用（VARIANCE>4 时）？
8. 图标新增是否沿用了现有图标家族？（保持 lucide，见 §1#5 技术债）

## 5. 技术债与豁免（明确记录，防止悄悄回潮）

- **lucide 图标家族**：接受偏差，记入 v7 待办（迁移 @phosphor-icons/react 或保持）
- **react-bits 动效组件**：精选落地中（BlurText 类标题入场等），落地时遵循 §1#10 弹簧物理
