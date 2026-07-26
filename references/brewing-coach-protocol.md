# 闭环教练协议（Brewing-coach protocol —— v4.0 架构基座）

> 本文件定义 barista-skill v4.0 的**闭环教练对话协议**：宿主（Skill / Agent）如何持有状态、在每一步向哪个 MCP 工具传参、又把工具返回的结果改写成人话回给用户。
> 配套状态契约见 [data/user_profile_schema.json](data/user_profile_schema.json)（用户画像）与 [data/brew_session_schema.json](data/brew_session_schema.json)（单次冲煮会话）。
> 本文件为**协议文档**，不随语言镜像（mono-lingual）；工具调用均双语（zh/en）。

## 一、为什么需要协议

v3.x 的 20 个工具是「单点问答」：用户问一个，工具答一个。用户要自己把多次诊断、多次调整串起来。

v4.0 把它们串成一条**闭环教练链路**：

```
start → params → brew → eval → diagnose → tune →（回到 brew，直到满意）
   ↑                                      │
   └──────────────────────────────────────┘
```

- **A 给参数**：`get_recipe` / `get_parameters_guide` —— 给这一步的起步参数。
- **B 救风味**：`diagnose_flavor`（含 `guided` 模式）/ `identify_flavor` —— 喝到不对时定位根因。
- **C 陪练进阶**：`start_brew_session` / `log_brew_result` / `next_step` —— 把多轮练习固化成可追溯的会话。

协议的核心原则：**宿主持有状态，工具消费上下文，skill 自身不做持久化存储**。

## 二、状态契约

### 2.1 用户画像 `user_profile`（跨会话，可选）

结构见 [data/user_profile_schema.json](data/user_profile_schema.json)。关键字段：

- `gear`：磨豆机 / 冲煮器具 / 手冲壶 / 秤。
- `water`：TDS / 水源（影响萃取，常被忽略）。
- `taste`：口味偏好（偏酸/偏甜/怕苦）/ 不爱喝的风味。
- `skill`：经验档位（beginner/intermediate/advanced）+ 常喝豆类型。

宿主在调用 `get_recipe` / `get_parameters_guide` / `diagnose_flavor` / `identify_flavor` 时，可把画像序列化为 **`user_context` 字符串**传入（JSON 或自由文本均可）。工具据此做「贴机器」「贴口味」的个性化备注。不传则走通用起步参数，行为不变（向后兼容）。

### 2.2 冲煮会话 `brew_session`（单次练习，可选）

结构见 [data/brew_session_schema.json](data/brew_session_schema.json)。关键字段：

- `session_id` / `bean{origin,process,roast}` / `method`。
- `params{dose_g,yield_g,temp_c,grind,time_s}`：本轮参数。
- `self_score{aroma,acid,sweet,body,aftertaste}`（1–5 自评）。
- `feedback` / `round` / `history[]`：每轮记录。

宿主在闭环中维护这份会话（多轮对话里累积 `history`），并把当轮参数/评分回传给 `log_brew_result` 与 `next_step`。

## 三、闭环各节点调用约定

| 步骤 | 工具 | 宿主职责 | 入参要点 | 出参用法 |
|------|------|----------|----------|----------|
| **start** | `start_brew_session` | 初始化会话骨架；拿到 `next_action` | `bean` / `method`（可选） | 取回会话模板 + 下一步指针（通常指向 `get_recipe`） |
| **params** | `get_recipe` / `get_parameters_guide` | 把用户画像作为 `user_context` 传入 | `method` / `roast_level` / `user_context` | 起步参数；按「说人话改写层」转述给用户 |
| **brew** | （宿主执行） | 用户照参数冲煮；宿主记录实际参数到会话 | — | 不产生工具调用 |
| **eval** | `log_brew_result` | 把本轮 `params` + `self_score` + `feedback` 传给工具 | `session_id` / `params` / `self_score` / `feedback` | 取回规范化 `round_record` 追加进 `history`，拿到 `next_action`（诊断 or 调参） |
| **diagnose** | `diagnose_flavor`（可 `guided=True`）/ `identify_flavor` | 用户描述喝到的味道；若说不清，走 `guided` 引导或 `identify_flavor` 细分 | `problem` / `guided` / `symptom` / `user_context` | 根因 + 调整建议；按改写层转述 |
| **tune** | `next_step` | 拿到调整方向后，回到 **params / brew** 下一轮 | `problem` / `goal` / `equipment` | 下一轮具体调参动作（grind/temp/time/ratio/dose 增减） |

闭环不强制走完所有节点：用户只想「给个参数」时，只走 start→params 即可；用户想系统练习时，才进入 eval→diagnose→tune 的完整循环。

## 四、C 进阶：识别引导（B 最痛短板的补强）

用户常说不清「喝到什么」——只会说「不对」「怪怪的」。这正是 B 类（救风味）最痛的短板。v4.0 用两条路径补强：

### 4.1 `diagnose_flavor` 的 `guided` 模式

- `guided=False`（默认）：行为同 v3.x——直接匹配已知风味问题并给调整建议。
- `guided=True`：
  - 若问题能匹配已知类别，额外返回一条 **`guided_prompt`**（验证性问题，确认是否真的属于该类）。
  - 若问题无法匹配（用户描述太模糊），返回 **引导问卷**：6 大家族（酸/苦/涩/甜缺失/醇厚不足/异味）各给一句「是哪种 X？」的二选一/多选式提问，让用户挑最贴近的一项，再带着答案回到工具细分。

### 4.2 独立工具 `identify_flavor`

当用户完全说不清时，直接调用 `identify_flavor(symptom)`，按 [data/flavor_identification_tree.json](data/flavor_identification_tree.json) 的「6 大家族 / 19 个叶子子类」判别树：

1. 先用 `symptom` 命中 `family`。
2. 用该 family 的 `discriminator`（带选项的判断问题）进一步细分到 `leaf`。
3. 返回该 leaf 的 `root_cause` + `beginner_fix` / `advanced_fix` + `diag_key`。

`identify_flavor` 与 `diagnose_flavor` 互补：`identify_flavor` 负责「这是什么味道」，`diagnose_flavor` 负责「怎么调好它」。

## 五、宿主职责红线

1. **状态由宿主持有**：`user_profile` / `brew_session` 存在宿主侧（对话记忆 / 外部存储），不依赖工具持久化。
2. **单变量铁律不变**：tune 阶段一次只改一个变量（grind/temp/time/ratio/dose），改完喝一口再判断。
3. **禁编造**：任何门店/博主当下配方、具体克数、变压曲线都必须联网核实并标来源；无核实源不附链接。
4. **改写层必走**：`get_recipe` / `get_milk_drink` / `get_craft_recipe` 返回 JSON 字段，宿主须按 [references/human-voice-rules.md](references/human-voice-rules.md) 7 条铁律改写为人话，不原样抛 JSON/表格。
5. **降级友好**：工具返回 `{"ok": false, ...}` 时（未找到方法/未知问题），宿主用通用起步参数 + 引导提问兜底，不静默失败。

## 六、最小可用闭环示例（脚本视角）

```
# 1) 开会话
session = start_brew_session(bean="埃塞日晒", method="pour_over")
# → next_action: get_recipe(pour_over, roast_level="light")

# 2) 取参数（带画像个性化）
params = get_recipe("pour_over", "light", "beginner", user_context='{"gear":{"brewer":"v60"}}')
# 用户照冲；记录实际 params

# 3) 记录一轮结果
rec = log_brew_result(session_id=session["session_id"], params=..., self_score={"acid":4,"sweet":2,...}, feedback="太酸")
# → next_action: diagnose_flavor(problem="太酸") 或 identify_flavor(symptom="尖酸刺舌")

# 4) 诊断（说不清就 guided）
diag = diagnose_flavor("太酸", guided=True)   # or identify_flavor("尖酸刺舌")
# → root_cause + beginner_fix/advanced_fix

# 5) 下一轮调参
tune = next_step(problem="太酸", equipment="v60")
# → grind: +细, temp: +升, time: +延 ... 回到步骤 2/3 再冲一轮
```

协议到此闭环。宿主每轮把 `round_record` 追加进 `history`，即可在长会话里回看「我调了什么、哪一轮变好喝」。
