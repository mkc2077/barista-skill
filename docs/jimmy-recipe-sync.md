# 吉米特调配方同步（数据管道）

收集小红书博主 **「吉米-咖啡届直男」(Jim950707)** 的咖啡特调配方，并保持与
其最新视频一致。

> ⚠️ **诚实原则**：本管道**不编造配方**。该博主**只发视频**，配方需从视频中识别，
> 而视频识别需要「登录态 + 视频理解后端」——这两样不随仓库提供。因此：
> - `data/jimmy_craft_recipes.json` **初始为空**（`provenance: EMPTY_PENDING_VERIFIED_IMPORT`）；
> - 任何配方都必须由你通过**已核实来源**灌入，脚本只做结构化与合并；
> - 检索结论：公开网络（下厨房等）能找到的特调菜谱**均无法确认出自该博主**，
>   故未采信任何第三方转录作为他的配方。

---

## 目录结构

```
data/
  jimmy_craft_recipes.schema.json     # 结构化数据格式（JSON Schema）
  jimmy_craft_recipes.json            # 数据集（初始为空，待灌入）
  jimmy_craft_recipes.example_import.json  # 格式示例（provenance=EXAMPLE）
  jimmy_sync_config.example.json      # 配置示例
  jimmy_sync_state.json               # 运行时状态（已见视频 ID）
  jimmy_sync_log.json                 # 同步日志
scripts/
  sync_jimmy_recipes.py               # 同步框架（仅标准库，无第三方依赖）
docs/
  jimmy-recipe-sync.md                # 本文件
.github/workflows/sync-jimmy-recipes.yml  # 定时调度（可选）
```

---

## 结构化数据格式

每条配方遵循 `data/jimmy_craft_recipes.schema.json`，核心字段：

| 字段 | 含义 |
|---|---|
| `recipe_id` | 唯一 ID，建议 `jimmy-<note_id>-<slug>`；缺失由脚本推导 |
| `drink_name` | `{zh, en}` 饮品名 |
| `source_video` | 来源笔记 `note_id` / `url` / `published` |
| `ingredients[]` | 原料 `{name:{zh,en}, amount, note}` |
| `ratio` | 核心比例（粉水比或配方比） |
| `tools[]` | 器具清单 |
| `steps[]` | 制作步骤（一句一步） |
| `sop` | SOP 拆分：`prep` / `assembly_order` / `serve` / `tips` |
| `base_extraction` | 咖啡基底类型与参数 |
| `provenance` | `VERIFIED_USER_IMPORT` / `VERIFIED_BACKEND` / `EXAMPLE` |

---

## 如何灌入真实配方（两条路）

### 路径 A：手动导入（最可靠，推荐先用）
1. 你观看博主视频，把配方与 SOP 整理成 JSON（参照 `example_import.json`，
   **务必把 `provenance` 设为 `VERIFIED_USER_IMPORT`，不要用 `EXAMPLE`**）。
2. 运行：
   ```bash
   python scripts/sync_jimmy_recipes.py --manual-import data/your_recipes.json
   # 先试运行（不落盘）：
   python scripts/sync_jimmy_recipes.py --manual-import data/your_recipes.json --dry-run
   ```
3. 脚本会幂等合并（按 `recipe_id` 去重，`_meta.last_sync` 更新）。

### 路径 B：接入你自己的视频理解后端（全自动）
1. 拿博主视频 → 用你的 ASR（语音）+ OCR/视觉（画面文字）服务产出结构化配方；
2. 在 `scripts/sync_jimmy_recipes.py` 里注册一个 `Extractor` 子类（参考
   `ManualExtractor` / `StubExtractor`），返回 `List[recipe dict]`；
3. 在配置里设 `extractor: "your_backend"`，用 `XhsCookieSource` 或你的视频
   发现方式提供 `VideoMeta`；
4. 运行 `python scripts/sync_jimmy_recipes.py --sync` 自动合并写入。

---

## 自动监测新视频

- `XhsCookieSource`：调用小红书非官方 API `user_posted`。**需要**
  `auth.cookie`（你的登录 cookie）与 `blogger.user_id`（数字 ID）。
  小红书请求带 `x-s`/`x-t` 签名（前端 JS 计算），纯 Python 无法稳定生成，
  因此**多数情况下会优雅返回空列表**——这是预期行为，不是 bug。
  若要做到稳定自动发现，需用你已登录的浏览器会话（如 `browser-cdp` 技能）
  读取笔记列表，再喂给 `ManualSource` 的下料文件。
- `ManualSource`：你定期把新视频元数据放进 `data/jimmy_new_videos.json`
  （`{"videos":[{note_id,title,...}]}`），`--check` / `--sync` 会读取。

---

## 定时调度（可选）

`.github/workflows/sync-jimmy-recipes.yml` 提供一个每日 06:00 UTC 的定时任务：
- 读取仓库 Secret `XHS_SESSION_COOKIE`；
- 运行 `--sync`（或先 `--check`）；
- 若数据变化则提交回仓库。

注意：小红书 cookie 会过期，Secret 需定期更新；且如上所述，无签名时
`--sync` 的监测大概率为空，真正落地仍需你提供后端或手动下料。本地也可用
cron：
```cron
0 6 * * * cd /path/to/barista-skill && python scripts/sync_jimmy_recipes.py --sync >> data/cron.log 2>&1
```

---

## 可信度标记（provenance）

| 值 | 含义 |
|---|---|
| `EMPTY_PENDING_VERIFIED_IMPORT` | 数据集为空，待灌入 |
| `VERIFIED_USER_IMPORT` | 由你基于真实转录稿导入 |
| `VERIFIED_BACKEND` | 由你接入的后端自动提取 |
| `EXAMPLE` | 仅演示格式，**不是真实配方** |

任何面向用户的输出在引用这些配方时，应保留 `source_video` 与 `verified_at`，
并提示"以博主视频当下内容为准"。
