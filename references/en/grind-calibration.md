# Grinder calibration guide

> Grind is the first critical variable in extraction. This file covers the science of grinding, calibration methods for different grinders, and common-problem solutions.
>
> **Beginner wording**: "a grinder is like a guitar -- tune it before playing, or nothing you do afterwards will taste right."

## 0. The science of grind

### 0.1 Why grind matters
A coffee bean is about 28% water-soluble; the rest is cellulose and structure. Grind sets the surface area water touches -- finer = more area = faster extraction; coarser = less area = slower.

### 0.2 Compound dissolution order
Soluble compounds in roasted coffee dissolve in a fixed order:
fruit acids (first) -> lipids -> sugars (sweet) -> carbohydrates (bitter, last).
This is why under-extracted coffee is sour/salty (sugars not yet out) and over-extracted coffee is bitter/astringent (carbohydrates over-pulled).

### 0.3 Grind size vs extraction

| Grind | Surface area | Speed | Risk | Use |
|---------|--------|---------|------|---------|
| Extra-fine (flour) | largest | very fast | over-extraction, channeling | Turkish |
| Fine (fine salt) | large | fast | needs precise timing | espresso |
| Medium-fine (white sugar) | medium | moderate | safer | pour-over, iced pour-over |
| Medium (raw sugar) | medium-small | slower | may be weak | clever dripper, AeroPress |
| Coarse (sea salt) | small | slow | under-extraction risk | French press, cold brew |

### 0.4 Particle-size distribution & uniformity (key principle)
Extraction yield is the average across all particles, and different-sized particles extract differently:
- **High uniformity** (e.g. Mahlk nig EK43): yields of 21-26% without off-flavors.
- **Wide distribution** (uneven): boulders under-extract (sour, vegetal) and fines over-extract (bitter, dry) -- the cup shows sour AND bitter at once. This is why low-end grinders "taste off no matter what."
> This is the core reason to invest in a good grinder: higher uniformity = a wider tunable window = clearer flavor.

### 0.5 The fines problem
Fines (very small particles) extract almost instantly and produce off-flavors; low-quality grinders make too many. Grinding finer is not always more extraction -- past some fineness, fines clump and cause micro-channeling, which actually lowers extraction.

## 1. Universal calibration principle: Dose -> Yield -> Time

Based on industry-standard systematic calibration:

| Step | Action | Principle |
|------|------|------|
| 1. Fix Dose | set the coffee dose each time (e.g. espresso 18g, pour-over 15g) | dose first, non-negotiable |
| 2. Fix Yield | set the target liquid weight (e.g. espresso 36g = 1:2) | yield second, non-negotiable |
| 3. Tune Time | change grind to move extraction time into the target band | time is flexible: coarser = faster, finer = slower |

**Key principles**:
- Dose first, yield second, time third.
- Go as fine as you can without hitting diminishing returns.
- Always purge (clear old grounds) after changing grind.
- Keep extracting more until it stops improving, then back off one notch -- that is the optimum.

## 2. Hand-grinder calibration (e.g. Comandante C40)

The C40 has 35 clicks (MK4 has 40) of fine adjustment and high-nitrogen martensitic stainless burrs.

### 2.1 Grind recommendation table

| Brew | Suggested clicks | Particle reference |
|---------|---------|---------|
| Turkish | 5-10 | extra-fine (flour) |
| Espresso | 10-15 | fine salt |
| Pour-over | 20-25 | white sugar |
| French press / cold brew | 30-35 | coarse sand |

### 2.2 Zeroing steps
1. Turn the adjustment ring until the burrs fully close (you hear metal friction) -- that is "zero."
2. About 20 clicks counter-clockwise suits V60 pour-over.
3. 24 clicks (about 2 turns) suits French press.
4. Record your zero position; use it as the baseline going forward.

### 2.3 Other hand-grinder reference clicks

| Grinder | Espresso start | Pour-over start |
|--------|---------|---------|
| 1Zpresso JX-Pro | 1.0-1.2 turns | 2.0-2.4 turns |
| 1Zpresso K-Plus | 1.0-1.5 turns | 2.2-2.6 turns |
| Timemore C2/C3 | 8-10 clicks | 14-18 clicks |
| Timemore Chestnut X | 10-12 clicks | 14-18 clicks |

## 3. Espresso electric-grinder calibration (e.g. Mahlk nig EK43)

The EK43 uses 98mm steel-alloy flat burrs, vertical design -- an industry benchmark.

### 3.1 Espresso calibration steps
1. Set the dial to position 1.
2. Use a hex key to loosen the dial screws (2 total).
3. With the grinder ON, use a flat screwdriver to slowly close the burr gap until you hear light friction.
4. Open a hair coarser to the zero point (no friction).
5. Turn off the grinder and lock the dial screws back down with the hex key.

### 3.2 In-use ranges after calibration
- SOE espresso: 1.3-1.8 (tune by roast and dose)
- Pour-over: 7-8.5 (tune by roast and technique)

### 3.3 Advanced calibration (Matt Perger method)
1. Mark around the burrs with a whiteboard pen.
2. Deliberately close the burrs to light friction.
3. Open up and look at the uneven erase marks.
4. Shim (paper) at the diagonal of the wear, reassemble, retest.
5. Repeat until the friction erases the marks evenly.

### 3.4 Eureka and other home electric grinders
- Flat or conical burrs; same idea: find zero (burrs touching) -> set grind from there.
- Espresso grinding usually sits a few clicks above zero.
- Focus on low-retention design to cut bean-cross-contamination on swaps.
- Huika ZD-17/ZD-18N: numeric steps, espresso ~2.5-3.5.
- Baratza Sette 270: 30 steps, espresso ~5-10.

## 4. Commercial large-grinder calibration notes

| Grinder | Calibration notes |
|--------|---------|
| Mahlk nig E65S/E80 | adjust directly on the digital display; check burr gap periodically with a puck-thickness gauge |
| Mythos One/Two | integrated temp control; watch cold/warm dial drift |
| Fiorenzato F4/F64 | stepless; verify the dial periodically with a reference sieve |
| EG Flat 80mm | high output; watch thermal-expansion dial drift after long runs |

## 5. Calibration workflow in practice

### 5.1 Espresso calibration workflow
**Step 1 -- set baselines**: dose 18g / target yield 36g (1:2) / target time 25-32s
**Step 2 -- taste & diagnose**: too sour/thin -> under-extracted -> finer; too bitter/astringent -> over-extracted -> coarser; weak intensity -> more dose or less yield
**Step 3 -- micro-tune**: one variable at a time; purge well after changing grind; log every change.

### 5.2 Pour-over calibration workflow
**Step 1 -- set baselines**: dose 15g / total water 225g (1:15) / temp 92C / grind medium (C40 ~22)
**Step 2 -- diagnose & tune**: weak/astringent-sour -> finer or higher temp; bitter/astringent -> coarser or lower temp; too low strength -> lower ratio.

## 6. Common problems & solutions

| Problem | Cause | Fix |
|------|---------|---------|
| Shot runs too fast | too coarse / under-dosed / uneven distribution | finer / more dose / better distribution |
| Shot runs too slow | too fine / over-dosed | coarser / less dose |
| Too sour | under-extraction | finer / higher temp / longer |
| Too bitter | over-extraction | coarser / lower temp / shorter |
| Unclear flavor | uneven extraction | better uniformity / distribution / better basket |
| Dial drift over time | mechanical loosening | re-zero periodically |
| Uneven grind after cleaning | loose burr screws tilt the burr | fully tighten screws & recalibrate |
| Sour AND bitter at once | wide particle distribution (fines + boulders) | better grinder / sift fines |
| Big flavor jump after a bean swap | old & new grounds mix | purge old grounds thoroughly, then dial |
| Heavy static / flying grounds | dry air | RDT (1-2 light sprays of water on beans before grinding) |
| Clumping / too many fines | high bean moisture / burr residue | rest beans a few days / clean burrs / check the dial ring |

## 7. Improving extraction uniformity
1. Use a high-precision basket (e.g. VSTprecision).
2. Use a perfectly flat tamper, tamp level.
3. Distribute thoroughly before tamping; the bed should look like a golf green.
4. Don't knock the portafilter when locking in (causes channeling).
5. Use a grinder that produces few boulders (flat burrs usually beat conical).
6. Avoid blends with very different solubilities.

## 8. Usage notes
- **Beginner**: drop particle-distribution/Dose-Yield-Time terms; use "tune the grinder before tuning the taste, like tuning a guitar before a song"; only "a bit coarser/finer."
- **Intermediate**: introduce clicks and the Dose->Yield->Time flow; give ranges.
- **Advanced**: full use of particle distribution, extraction yield, calibration methods.
- Machine-specific parameter tables: equipment-profiles.md | Grind vs extraction: parameters-guide.md | Grinder troubleshooting: troubleshooting.md section 3
