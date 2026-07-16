# English reference mirrors (references/en/)

Bilingual mirrors of the Chinese reference files. Each English mirror preserves
the original author's online-verified numbers (cupping ratios, SCA dimensions,
grinder steps, flavor wheel groups, sensory-solution recipes, water TDS, etc.).

> The Chinese originals remain the full source of truth under `references/` (one
> level up). The English mirrors are a convenience for international agents/users.

## Currently translated (13 / 17)

| File | Topic | Intl. value |
|------|-------|------|
| recipes-baseline.md | 14 brew methods + 11 classic milk drinks (starter params) | high |
| troubleshooting.md | decision trees: espresso / pour-over / grinder / milk foam | high |
| parameters-guide.md | golden-cup theory + tuning by origin/variety/process/roast/taste | high |
| cupping.md | SCA cupping protocol + 100-point scoring + deductions | high |
| sensory.md | tasting method + flavor->tune map + flavor vocabulary + wheel + sensory training | high |
| grind-calibration.md | particle-size theory + multi-grinder calibration (C40/EK43/Eureka) | high |
| beans.md | label reading / bean selection / freshness & storage | high |
| water-quality.md | TDS/hardness/pH + home-water guidance | medium |
| equipment-profiles.md | espresso machines, grinders, brew gear profiles + combo recommendations | medium |
| pressure-profiles.md | pressure-profile machine index + live-lookup prompts + curve templates | medium |
| champion-brewing.md | champion brewing index + dripper/filter-paper recipes (V60/Origami/Kasuya model) & champion dripper map | high |
| craft-coffee.md | craft coffee as a standalone category: base specs + tea base + homemade syrup SOP + store-bought list + full build SOP | high |
| learning-resources.md | curated coffee learning resources by stage + SCA cert system + searchable barista directory | medium |

All 8 high-value core files + 2 medium-value gear files + 3 indexes/guides
(champion-brewing, craft-coffee, learning-resources) are translated. The remaining 4 are CN-specific (jargon glossary, search templates, sample dialogues,
eval cases) and translate to little for an English reader; deferred.

## Not yet translated (4) -- see references/ (Chinese) originals

| File | Topic | Intl. value |
|------|-------|------|
| glossary.md | beginner jargon-ban list + plain swaps | low (CN-centric) |
| search-queries.md | live-search query templates | low (CN templates) |
| example-dialogues.md | sample conversations (8 scenarios) | low (CN) |
| eval-cases.md | eval cases (21) | low (CN) |

> The remaining 4 are CN-specific (Chinese jargon-ban glossary, Chinese search templates, 8 CN-language sample dialogues, 21 CN eval cases); translating them to English adds little for an English reader and is deferred. The high/medium-value files are all now mirrored.

## Notes for translators expanding this set
- Use plain ASCII where possible; avoid em/en dashes (use `--`), write temps as
  `93C` (not the degree symbol) to keep PowerShell/docs tooling happy.
- Preserve every number from the Chinese original (doses, temps, times, ratios,
  SCA points) -- they were online cross-checked by the original author.
