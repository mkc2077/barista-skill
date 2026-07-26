# SCA New CVA Assessment Guide

> SCA formally adopted CVA (Coffee Value Assessment) in Nov 2024, in four tables SCA-102~105. This guide is based on the sca.coffee official announcement and the Affective Score Calculator.
>
> **Beginner wording**: In 2024 SCA released a new assessment system, CVA, changing "scoring" to a 1-9 scale. The old 100-point scale is still in use; the two can be converted.

## 0. What is CVA

- **CVA** = Coffee Value Assessment
- SCA formally adopted it in **November 2024**, replacing the 2004 cupping protocol
- Core change: from a single 100-point score -> multi-dimensional value assessment

## 1. CVA four-table overview

| Standard | Name | Purpose |
|----------|------|---------|
| SCA-102 | Sample Preparation and Tasting Mechanics | standardizes all cupping variables |
| SCA-103 | Descriptive Assessment | objective flavor-attribute description (no scoring) |
| SCA-104 | Affective Assessment | 1-9 preference scoring |
| SCA-105 | Extrinsic Assessment | non-sensory attributes: origin / certification / price |

> Note: the Chinese translations of the four tables follow SCA official wording. `data/sca_cva.json` holds the full structure.

## 2. SCA-104 Affective 1-9 scale

| Band | Rating | Note |
|------|--------|------|
| 1-3 | Bad | poor quality, obvious defects |
| 4-6 | Average | acceptable quality |
| 7-9 | Excellent | specialty grade |

**Difference from the old 6-10 scale**:
- Old: 6-10 across ten dimensions, total 100
- New: single 1-9 preference score, wider range and resolution
- Sweetness scored separately, no longer folded into flavor

**Specialty threshold**: Affective 7 (corresponds to ~75 on the old 100-point scale)

## 3. Converting 1-9 to the old 100-point scale

SCA provides the Affective Score Calculator as a bridge between the old and new systems.

**Conversion formula**: `100_pt = (affective_9 - 1) / 8 * 100`

| Affective (1-9) | Old 100-point | Rating |
|-----------------|---------------|--------|
| 1 | 0.0 | Bad |
| 3 | 25.0 | Bad |
| 5 | 50.0 | Average |
| 7 | 75.0 | Excellent (specialty threshold) |
| 9 | 100.0 | Excellent |

Use the MCP tool `calculate_cva_score(affective_overall)` for automatic calculation.

## 4. SCA-103 Descriptive and SCA-105 Extrinsic

**SCA-103 Descriptive Assessment**:
- Uses WCR Sensory Lexicon standard terms
- Intensity reference scale 1-15
- Describes only, does not score (objective)

**SCA-105 Extrinsic Assessment**:
- Five dimensions: story & background / sustainability certification / price & value / packaging & presentation / availability
- Specific scoring method still evolving

## 5. CVA and the old 100-point transition

- The industry still widely uses the old 100-point scale (especially in sourcing)
- CVA is the future direction; from 2025 Q-Grader adopts CVA
- The two systems are expected to run in parallel for several years
- SCA provides the Affective Score Calculator as a numerical bridge

## 6. Relationship to other reference files

- Old 100-point scale: [cupping.md](cupping.md)
- Q-Grader: [qgrader-complete-guide.md](qgrader-complete-guide.md)
- Certification landscape: [sca-certification.md](sca-certification.md)
- CVA data structure: `data/sca_cva.json`

> Data source: sca.coffee/sca-news/sca-new-cva-cupping-standards-7ga28, sca.coffee/value-assessment. Verified 2026-07-26.
