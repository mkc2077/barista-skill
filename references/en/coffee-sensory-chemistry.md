# Coffee Chemistry & Sensory Mapping

> A systematic map of the key chemical components in coffee (acids / alkaloids / lipids / sugars / aromas) and their sensory experience mapping. The chemical basis for understanding extraction theory and flavor adjustment.
>
> **Beginner wording**: The sour, sweet, bitter, and aromatic notes in coffee all come from chemicals. Acids dissolve first, bitterness last, so extraction time affects taste.

## 0. Why chemistry basics matter

Understanding extraction theory / the underlying logic of flavor adjustment / the Q-Grader organic-acid exam. Chemistry turns "parameter tuning" from empiricism into evidence-based reasoning.

## 1. Organic-acid families

| Acid | Flavor | Source | Roast change |
|------|--------|--------|--------------|
| Citric | bright citrus acid | inherent in green bean | partly broken down at medium-dark |
| Malic | green-apple acid | inherent in green bean | decreases with roast |
| Tartaric | grape-like acid | inherent in green bean | relatively stable |
| Acetic | acetic; excess = defect | from fermentation | decreases with roast |
| Quinic | dark-roast bitter-astringent | chlorogenic-acid breakdown product | increases with roast |
| Chlorogenic | astringency source | inherent in green bean | breaks down into quinic + caffeic |

**Key reaction**: chlorogenic acid ->(roast)-> quinic acid + caffeic acid. This is the chemical root of light-roast sour-astringency vs dark-roast bitter-astringency.

## 2. Alkaloids and lipids

| Component | Flavor | Note |
|-----------|--------|------|
| Caffeine | bitter | roast level has minimal effect on caffeine (robusta ~2x arabica) |
| Trigonelline | breaks down to pyridine (caramel aroma) at medium roast | retains bitterness when light, produces aroma when medium |
| Lipids | body contribution | main source of espresso crema |

## 3. Carbohydrates and Maillard products

| Component | Flavor | Source |
|-----------|--------|--------|
| Melanoidins | dark-roast bitter-sweet + body | Maillard reaction products |
| Furans | caramel / nutty aroma | sugar caramelization |
| Pyrazines | roasted nutty aroma | Maillard reaction |

**Maillard window**: 140-170C, generating pyrazines / furans / melanoidins. This is the key to flavor formation during the "first crack" stage of roasting.

## 4. Compound dissolution order and extraction stages

| Stage | Compound | Taste | Timing |
|-------|----------|-------|--------|
| 1 | acids | fruity acid | first |
| 2 | lipids | body | next |
| 3 | sugars + melanoidins | sweetness | middle |
| 4 | carbs + tannins | bitter / astringent | last |

**Golden-cup range**: extraction yield 18-22%, TDS 1.15-1.35%.

## 5. Q-Grader organic-acid pairing exam

Q-Grader category 6 requires identifying 4 organic acids (citric / malic / tartaric / acetic).

**Self-mixed training solution**: add a known acid to very weakly brewed coffee and practice pairing identification. See [sensory.md](sensory.md) five-solution training.

## 6. Flavor-adjustment chemistry logic

| Problem | Chemical reason | Adjustment direction |
|---------|-----------------|----------------------|
| Too sour | under-extraction (acids dissolve first) | grind finer / raise temp / extend time |
| Too bitter | over-extraction (carbs dissolve last) | grind coarser / lower temp / shorten time |
| Astringent | excess chlorogenic acid (light roast + fine grind) | grind coarser / slightly raise roast level |

**Core logic**: acids dissolve first, carbs last. Under-extraction = more acid less bitter; over-extraction = more bitter less acid. The golden-cup range is the best balance of sour-sweet-bitter.

## 7. Relationship to other reference files

- Extraction theory: [parameters-guide.md](parameters-guide.md)
- Flavor adjustment: [troubleshooting.md](troubleshooting.md)
- Sensory training: [sensory.md](sensory.md)
- Flavor wheel: [sensory.md](sensory.md) section 4
- Chemistry data: `data/coffee_chemistry_sensory.json`

> Data source: sca.coffee/research, worldcoffeeresearch.org, baristahustle.com. Verified 2026-07-26.
