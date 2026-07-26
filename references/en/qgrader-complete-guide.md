# Q-Grader Complete Prep Guide

> Q-Grader is the SCA coffee quality grader certification (from 2025, Evolved Q Grader). This guide covers the 8 exam categories, prep resources, and training plan.
>
> **Beginner wording**: Q-Grader is one of the hardest coffee certifications -- 8 exam categories covering written test, taste, smell, cupping, triangle, acids, green coffee, and roasting.

## 0. Q-Grader overview

- **History**: CQI (1996-) -> 2025 SCA takes over as Evolved Q Grader
- **Evolved Q vs old**: cupping scoring changed from the old 100-point scale to the CVA 1-9 scale; the 36-aroma Le Nez du Cafe kit stays unchanged
- **8 categories total 20-22 units** (caliber-difference note in section 5)

## 1. The 8 exam categories, in detail

### 1-1 General knowledge written test (1 unit)
100 multiple-choice questions covering growing/picking/processing/cupping/grading/roasting/brewing, 60-minute limit, 75% to pass.

### 1-2 Sensory skills -- taste (3 sub-units)
Discriminate different concentrations of sweet / sour / salt. Reference group 100% -> blind group 80% -> mixed group 70%.

### 1-3 Olfactory -- Le Nez du Cafe 36 aromas (4 sub-units)
Le Nez du Cafe 36 aromas, in four groups: enzymatic (light roast, 9) / sugar browning (medium roast, 9) / dry distillation (dark roast, 9) / defects (9). 75% to pass each group. Red-light room, bottles label-masked.

### 1-4 Cupping scoring (4-5 rounds)
Score multiple samples on the SCA 100-point (old) / CVA (new) scale. Scoring deviation from the examiner must be <= 1 point.

### 1-5 Triangle cupping (4-6 rounds)
Each group 3 cups (2 same, 1 different); find the odd cup. 83% accuracy. Red-light room. See [triangle-test-protocol.md](triangle-test-protocol.md).

### 1-6 Organic-acid pairing (1 unit)
8 groups of coffee, 4 cups each; find the 2 spiked cups and name the acid (citric / malic / tartaric / acetic).

### 1-7 Green coffee grading (1 unit)
Grade a 350g sample by the SCA defect table. See [green-coffee-evaluation.md](green-coffee-evaluation.md).

### 1-8 Roasted/sample roast identification (1-2 units)
Identify whether sample roast level meets SCA standard / pick out Quaker beans.

## 2. Prep resources

**Official**: SCA courses / WCR Lexicon / Le Nez du Cafe 36 / SCA Green Coffee Defect Handbook

**Curated community**: China Coffee Network / Torch Coffee / Expertcafe / Barista Hustle

See MCP tools `search_sca_sources` and `data/qgrader_study_resources.json`.

## 3. Training plan (by days)

Use the MCP tool `get_qgrader_study_plan(days, focus)` to generate a personalized plan.

**Weight allocation** (Le Nez is hardest, highest weight):
| Category | Weight |
|----------|--------|
| Olfactory (Le Nez) | 20% |
| Sensory taste | 15% |
| Cupping scoring | 15% |
| Triangle cupping | 15% |
| General knowledge written | 10% |
| Green coffee grading | 10% |
| Organic-acid pairing | 8% |
| Roasted/sample roast ID | 7% |

## 4. Exam tips and traps

- **Le Nez memory method**: memorize in four groups (enzymatic / browning / dry-distillation / defects), 9 per group; learn the number first, then the smell
- **Triangle difficulty progression**: origin -> process -> roast -> batch (easy to hard)
- **Cupping scoring**: consistency with the examiner is the key, not the absolute score
- **Pre-exam note**: avoid changing diet/smoking habits during the exam (taste is affected)

## 5. Caliber-difference note

| Source | Exam count | Reason for difference |
|--------|-----------|----------------------|
| China Coffee Network | 22 | cupping 5 rounds + triangle 5 rounds |
| Torch Coffee | 20 | cupping 4 rounds + triangle 4 rounds |
| Expertcafe | 22 exams | includes extra items like water/origin |

This repo organizes uniformly by **8 categories**, recording unit by unit, total 20-22 units. See `data/qgrader_exams.json`.

## 6. Relationship to other reference files

- Certification landscape: [sca-certification.md](sca-certification.md)
- CVA assessment: [sca-new-cva-guide.md](sca-new-cva-guide.md)
- Triangle protocol: [triangle-test-protocol.md](triangle-test-protocol.md)
- Green coffee grading: [green-coffee-evaluation.md](green-coffee-evaluation.md)
- Prep-resource index: `data/qgrader_study_resources.json` + `data/sca_official_sources.json`

> Data source: sca.coffee/qgrader, torchcoffee.asia, expertcafe.be, gafei.com. Verified 2026-07-26.
