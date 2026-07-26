# Triangle Test Protocol

> The SCA triangle test is Q-Grader exam category 5, and a core method of sensory training. Three cups, two same one different, find the odd one.
>
> **Beginner wording**: A triangle test gives you three cups of coffee, two identical and one different, and asks you to find it. The more similar they are, the harder it is.

## 0. Purpose of the triangle test

Sensory training / Q-Grader exam / product R&D / QC consistency. The triangle test is the most direct way to test a taster's discrimination ability.

## 1. Protocol standard

- Each round **3 cups** (2 identical + 1 different)
- **Slurp & aerosolize**: use a cupping spoon to take ~5ml, slurp hard so the coffee aerosols across the whole mouth
- **Taste one by one**: taste each cup separately, do not mix
- **Pass line**: correctly identify >= 75% of rounds (83% for the Q-Grader exam)

## 2. Difficulty progression

| Difficulty | Difference type | Note |
|-----------|-----------------|------|
| origin | different origins | easiest (large flavor gap) |
| process | different processes | medium (washed vs natural) |
| roast | different roast levels | harder (light vs medium) |
| batch | different batches, same farm | hardest (subtle gap) |

Progression principle: from large differences to small, gradually building discrimination.

## 3. Q-Grader exam requirements

- **4-6 rounds** (caliber difference: round counts vary by version)
- 45-minute limit per round
- **Red-light room**: rules out identifying the coffee by visual color differences of the grounds
- 6 groups per round, 3 cups each, at most 1 group wrong
- Pass line 83%

Use the MCP tool `get_triangle_protocol(rounds, difficulty)` for parameterized protocol.

## 4. Training method

### Build your own training set

1. **Entry**: same bean, different roast (light vs medium-dark, obvious gap)
2. **Intermediate**: same origin, different process (washed vs natural)
3. **Advanced**: same process, different origin (Ethiopia vs Kenya)
4. **Challenge**: same farm, different batch (hardest)

### Training frequency

- 2-3 times per week, 3-4 rounds each time
- After each round, record your judgment vs the actual difference
- Error attribution: temperature drift? inconsistent slurp force? or truly could not tell?

## 5. Common traps

1. **Third-cup order-memory interference**: by the third cup you forgot the first cup's taste -> take notes after each cup
2. **Temperature drift**: three cups at different temps cause mouthfeel differences -> pour all at the same time
3. **Inconsistent slurp force**: different force changes aerosolization -> keep force consistent
4. **Psychological suggestion**: knowing there is a difference makes you tend to "find it" -> blind test, do not know if there is a difference

## 6. Relationship to other reference files

- Cupping basics: [cupping.md](cupping.md)
- Sensory training: [sensory.md](sensory.md)
- Q-Grader overview: [qgrader-complete-guide.md](qgrader-complete-guide.md)
- CVA assessment: [sca-new-cva-guide.md](sca-new-cva-guide.md)

> Data source: sca.coffee/cva, torchcoffee.asia. Verified 2026-07-26.
