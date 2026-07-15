# English reference mirrors (references/en/)

Bilingual mirrors of the Chinese reference files. Each English mirror preserves
the original author's online-verified numbers (cupping ratios, SCA dimensions,
grinder steps, flavor wheel groups, sensory-solution recipes, water TDS, etc.).

> The Chinese originals remain the full source of truth under `references/` (one
> level up). The English mirrors are a convenience for international agents/users.

## Currently translated (8 / 15)

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

All 8 high-international-value core files are translated. The remaining 7 are
CN-specific and add little for an English reader; translation is deferred.

## Not yet translated (7) -- see references/ (Chinese) originals

| File | Topic | intl. value |
|------|-------|------|
| pressure-profiles.md | pressure-profile machine index + live-lookup prompts | medium (CN brands/lists) |
| equipment-profiles.md | common machine/grinder/equipment profiles | medium |
| learning-resources.md | tiered resources + SCA certs + barista directory | medium (CN resources) |
| glossary.md | beginner jargon-ban list + plain swaps | low (CN-centric) |
| search-queries.md | live-search query templates | low (CN templates) |
| example-dialogues.md | sample conversations (8 scenarios) | low (CN) |
| eval-cases.md | eval cases (21) | low (CN) |

> Low-value files are CN-specific (community resources, CN-language dialogues/
> eval cases); translating them faithfully adds little for an English reader and
> is deferred. The medium-value remaining files (pressure-profiles,
> equipment-profiles, learning-resources) can be added on request.

## Notes for translators expanding this set
- Use plain ASCII where possible; avoid em/en dashes (use `--`), write temps as
  `93C` (not the degree symbol) to keep PowerShell/docs tooling happy.
- Preserve every number from the Chinese original (doses, temps, times, ratios,
  SCA points) -- they were online cross-checked by the original author.
