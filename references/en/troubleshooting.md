# Troubleshooting decision trees: espresso / pour-over / grinder / milk foam

> **When a beginner reports a flavor problem**: ask 1-2 clarifying questions on the matching tree FIRST, then advise. Avoid "guess wrong direction -> tune wrong variable -> worse each cup."
> **Advanced users skip to the "parameterized diagnosis" tables at the bottom.**

---

## 1. Espresso flavor problems

### Decision tree

```
User says "the shot tastes off" / "not good"
|
+- 1. Too bitter / burnt / herbal?
|  +- Q1: how long was the shot?
|  |  +- < 20s -> extraction too fast
|  |  |  +- too coarse -> grind finer
|  |  |  +- under-dosed -> add grounds (check basket capacity)
|  |  +- 20-30s -> Q2
|  |  |  +- temp >94C -> drop 1-2C
|  |  |  +- dark roast + coarse -> grind finer to a better step
|  |  |  +- too fine + 25s+ full -> grind coarser
|  |  +- > 35s -> extraction too slow
|  |     +- too fine -> grind coarser
|  |     +- uneven / channeling -> re-distribute / WDT
|  |     +- tamped too hard -> light tamp
|  +- Q1b: pour appearance? spitting/splashing -> too fine or channeling
|
+- 2. Too sour / sharp / unripe?
|  +- Q1: shot time?
|  |  +- < 20s -> too coarse -> finer
|  |  +- 20-30s -> Q2
|  |  |  +- temp <92C -> raise 1-2C
|  |  |  +- light roast + coarse -> finer
|  |  |  +- light SOE + 25s+ -> finer + raise temp
|  |  +- > 35s -> atypical; may be the bean or uneven distribution
|  +- Q1b: bean freshness? >1 month -> stale beans: grind finer & raise temp
|
+- 3. Watery / no flavor?
|  +- pours fast -> too coarse or under-dosed
|  +- pours slow but still weak -> under-dosed or temp too low
|  +- pours normally but weak -> check bean freshness
|
+- 4. Too strong / heavy / muddy?
|  +- pours very slow -> too fine
|  +- pours normal but muddy -> over-dosed + ratio too tight
|
+- 5. Astringent / dry / tongue-scraping?
|  +- very slow + very fine -> coarser
|  +- temp too high -> lower
|  +- channeling (flow surges) -> re-distribute / WDT / swap basket
|
+- 6. Smells good, tastes flat?
|  +- under-dosed -> more grounds
|  +- too coarse -> finer
|  +- temp low / under-extracted -> raise temp or extend time
|
+- 7. Shot sprays/spurts ("geyser")?
|  +- too fine + pressure overload -> coarser
|  +- uneven / channeling -> re-distribute + WDT
|  +- basket blocked (too fine + tamped too hard) -> coarser + light tamp
|
+- 8. First drops fine, then sudden stall?
|  +- too fine + too hard -> coarser + light tamp
|  +- basket blocked / tamped off-center -> redo
|  +- machine pressure low -> check machine (out of scope; contact service)
|
+- 9. Crema off?
   +- crema too dark/very thin -> beans too old/dry -> fresh beans / humidify
   +- crema too light/none -> too coarse + low pressure -> finer
   +- crema yellowish, oily -> normal for dark roast
```

### Beginner script

> "Let's diagnose — recall: (1) how many seconds did this shot take (from on to stop)? (2) Was it fast (<20s), normal (25-30s), or slow (>35s)? (3) Does it spray on the surface?"
> Then direct from the answers.

### Parameterized diagnosis (advanced)

| Symptom | Likely cause | Fix (priority order) |
|------|------|------|
| bitter+burnt+over-extr | too fine / too long / temp too high / dark roast | 1. coarser 1 step 2. drop temp 1-2C 3. shorten 5s 4. confirm bean |
| sour+sharp+under-extr | too coarse / too short / temp too low / light roast | 1. finer 1 step 2. raise temp 1-2C 3. extend 5s 4. confirm bean |
| weak+watery | under-dosed / too coarse | 1. +1-2g 2. finer |
| astringent+dry | channeling / over-extr / temp too high | 1. re-distribute + WDT 2. coarser 3. drop temp 4. swap basket |
| spraying | too fine + channeling | 1. coarser + re-distribute + WDT |
| crema off | beans too old / too coarse | fresh beans / finer |

---

## 2. Pour-over flavor problems

### Decision tree

```
User says "the pour-over isn't good"
|
+- 1. Too bitter / burnt?
|  +- total time > 3:30 -> over-extracted
|  |  +- too fine -> coarser
|  |  +- pour too slow -> pour faster
|  |  +- filter clogged -> swap filter / use a flat-bottom (cake) dripper
|  +- temp too high (>94C) and even light roast is bitter -> drop to 88-90C
|  +- dark roast + normal params -> still bitter: coarser + lower temp
|
+- 2. Too sour / sharp?
|  +- total time < 2:00 -> under-extracted
|  |  +- too coarse -> finer
|  |  +- poured too fast -> slower, smaller circles
|  |  +- temp too low (<88C) -> raise to 90-93C
|  +- light roast + normal params -> still sour: finer + raise to 93-95C
|  +- very fresh beans (<7 days) -> rest a few days then re-tune
|
+- 3. Watery / weak?
|  +- poured very fast -> too coarse / under-dosed
|  +- poured fast and astringent -> channeling; grind finer + slower pour
|  +- poured slow but weak -> under-dosed or temp too low
+- 4. Too strong / muddy?
|  +- poured very slow -> too fine -> coarser
|  +- normal but muddy -> too much coffee / ratio too strong
+- 5. Astringent / dry?
|  +- too fine + long -> coarser
|  +- temp too high -> lower
|  +- channeling (uneven flow) -> finer + slower, even circle pour
```

### Pour-over parameterized diagnosis (advanced)

| Symptom | Likely cause | Fix (priority order) |
|------|------|------|
| bitter+extraction too long | too fine / too slow a pour / clogged | 1. coarser 2. faster pour 3. swap filter / flat-bottom dripper |
| sour+under-extr | too coarse / too fast / temp low | 1. finer 2. slower pour, small circles 3. raise temp |
| weak watery | under-dosed / too coarse / temp low | 1. + grounds 2. finer 3. raise temp |
| strong muddy | over-dosed / ratio too strong / too fine | 1. - grounds or + water 2. coarser |
| astringent dry | too fine / temp high / channeling | 1. coarser 2. lower temp 3. better distribution, even pour |

---

## 3. Grinder problems

| Symptom | Cause | Fix |
|------|------|------|
| grind way too fine, can't get coarse | calibration lost / dial slipped | re-zero the burrs; reference the grinder calibration guide |
| wildly uneven grind (some flour + some chunks) | worn burrs / old grinder | clean; consider burr replacement |
| static clumping | humidity / grinder design | RDT (one drop of water on beans) or break up grounds before use |
| huge flavor jump after a bean swap | old grounds left in chute | purge: run 1-2g of new beans through before dialing |
| dial numbers don't match anyone else's | different zero point | set your own zero as the baseline, don't compare absolutes |

---

## 4. Milk foam problems

| Symptom | Cause | Fix |
|------|------|------|
| no foam / won't expand | wand too deep, no air intake | raise wand so the tip is just below surface; aerate with a "hiss" 3-5s |
| big bubbles, soapy foam | too much air / Aerated too long | shorter aeration, then sink the wand and whirlpool |
| foam too thick for latte | over-aerated | treat as cappuccino foam; for latte, AerATE less and whirlpool more |
| milk screams/screeches | wand angle/tip clogged | clean the wand; check the tip holes |
| foam "breaks" / separates | milk too warm when starting, or over 70C | start cold (5-8C); stop by 65C max |
| can't pour latte art | foam too thick OR crema too thin OR pitcher angle | thin foam + good crema + pour 5-10cm above surface |

---

## The one golden rule (all methods)
> **Change ONE variable at a time, then taste before the next change.** Most "I changed three things and now it's worse" disasters come from breaking this rule. Beans themselves are a variable — brew a baseline first, then adjust.
