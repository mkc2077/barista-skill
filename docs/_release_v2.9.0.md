# v2.9.0 — 博主特调 ASR 数据集

新增小红书博主「吉米-咖啡届直男」(Jim950707) 咖啡特调的 Whisper 转写数据集，补上「其特调只在视频里、不写文字配方」的缺口（见 `references/craft-coffee.md`）。

## 新增内容
- **`data/jimmy_craft_recipes.json`** — 25 条判为 craft 配方的结构化数据（`recipe_id` / `drink_name` / `source_video` 带**出处链接** / `ingredients` / `steps` / `ratio`）。
- **`data/jimmy_transcripts.json`** — 42 条视频的 Whisper **逐字转写**（含 `listUrl` 出处链接），作为权威来源。
- **`data/jimmy_craft_recipes.schema.json`** — 数据集 JSON Schema（含 `MACHINE_TRANSCRIBED` 诚实出处标记）。
- **`data/jimmy_craft_recipes.example_import.json`** / **`data/jimmy_sync_config.example.json`** — 已核实导入与同步配置示例。
- **`scripts/sync_jimmy_recipes.py`** — 同步框架脚本（**明确拒绝编造配方**，仅接受已核实导入 / 示例）。
- **`.github/workflows/sync-jimmy-recipes.yml`** — 定时拉取骨架（需仓库配置 `XHS_SESSION_COOKIE` / `XHS_USER_ID` Secrets 后启用）。
- **`docs/jimmy-recipe-sync.md`** — 同步机制说明。
- README / CHANGELOG / SKILL.md / `data/version.json`：版本 2.8.0 → 2.9.0。

## ⚠️ 重要声明
- 本数据集为 **Whisper 机转、未经人工核实**，可能存在 ASR 误差（原料名 / 用量识别偏差）。**使用前务必人工校验**；`verbatim_transcript` 为权威来源，结构化字段与之冲突时以 verbatim 为准。
- 所有配方版权归原作者 **吉米-咖啡届直男 (Jim950707)** 所有，本仓库仅作**学习索引与归因**。引用时请注明出处并支持原博主。

## 数据管线
`browser-use` 抓取博主 447 条笔记 → 筛选 122 条配方类 → 提取 42 条带视频直链 → 下载 MP4 → ffmpeg 抽音频 → faster-whisper (base/int8/中文) 转写 → 启发式抽取结构化配方（仅取转写中真实出现的「数字+单位+名词」，不臆造用量）。
