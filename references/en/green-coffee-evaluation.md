# Green Coffee Evaluation Guide

> Covers SCA green-coffee grading + defect classification + screen size + moisture content. A complete reference for the Q-Grader green-coffee grading exam and sourcing QC.
>
> **Beginner wording**: When buying green coffee, check size, defects, and moisture. Specialty grade = 0 primary defects + <=5 secondary defects (350g sample).

## 0. Purpose of green-coffee evaluation

Sourcing pricing / QC / Q-Grader exam / pre-roast. SCA green-coffee grading is the base language of the specialty-coffee industry.

## 1. SCA screen-size (mesh) system

| Mesh | mm | Note |
|------|----|------|
| 20 | 8.0 | extra-large bean |
| 18 | 7.10 | common specialty lower bound |
| 17 | 6.65 | common |
| 16 | 6.20 | common |
| 15 | 5.75 | accepted by some origins |
| 14 | 5.30 | too small |

**Origin differences**: Kenya large (18+), Yemen small (14-15), Central America mostly 16-18.

## 2. Moisture content and water activity

| Metric | Standard | Ideal |
|--------|----------|-------|
| Moisture content | 10-12% | 10.5-11.5% |
| Water activity (aw) | <= 0.7 | < 0.6 |

**Measurement**: oven method (precise but slow) / capacitive moisture meter (fast, common) / aw meter.

Too high moisture -> mold risk; too low -> brittle beans, flavor loss.

## 3. SCA defect classification

### Primary defects (5 = downgrade)

| Defect | Appearance | Cause |
|--------|------------|-------|
| Full black | >50% black | over-heat / fungus |
| Full sour | >50% yellow-brown | over-fermentation |
| Pods / dried fruit | unhulled | poor huller calibration |
| Severe insect damage | >=3 holes | storage pests |
| Fungus damage | white/yellow mold | high-humidity storage |
| Large foreign matter | stone / twig / metal | picked up at harvest |

### Secondary defects (5 of same = 1 primary equivalent)

Partial black / partial sour / shell bean / broken chip / residual husk / parchment / mild insect / floaters.

See `data/defect_beans.json` and MCP tool `get_defect_bean`.

## 4. SCA grade table

| Grade | Primary defects | Secondary equivalent |
|-------|-----------------|----------------------|
| Specialty | 0 | <=5 |
| Premium | 0 | <=8 |
| Exchange | <=1 | <=12 |
| Below Standard | <=1 | <=30 |
| Off Grade | >1 or >30 | - |

Use the MCP tool `get_green_grade(primary_count, secondary_count, screen_size, moisture_pct)` for automatic grading.

## 5. Q-Grader green-coffee grading exam points

- 350g sample, time limit (usually 3 boxes x 20 min)
- Must pick out and classify all defects
- Count defect points and determine grade
- Pass only if consistent with the examiner

## 6. Relationship to other reference files

- Defect classification: `data/defect_beans.json`
- Pre-roast: [parameters-guide.md](parameters-guide.md)
- Cupping: [cupping.md](cupping.md)
- Q-Grader overview: [qgrader-complete-guide.md](qgrader-complete-guide.md)

> Data source: sca.coffee/store/green-coffee-defect-handbook. Verified 2026-07-26.
