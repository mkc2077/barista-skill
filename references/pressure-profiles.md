# 变压萃取（Pressure Profiling）

> **铁律：变压萃取的具体压力/时间数字必须联网核实，本文件只提供"机型索引 + 检索话术"。**
> 任何凭记忆编造的具体压力值都视为违反本技能协议。

## 零、什么是变压
- 标准意式：固定 9 bar 左右匀速萃取。
- **变压**：在萃取过程中按时间分段控制压力（如低压预浸润 → 高压主萃 → 降压收尾），以放大或压制某些风味。
- **为什么变**：浅烘 SOE 想拉甜感与香气，常用"低-高-低"曲线；深烘想压苦，常用"高-中-低"曲线。

## 一、用户判断
**先问清两件事再展开**：
1. **咖啡机品牌型号**（决定有没有变压功能、是哪一代控制板）
2. **豆子**（烘焙度 + 是否 SOE / 拼配，决定曲线方向）

若用户机器**无变压功能**（如普通德龙、惠家 KD-510/410、铂富 Barista 系列基础款、辣妈 Linea Mini 默认固件等），直接说明："你的机器不支持变压，我给你标准 9 bar 的方案；想试变压曲线要换带变压的机器（如 Decent / Slayer / La Marzocco 带 Profile 固件 / Modbar / 部分 Lelit Bianca / Ascaso Steel Duo PID 等）。"

> **对齐 SKILL「铁律」**：某些机型（如部分国行 Breville Dual Boiler）的变压能力需刷机/改装固件才能获得——本技能**不推荐用户自行刷机/改装**，以免影响保修或引发故障；建议直接选原生带变压的机型，或联系官方渠道。

## 二、变压功能机型索引（联网检索起点）

| 品牌 | 代表机型 | 变压方式 | 优先检索来源 |
|------|------|------|------|
| **Decent** | DE1 / DE1XL / DE1PRO | 原生曲线编辑，触摸屏自定义 | decent-espresso.com 论坛、decentespresso.com |
| **La Marzocco** | Linea Mini（带 Profile 固件）、Strada、Leva | 拨杆/电子（看代次） | home-barista.com、Reddit r/coffee、LM 用户群 |
| **Slayer** | Slayer Single Group / Espresso | 拨杆控压 | slayerespresso.net、home-barista.com |
| **Modbar** | Modbar / Pal | 拨杆 + 电子 | home-barista.com |
| **Lelit** | Bianca（带 PID + 拨杆）、Mara X（部分固件） | 拨杆 | lelit.com 论坛、Reddit r/lelit |
| **Ascaso** | Steel Duo PID | 数字压力曲线（App） | ascaso.com |
| **Breville / 铂富** | Oracle / Dual Boiler（部分国行带 Profile 固件需刷机） | App / 固件 | breville.com 论坛、seattlecoffeegear.com |
| **咖啡邮差 / 其他国产** | 各家支持变压的型号 | 多为 App 控制 | 各品牌小红书/B站/微信公众号 |
| **Profitec** | Pro 700（部分版本）、Pro 800 | 改装 + 拨杆 | home-barista.com |
| **Rocket** | R58 / R60V | 拨杆 | home-barista.com |

> **注**：以上"变压"判定会随固件更新变化。给建议时**先让用户确认机器面板/控制方式**，不要凭机型名一刀切。

## 三、起步曲线范例（仅供参考，**必须联网核实**）

### 1. 浅烘 SOE（花香果酸豆）
```
0–5s   2–3 bar  预浸润
5–20s  7–9 bar  主萃
20–30s 4–5 bar  收尾
总时长 28–32s, 粉 18g / 出液 36–40g
目标：拉甜感与香气，避免尖酸
```
> **新手转述**："先低压把粉'醒一下'，再升到高压把甜味压出来，最后降压收尾，喝起来更甜不酸。"

### 2. 中深烘拼配（拿铁基底）
```
0–3s   4 bar   预浸润
3–25s  9 bar   稳定主萃
25–30s 6–7 bar 收尾
总时长 28–32s, 粉 18g / 出液 36g
目标：醇厚、平衡、可压苦
```

### 3. 深烘（巧克力/糖蜜风）
```
0–3s   6 bar   预浸润
3–20s  8 bar   中压主萃
20–28s 5 bar   收尾
总时长 26–30s, 粉 18g / 出液 32–36g
目标：避免过萃发苦
```

> **这三个范例来自通用社区经验**，与具体机型/具体豆子仍有差距——**拿到后必须再查该机型 + 该豆子的对应曲线**。

## 四、检索话术

详见 [search-queries.md](search-queries.md) 的"变压萃取"段。简版：
```
{brand} {model} pressure profile shallow roast SOE
{brand} {model} 变压 萃取 曲线 浅烘
{brand} {model} pressure profile reddit
site:home-barista.com {brand} {model}
site:decentespresso.com pressure profile {bean type}
```

## 五、给建议的输出格式

联网拿到具体方案后，按以下结构呈现：

```markdown
**机型**：{brand} {model}
**豆子**：{origin/roast/blend}
**粉量**：{g}　**出液**：{g}（{ratio}）　**水温**：{℃}
**曲线**：
- 0–{s}s　{bar} bar　{阶段名}
- {s}–{s}s　{bar} bar　{阶段名}
- {s}–{s}s　{bar} bar　{阶段名}
**总时长**：{s}s
**手法补充**：{布粉方式、压粉力度、毛细/无毛细、滤纸 vs 无滤纸 等}
**来源**：[{title}]({url})，获取于 {YYYY-MM-DD}
**新手版转述**（仅在用户为新手时附加）："{大白话}"
```

并在末尾固定写：
> "网上的方案是参考，要按你自己的器具和口味微调。调整原则见技能铁律。"

## 六、常见误区

- ❌ **直接套别人的曲线**到自己机器——每台机器的水温稳定性、压力响应速度不同，必须做 1–2 杯对照。
- ❌ **改一个变量太多**（同时改粉量 + 曲线 + 粉碗）——分不清哪个起作用。
- ❌ **凭"看起来像"的压力值**编造——所有数字必须来自联网检索。
- ❌ **以为变压一定好喝**——同一支豆子在标准 9 bar 也可能更好喝；变压是工具不是目标。
- ✅ **先固定豆子，固定其他参数，只改压力段**，跑出 3 杯对比。
