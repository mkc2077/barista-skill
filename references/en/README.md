# English reference mirrors (references/en/)

Bilingual mirrors of the Chinese reference files. Translation is IN PROGRESS;
only the high-international-value core is here now. Each English mirror preserves
the original author's online-verified numbers (cupping ratios, SCA dimensions,
grinder steps, flavor wheel groups, sensory-solution recipes).

> The Chinese originals remain the full source of truth under `references/` (one
> level up). The English mirrors are a convenience for international agents/users.

## Currently translated (5 / 15)

| File | Topic |
|------|-------|
| recipes-baseline.md | 14 brew methods + 11 classic milk drinks (starter params) |
| troubleshooting.md | decision trees: espresso / pour-over / grinder / milk foam |
| parameters-guide.md | golden-cup theory + tuning by origin/variety/process/roast/taste |
| cupping.md | SCA cupping protocol + 100-point scoring + deductions |
| sensory.md | tasting method + flavor->tune map + flavor vocabulary + wheel + sensory training |

## Not yet translated (10) -- see references/ (Chinese) originals

| File | Topic | intl. value |
|------|-------|------|
| grind-calibration.md | particle-size theory + multi-grinder calibration (C40/EK43/Eureka) | high |
| beans.md | label reading / bean selection / freshness & storage | high |
| water-quality.md | TDS/hardness/pH + home-water guidance | medium |
| pressure-profiles.md | pressure-profile machine index + live-lookup prompts | medium |
| equipment-profiles.md | common machine/grinder/equipment profiles | medium |
| learning-resources.md | tiered resources + SCA certs + barista directory | medium (CN resources) |
| glossary.md | beginner jargon-ban list + plain swaps | low (CN-centric) |
| search-queries.md | live-search query templates | low (CN templates) |
| example-dialogues.md | sample conversations (8 scenarios) | low (CN) |
| eval-cases.md | eval cases (21) | low (CN) |

> Files marked low for international users are CN-specific (community resources,
> CN-language dialogues); translating them faithfully adds little for an English
> reader and is deferred. High-value remaining files (grind-calibration, beans,
> water-quality) can be added on request.

## Notes for translators expanding this set
- Use plain ASCII where possible; avoid em/en dashes (use `--`), write temps as
  `93C` (not the degree symbol) to keep PowerShell/docs tooling happy.
- Preserve every number from the Chinese original (doses, temps, times, ratios,
  SCA points) -- they were online cross-checked by the original author.
