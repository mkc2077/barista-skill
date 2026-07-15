# Pressure profiling

> ⚠️ Iron rule: All specific pressure/time numbers for pressure profiling MUST be verified online. This file only provides a "machine index + search phrases."
> Any pressure values fabricated from memory are considered a violation of this skill's protocol.

## 0. What is pressure profiling
- Standard espresso: fixed ~9 bar, steady extraction.
- Pressure profiling: controlling pressure in timed segments during extraction (e.g., low-pressure pre-infusion → high-pressure main extraction → declining-pressure finish) to amplify or suppress certain flavors.
- Why: Light-roast SOE benefits from "low-high-low" curves to draw out sweetness and aroma; dark roasts use "high-mid-low" to tame bitterness.

## 1. User triage
Always ask two things before diving in:
1. Machine brand & model (determines whether profiling is supported and which generation control board)
2. Beans (roast level + SOE or blend — determines curve direction)

If the user's machine lacks profiling (e.g., standard De Longhi, Welhome KD-510/410, Breville Barista base models, La Marzocco Linea Mini default firmware, etc.), state directly: "Your machine does not support pressure profiling. I'll give you a standard 9-bar recipe. To try profiling curves you'll need a profiling-capable machine (e.g., Decent / Slayer / La Marzocco with Profile firmware / Modbar / some Lelit Bianca / Ascaso Steel Duo PID, etc.)."

> Aligned with SKILL iron rule: Some machines (e.g., certain CN-region Breville Dual Boiler units) require firmware flashing/modding to unlock profiling — this skill does NOT recommend users flash/mod their own machines, as that may void warranty or cause faults; choose machines with native profiling support or contact official channels.

## 2. Profiling-capable machine index (online search starting points)

| Brand | Representative models | Profiling method | Priority search sources |
|------|------|------|------|
| Decent | DE1 / DE1XL / DE1PRO | Native curve editor, touchscreen customization | decent-espresso.com forum, decentespresso.com |
| La Marzocco | Linea Mini (w/ Profile firmware), Strada, Leva | Paddle / electronic (varies by generation) | home-barista.com, Reddit r/coffee, LM user groups |
| Slayer | Slayer Single Group / Espresso | Paddle pressure control | slayerespresso.net, home-barista.com |
| Modbar | Modbar / Pal | Paddle + electronic | home-barista.com |
| Lelit | Bianca (PID + paddle), Mara X (partial firmware) | Paddle | lelit.com forum, Reddit r/lelit |
| Ascaso | Steel Duo PID | Digital pressure curves (App) | ascaso.com |
| Breville | Oracle / Dual Boiler (some CN-region units with Profile firmware need flashing) | App / firmware | breville.com forum, seattlecoffeegear.com |
| Coffee Postman / other Chinese brands | Various profiling-capable models | Mostly App-controlled | Brand-specific Xiaohongshu/Bilibili/WeChat |
| Profitec | Pro 700 (some versions), Pro 800 | Mod + paddle | home-barista.com |
| Rocket | R58 / R60V | Paddle | home-barista.com |

> Note: The "profiling" designation above may change with firmware updates. When giving advice, ask the user to confirm the machine panel/control method first; don't judge purely by model name.

## 3. Starting curve examples (reference only, MUST verify online)

### 1. Light-roast SOE (floral/fruity beans)
```
0–5s   2–3 bar   Pre-infusion
5–20s  7–9 bar   Main extraction
20–30s 4–5 bar   Finish
Total 28–32s, dose 18g / yield 36–40g
Goal: Draw out sweetness & aroma, avoid sharp acidity
```
> Newbie translation: "Start with low pressure to 'wake up' the puck, then ramp up to high pressure to squeeze out the sweetness, finish with declining pressure — tastes sweeter, not sour."

### 2. Medium-dark blend (latte base)
```
0–3s   4 bar     Pre-infusion
3–25s  9 bar     Steady main extraction
25–30s 6–7 bar   Finish
Total 28–32s, dose 18g / yield 36g
Goal: Full-bodied, balanced, bitterness manageable
```

### 3. Dark roast (chocolate/molasses notes)
```
0–3s   6 bar     Pre-infusion
3–20s  8 bar     Medium-pressure main extraction
20–28s 5 bar     Finish
Total 26–30s, dose 18g / yield 32–36g
Goal: Avoid over-extraction bitterness
```

> These three examples come from general community experience; they still have gaps for specific machines and specific beans — after receiving them you MUST further search the curve for that machine + those beans.

## 4. Search phrases

See [search-queries.md](search-queries.md) "Pressure Profiling" section. Quick reference:
```
{brand} {model} pressure profile shallow roast SOE
{brand} {model} 变压 萃取 曲线 浅烘
{brand} {model} pressure profile reddit
site:home-barista.com {brand} {model}
site:decentespresso.com pressure profile {bean type}
```

## 5. Output format for advice

After fetching a specific recipe online, present it in this structure:

```markdown
**Machine**: {brand} {model}
**Beans**: {origin/roast/blend}
**Dose**: {g}　**Yield**: {g} ({ratio})　**Temperature**: {℃}
**Curve**:
- 0–{s}s　{bar} bar　{stage name}
- {s}–{s}s　{bar} bar　{stage name}
- {s}–{s}s　{bar} bar　{stage name}
**Total time**: {s}s
**Technique notes**: {distribution method, tamping force, puck screen vs none, filter paper vs none, etc.}
**Source**: [{title}]({url}), retrieved {YYYY-MM-DD}
**Newbie version** (attach only when user is a beginner): "{plain-language}"
```

And always append at the end:
> "Online recipes are references — dial in to your own gear and taste. For tuning principles see the skill's iron rules."

## 6. Common pitfalls

- ◆ Don't directly copy someone else's curve to your machine — every machine differs in temperature stability and pressure response speed; you must run 1–2 comparison shots.
- ◆ Don't change too many variables at once (dose + curve + basket simultaneously) — you won't know which one worked.
- ◆ Don't fabricate pressure values that "look about right" — all numbers must come from online search.
- ◆ Don't assume profiling always tastes better — the same beans may taste better at standard 9 bar; profiling is a tool, not a goal.
- ✓ Fix the beans, fix other parameters, only change pressure segments; run 3 comparison shots.
