# Brewing-coach protocol (v4.0 architecture base)

> This file defines the **closed-loop coaching conversation protocol** for barista-skill v4.0: how the host (Skill / Agent) holds state, which MCP tool it calls at each step and with what parameters, and how it rewrites each tool's return value into plain language for the user.
> Companion state contracts: [data/user_profile_schema.json](data/user_profile_schema.json) (user profile) and [data/brew_session_schema.json](data/brew_session_schema.json) (single brew session).
> This file is a **protocol document** (English mirror of `references/brewing-coach-protocol.md`); all tool calls are bilingual (zh/en).

## 1. Why a protocol is needed

The 20 tools in v3.x were "point Q&A": the user asks one thing, the tool answers one thing. The user had to stitch multiple diagnoses and adjustments together themselves.

v4.0 chains them into a **closed-loop coaching path**:

```
start -> params -> brew -> eval -> diagnose -> tune -> (back to brew, until satisfied)
   ^                                                      |
   +------------------------------------------------------+
```

- **A. Give parameters**: `get_recipe` / `get_parameters_guide` -- starter params for this step.
- **B. Rescue flavor**: `diagnose_flavor` (with `guided` mode) / `identify_flavor` -- locate the root cause when the cup is off.
- **C. Coach practice**: `start_brew_session` / `log_brew_result` / `next_step` -- turn multi-round practice into a traceable session.

The core principle: **the host holds state; tools consume context; the skill itself does no persistent storage**.

## 2. State contracts

### 2.1 User profile `user_profile` (cross-session, optional)

Structure: [data/user_profile_schema.json](data/user_profile_schema.json). Key fields:

- `gear`: grinder / brewer / kettle / scale.
- `water`: TDS / water source (affects extraction, often overlooked).
- `taste`: taste preference (sour-leaning / sweet-leaning / bitter-averse) / flavors they dislike.
- `skill`: experience tier (beginner/intermediate/advanced) + beans they usually drink.

When calling `get_recipe` / `get_parameters_guide` / `diagnose_flavor` / `identify_flavor`, the host may serialize the profile into a **`user_context` string** (JSON or free text both fine). The tool then appends "gear-aware" / "taste-aware" personalized notes. If omitted, generic starter params are used and behavior is unchanged (backward compatible).

### 2.2 Brew session `brew_session` (single practice, optional)

Structure: [data/brew_session_schema.json](data/brew_session_schema.json). Key fields:

- `session_id` / `bean{origin,process,roast}` / `method`.
- `params{dose_g,yield_g,temp_c,grind,time_s}`: this round's parameters.
- `self_score{aroma,acid,sweet,body,aftertaste}` (1-5 self rating).
- `feedback` / `round` / `history[]`: per-round records.

The host maintains this session across the loop (accumulating `history` over multiple turns) and feeds the current round's params/scores back into `log_brew_result` and `next_step`.

## 3. Call conventions for each loop node

| Step | Tool | Host responsibility | Key inputs | Output usage |
|------|------|---------------------|------------|--------------|
| **start** | `start_brew_session` | Initialize the session skeleton; get `next_action` | `bean` / `method` (optional) | Retrieve session template + next-step pointer (usually to `get_recipe`) |
| **params** | `get_recipe` / `get_parameters_guide` | Pass the user profile as `user_context` | `method` / `roast_level` / `user_context` | Starter params; restate to user via the "plain-language rewrite layer" |
| **brew** | (host executes) | User brews to the params; host records actual params to the session | -- | No tool call |
| **eval** | `log_brew_result` | Pass this round's `params` + `self_score` + `feedback` to the tool | `session_id` / `params` / `self_score` / `feedback` | Retrieve normalized `round_record` to append to `history`; get `next_action` (diagnose or tune) |
| **diagnose** | `diagnose_flavor` (can set `guided=True`) / `identify_flavor` | User describes what they taste; if unclear, use `guided` prompts or `identify_flavor` to break it down | `problem` / `guided` / `symptom` / `user_context` | Root cause + adjustment advice; restate via the rewrite layer |
| **tune** | `next_step` | After getting the adjustment direction, return to **params / brew** for the next round | `problem` / `goal` / `equipment` | Concrete next-round tuning action (grind/temp/time/ratio/dose +/-) |

The loop does not force every node: if the user only wants "give me params", just go start -> params; the full eval -> diagnose -> tune cycle only runs when the user wants systematic practice.

## 4. Track C advancement: identification guidance (patching B's most painful gap)

Users often cannot say "what they tasted" -- they only say "off" or "weird". That is exactly the most painful gap in category B (rescue flavor). v4.0 reinforces it with two paths:

### 4.1 `diagnose_flavor`'s `guided` mode

- `guided=False` (default): same as v3.x -- directly match the known flavor problem and give adjustment advice.
- `guided=True`:
  - If the problem matches a known category, additionally return a **`guided_prompt`** (a verification question to confirm it truly belongs to that category).
  - If the problem cannot be matched (user description too vague), return a **guided questionnaire**: the 6 families (sour / bitter / astringent / lacking-sweetness / lacking-body / off-flavor) each get a "which kind of X?" either/or / multi-select question, letting the user pick the closest one, then return to the tool with the answer for finer matching.

### 4.2 Standalone tool `identify_flavor`

When the user is completely unable to describe it, call `identify_flavor(symptom)` directly, using the "6 families / 19 leaf sub-classes" decision tree in [data/flavor_identification_tree.json](data/flavor_identification_tree.json):

1. First hit `family` with `symptom`.
2. Use that family's `discriminator` (a judgment question with options) to drill down to `leaf`.
3. Return that leaf's `root_cause` + `beginner_fix` / `advanced_fix` + `diag_key`.

`identify_flavor` and `diagnose_flavor` are complementary: `identify_flavor` handles "what is this flavor", `diagnose_flavor` handles "how to fix it".

## 5. Host red lines

1. **State is held by the host**: `user_profile` / `brew_session` live on the host side (conversation memory / external storage), not relying on tool persistence.
2. **Single-variable rule unchanged**: in the tune phase, change only one variable at a time (grind/temp/time/ratio/dose), sip, then judge.
3. **No fabrication**: any store/blogger's current recipe, specific gram weights, or pressure-profile curve must be verified online and sourced; no link without a verified source.
4. **Rewrite layer is mandatory**: `get_recipe` / `get_milk_drink` / `get_craft_recipe` return JSON fields; the host must rewrite them into plain language per the 7 iron rules in [references/human-voice-rules.md](references/human-voice-rules.md), never dumping raw JSON/tables.
5. **Fail gracefully**: when a tool returns `{"ok": false, ...}` (method not found / unknown problem), the host falls back to generic starter params + guided questions; never fail silently.

## 6. Minimal closed-loop example (script view)

```
# 1) Open a session
session = start_brew_session(bean="Ethiopia natural", method="pour_over")
# -> next_action: get_recipe(pour_over, roast_level="light")

# 2) Get params (with profile personalization)
params = get_recipe("pour_over", "light", "beginner", user_context='{"gear":{"brewer":"v60"}}')
# User brews to params; record actual params

# 3) Log one round's result
rec = log_brew_result(session_id=session["session_id"], params=..., self_score={"acid":4,"sweet":2,...}, feedback="too sour")
# -> next_action: diagnose_flavor(problem="too sour") or identify_flavor(symptom="sharp sour tongue-sting")

# 4) Diagnose (use guided if unclear)
diag = diagnose_flavor("too sour", guided=True)   # or identify_flavor("sharp sour tongue-sting")
# -> root_cause + beginner_fix/advanced_fix

# 5) Tune next round
tune = next_step(problem="too sour", equipment="v60")
# -> grind: finer, temp: higher, time: longer ... back to steps 2/3 and brew again
```

The protocol closes the loop here. Each round the host appends `round_record` to `history`, so over a long session it can look back at "what I changed, which round got tastier".
