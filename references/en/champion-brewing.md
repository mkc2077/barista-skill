# Champion brewing recipes index

> Iron rule: This file only provides "verified champion name + competition title + core method name." Any specific number (dose/temp/ratio/time) MUST be re-verified online against the champion's current public recipe before you write it into a reply. Always append a source link + retrieval date.
> Champions iterate methods year by year; competition recipes differ from home recipes. Always verify before advising.

## 1. SCA brewing & Golden Cup (calibrate first)

- **Golden Cup**: extraction yield 18–22%, TDS 1.15–1.35%, brew ratio 1:18–1:19 (pour-over often wider, 1:14–1:17). See [parameters-guide.md](parameters-guide.md) section 1.
- **WBrC (World Brewers Cup)**: two services — Open Service (competitor's own beans + chosen recipe) and Compulsory Service (organizer-supplied beans + blind brew). Scored on flavor, technique, and presentation.
- **Resting (degassing)**: light roast 7–15 days, medium-dark 5–10 days (general range; verify per bean with roaster).

## 2. Champion brewing index (online search starting points)

> The table below is a search starting point; before advising, re-query that champion's current recipe by machine / bean / roast.

### 1. Tetsu Kasuya — the 4:6 method
- Title: 2016 WBrC World Champion (first Asian pour-over world champion).
- Core: split total water into **front 40% (controls acidity/sweetness) + back 60% (controls strength/body)**.
- Standard baseline (most-circulated online version; verify before use): 20g dose / 300ml total / 1:15; front 40% = 120ml (e.g. 60ml x2), back 60% = 180ml (e.g. 60ml x3); coarse grind.
- Tuning logic (verified points):
  - Too sour/sharp → reduce front-40% pulses (3->2 or 2->1) for more concentrated extraction and earlier sweetness.
  - Too thin/weak → make back-60% more concentrated (fewer pulses, larger pours) for faster strength build-up.
  - Overall strength → move brew ratio first (1:16 brighter, 1:14 fuller).
  - Change one variable at a time; order: pulses -> ratio -> temp/grind.
- Book: "The Simple, Powerful Way to Brew Delicious Coffee: 4:6 Method" (2023).
- Search: `Tetsu Kasuya 4:6 method` / `Kasuya 4:6 ratio pour over`.

### 2. Chad Wang — VWI by CHADWANG
- Title: 2017 WBrC World Champion.
- Core: high brew ratio, long extraction, combined immersion/stable temp control for clarity and layering.
- Search: `Chad Wang VWI brew recipe` / `VWI by CHADWANG signature`.

### 3. Du Jianing / "Douzi" — UNiUNi
- Title: 2019 WBrC World Champion (Boston); **first World Coffee Championships winner from China**.
- Method points (verified online): UNiUNi, Nanjing; rebuilt her routine after 8th place in 2018; had judges taste before presenting info ("taste first, talk later"); technique included grinding beans twice for fines/extraction and brewing an extra cup to share with judges.
- Source starting point: Barista Magazine interview.
- Search: `Du Jianing World Brewers Cup 2019 routine` / `UNiUNi brew recipe`.

### 4. Berg Wu — "Three-temperature" pour-over (san-yu-wen)
- Title: 2016 WBC World Barista Champion; Simple Kaffa co-founder.
- Method: three different water temperatures across one brew.
- Public demo points (circulated version; verify before use): Ethiopian washed / 16g / 240g; Clever dripper; 30s bloom; first stage near-boiling water, add cold water to drop to ~88–93C as it nears dripping; second stage pour to 200g; remove lower pot, add cold water to ~80–85C; final 40g steep 20s. Warmer drop = brighter acidity; cooler drop = heavier sweetness.
- Search: `Berg Wu three temperature pour over` / `Simple Kaffa brew`.

### 5. Sherry Hsu — 2022 WBrC Champion
- Title: 2022 WBrC World Champion.
- Search: `Sherry Hsu World Brewers Cup 2022` / `Hsu Brewers Cup signature`. Verify current public recipe before quoting.

### 6. George Jingyang Peng / "Captain George" — 2025 WBrC Champion (latest)
- Title: 2025 WBrC World Champion (latest edition); brand "Captain George", Guiyang.
- Core philosophy: "Temperature" — from roast curve to brew curve, temperature as the axis.
- Path (verified): 2016 TAKAO Taiwan international roasting champion; WBrC since 2018; two world-stage appearances (Athens, Jakarta); 40 days of prep in Jakarta.
- Search: `George Jingyang Peng Brewers Cup 2025` / `Captain George coffee Guiyang`. Verify competition recipes/interviews before quoting.

### 7. Andrea Allen — Onyx Coffee Lab
- Title: 2020 US Barista Champion; 2021 WBC runner-up.
- Shop: Rogers, Arkansas. Search: `Andrea Allen Onyx Coffee Lab recipe` / `Onyx signature drink`.


## 3. Other searchable champions (search starting points; verify numbers yourself)

| Name | Title | Search |
|------|------|------|
| Matt Winton (Switzerland) | 2021 WBrC Champion | `Matt Winton Brewers Cup 2021` |
| Diego Campos (Colombia) | 2021 WBC Champion | `Diego Campos World Barista 2021` |
| Li Zhen / CoffeeBuff | 2020 WBrC China Champion | `Li Zhen CoffeeBuff brew` |
| GABEE. (Lin Dong-yuan) | First WBC Taiwan Champion | `GABEE signature` |

## 4. Search phrases

See [search-queries.md](search-queries.md). Quick reference:
```
{champion name} {method name} brew recipe
{champion name} World Brewers Cup {year} routine transcript
site:youtube.com {champion name} brew demo
```

## 5. Output format for advice

After fetching a specific recipe online, present it as:

```markdown
**Champion**: {name} ({title/year})
**Beans**: {origin/roast/blend}
**Dose**: {g}  **Total water**: {g} ({ratio})  **Temp**: {C}
**Method/steps**:
- {stage}  {water/time}  {notes}
- ...
**Total time**: {s}s
**Source**: [{title}]({url}), retrieved {YYYY-MM-DD}
**Beginner version** (beginners only): "{plain language}"
```

Always append:
> "Champion recipes are references — dial in to your own gear and taste. For tuning principles see the skill's iron rules."

## 6. Common pitfalls

- Don't copy competition recipes directly — competition beans, grinder, water differ from home; run a baseline comparison.
- Don't remember the name but forget the version — the same person's recipe changes a lot year to year; always search with the year.
- Don't treat "world-changing" methods as unchanging truth — 4:6 and three-temperature are adjustable frameworks, not the only solution.
- Don't fabricate numbers from a name — every dose/temp/ratio must come from online verification.
- Do start with a generic baseline, then layer one champion technique by changing one variable.
