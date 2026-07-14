# 联网检索查询模板

> 用户**点名某咖啡师/咖啡馆/比赛配方**或**想尝试变压萃取**时，用本文件中的模板拼接查询，再做 WebSearch / WebFetch。
> **未点名、未提变压时不要联网**，直接用 `recipes-baseline.md` 内置起步参数。

## 一、变压萃取

### 通用模板
```
{brand} {model} pressure profile
{brand} {model} pressure profile reddit
{brand} {model} pressure profile home-barista
{brand} {model} 变压 萃取 曲线
{brand} {model} 变压 论坛
```

### 按品牌细分
| 品牌 | 优先搜索词 |
|------|------|
| Decent | `site:decentespresso.com {model} profile` / `decent {model} pressure profile shallow roast` |
| La Marzocco | `la marzocco {model} pressure profile reddit` / `{model} paddle profile home-barista` |
| Slayer | `slayer {model} paddle profile reddit` |
| Modbar | `modbar pressure profile` |
| Lelit | `lelit bianca pressure profile reddit` / `lelit {model} flow control` |
| Ascaso | `ascaso steel duo pid pressure profile` |
| Breville/铂富 | `breville dual boiler pressure profile hack` / `breville {model} 变压 改装` |
| Profitec | `profitec pro 700 pressure profile` |
| Rocket | `rocket r58 pressure profile home-barista` |

### 按豆类细分
- 浅烘 SOE：`{brand} {model} pressure profile SOE light roast`
- 中深烘：`{brand} {model} pressure profile medium dark blend`
- 深烘：`{brand} {model} pressure profile dark roast chocolate`

### 来源优先级
1. 品牌官方论坛/用户群（Decent 论坛、La Marzocco 社区、Breville 社区、Home-Barista、Reddit r/coffee）
2. YouTube 频道（Hoffmann、James Hoffmann、Leviathan、Decent Videos）
3. 中文社区：小红书、B站、知乎、微信公众号（中文用户案例多）
4. 商业评测：Whole Latte Love、Seattle Coffee Gear、Clive Coffee

---

## 二、名家配方（手冲）

### 国际
| 咖啡师 | 检索词 |
|------|------|
| Tetsu Kasuya 粕谷哲 | `Tetsu Kasuya 4:6 method V60 recipe` / `粕谷哲 4:6 法 配方` |
| James Hoffmann | `James Hoffmann ultimate v60 technique recipe` / `Hoffmann 终极 V60 法` |
| Matt Perger | `Matt Perger v60 recipe` |
| Tim Wendelboe | `Tim Wendelboe v60 recipe` |
| Scott Rao | `Scott Rao v60 recipe` |
| World Barista Championship 冠军 | `WBC winner {year} recipe method` / `WBC {年份} 冠军 配方` |
| World Brewers Cup 冠军 | `WBrC winner {year} recipe` / `世界冲煮赛 {年份} 配方` |
| Sasa Sestic | `Sasa Sestic recipe` |
| Hugh Kelly | `Hugh Kelly recipe` |

### 国内
| 咖啡师/咖啡馆 | 检索词 |
|------|------|
| 李冬（"李冬咖啡"） | `李冬 手冲 配方` / `李冬 咖啡 烘焙` |
| %Arabica | `%Arabica recipe v60` / `%Arabica 配方` |
| Blue Bottle 蓝瓶 | `Blue Bottle recipe pour over` / `蓝瓶咖啡 配方` |
| Manner | `Manner 手冲 配方` / `Manner 单一产地` |
| 永璞 / 三顿半 / 时萃 | `永璞 咖啡 配方` / `三顿半 手冲` |
| 国产精品烘焙商（少数派/治光师/豆叔/啟程拓殖） | `少数派 咖啡 冲煮 建议` / `治光师 烘焙 冲煮` |
| 张仲僖 / 林子扬 / 其他 WBC 中国区代表 | `WBC 中国区 配方 {年份}` |

---

## 三、名家配方（意式 / 特调）

| 关键词 | 检索 |
|------|------|
| SOE 拿铁 | `SOE latte recipe {roaster}` / `SOE 拿铁 配比` |
| Flat White 起源 | `flat white origin recipe` |
| 油条拿铁 / 麻薯拿铁 | `{咖啡店} 特调 配方` |
| Dirty | `dirty coffee recipe 配方` |
| 椰云拿铁 | `椰云拿铁 配方 自制` |
| Affogato | `affogato recipe homemade` |
| Espresso Martini | `espresso martini recipe` |

---

## 四、磨豆机刻度

| 磨豆机 | 检索 |
|------|------|
| 1Zpresso JX-Pro / K-Plus | `1Zpresso {model} grind setting espresso v60` / `1Zpresso {model} 刻度` |
| Comandante C40 | `Comandante C40 grind setting espresso` |
| Timemore C2 / C3 / Chestnut X | `Timemore {model} grind setting` |
| Eureka Mignon | `Eureka Mignon Specialita grind setting espresso` / `Eureka Mignon 刻度` |
| Baratza Sette 270 | `Sette 270 grind setting espresso` |
| Niche Zero | `Niche Zero grind setting espresso` |
| Mahlkönig E65S | `Mahlkönig E65S grind setting espresso` |
| 手冲刻度 | `{grinder} pour over grind setting` |

---

## 五、咖啡豆特性查询

| 需求 | 检索 |
|------|------|
| 浅烘埃塞俄比亚 冲煮 | `ethiopia light roast pour over recipe` / `埃塞俄比亚 浅烘 手冲` |
| 瑰夏 Geisha 冲煮 | `geisha panama pour over recipe` |
| 厌氧处理 冲煮 | `anaerobic coffee pour over recipe` |
| 意式深烘拼配 | `italian dark roast espresso blend recipe` |
| SOE 拿铁 | `SOE latte recipe` |
| 冷萃 深烘 | `cold brew dark roast recipe` |

---

## 六、检索注意事项

- **优先英文**：咖啡社区以英文为主，中文资源少且零散。
- **加日期范围**：用 `after:2024-01-01` 等工具过滤掉过期内容。
- **加来源限定**：`site:home-barista.com` `site:reddit.com/r/coffee` `site:decentespresso.com` `site:youtube.com`。
- **检索后二次验证**：找到的方案再交叉验证（至少 2 个来源一致才可信）。
- **输出必须含**：
  - 适用器具 / 粉量 / 水量 / 水温 / 时间 / 研磨 / 手法
  - 变压含压力曲线阶段
  - 来源链接 + 获取日期
  - "网上的方案是参考，要按你自己的器具和口味微调" 提示
- **找不到时**：明确告诉用户"我查了 X、Y、Z 来源没找到具体方案"，并给一个**通用起步参数 + 联网社区推荐的检索建议**（让用户自己去找或换平台）。
