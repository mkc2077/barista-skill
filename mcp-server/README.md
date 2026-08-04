# Barista MCP Server (bilingual / 双语)

将 [barista-skill](../) 咖啡师教练技能封装为 MCP (Model Context Protocol) 服务，可通过任何 MCP 兼容客户端调用。**每个工具都支持 `language="zh"`/`"en"` 双语返回。**

Wraps the [barista-skill](../) coffee-coach skill as a Model Context Protocol service, callable from any MCP-compatible client. **Every tool takes a `language="zh"`/`"en"` argument and returns localized output.**

## 提供的工具 (29) / Tools (29)

| 工具 / Tool | 功能 / What | 示例 / Example |
|------|------|------|
| `get_recipe` | 冲煮法起步参数 (14 种) / brew starter params | "查手冲参数" / "pour_over params" |
| `get_milk_drink` | 经典奶咖配方 (11 款) / milk-drink recipes | "卡布配方" / "cappuccino recipe" |
| `get_craft_recipe` | 特调咖啡 8 项 SOP 框架 / craft coffee SOP | "特调怎么做" / "make a craft drink" |
| `diagnose_flavor` | 风味问题诊断与调整 / flavor diagnosis | "太苦怎么办" / "too bitter" |
| `calculate_cupping_score` | SCA 杯测 100 分计算 / SCA cupping score | "算杯测分" / "score my cupping" |
| `calibrate_grinder` | 磨豆机校准方法与刻度 / grinder calibration | "C40 校准" / "calibrate C40" |
| `get_parameters_guide` | 按豆性/口味调参矩阵 / parameter tuning | "浅烘埃塞怎么调" / "light ethiopia" |
| `get_flavor_wheel` | SCA 风味轮类别与描述词 / flavor wheel | "水果类风味" / "Fruit flavors" |
| `get_sensory_training` | 感官训练方案 / sensory training | "怎么练品鉴" / "how to train palate" |
| `get_learning_resources` | 分阶段学习资源 / learning resources | "入门看什么" / "where to start" |
| `search_references` | 参考文档全文检索 / reference search | "搜索杯测" / "search cupping" |
| `rag_search` | 混合检索（语义+关键词+实体重排），支持 `mode=fast/precise` 与 `filter="category=search"` 元数据过滤 / hybrid RAG search | "查金杯参数" / "golden cup" |
| `get_sca_path` | SCA 认证全景 (CSP+Q-Grader) / SCA cert landscape | "SCA 认证路线" / "SCA cert path" |
| `get_sca_course` | CSP 模块/级别课程详情 / CSP course detail | "Brewing Foundation" / "brewing foundation" |
| `get_qgrader_exam` | Q-Grader 8 大类考试详情 / Q-Grader exams | "闻香瓶考试" / "olfactory exam" |
| `get_qgrader_study_plan` | 按天数生成备考计划 / study plan | "30 天备考" / "30-day plan" |
| `get_green_grade` | 生豆等级判定 / green coffee grading | "一级0二级5" / "primary 0 secondary 5" |
| `get_defect_bean` | 瑕疵豆分类查询 / defect bean query | "全黑豆" / "full black" |
| `calculate_cva_score` | CVA 1-9 分 + 旧 100 分换算 / CVA score | "Affective 7" / "affective 7" |
| `get_triangle_protocol` | 三角杯测协议 / triangle test protocol | "三角杯测 4 轮" / "triangle 4 rounds" |
| `search_sca_sources` | SCA/CQI/WCR 来源检索 / source search | "CVA 来源" / "CVA sources" |
| `identify_flavor` | 风味辨识引导（模糊抱怨→子类+根因）/ flavor identification tree | "尖酸刺舌" / "woody cardboard" |
| `start_brew_session` | 开冲煮练习会话骨架 / open brew-session scaffold | "开始一轮" / "start a session" |
| `log_brew_result` | 记录一轮冲煮结果 / log one brew round | "记这一杯" / "log this cup" |
| `next_step` | 下一步调参建议 / next tuning step | "太酸怎么调" / "too sour next" |
| `sync_knowledge_now` | 手动触发知识库联网同步（AnySearch → 去重入库） / manual knowledge sync | "更新知识库" / "update KB" |
| `check_knowledge_updates` | 每周自查：超 7 天未同步即自动更新 / weekly freshness check | "有新材料吗" / "any new recipes" |
| `set_knowledge_schedule` | 方案B 调度器配置（daily/weekly/monthly） / configure auto-sync scheduler | "每周自动更新" / "weekly auto-sync" |

> v7 P1（知识引擎）：`sync_knowledge_now` / `check_knowledge_updates` / `set_knowledge_schedule` 由 `knowledge_sync.py` 驱动——AnySearch 联网拉取最新配方/冲煮手法/冠军方案，标题去重（精确 + difflib 相似度）后以 `auto:` 前缀增量写入 RAG 索引；失败显式返回错误并保留上次成功时间，绝不静默。方案A：模型每周调用一次 `check_knowledge_updates`；方案B：Settings 开启「定期自动更新」即可。
> v7 P2（RAG v2）：自动同步条目带元数据（`category=search` / `source=auto` / `url`），`rag_search` 支持 `filter="category=search"` 等元数据过滤（PixelRAG payload-filtering 思路，SQLite/小规模下直接预过滤，无新依赖）；`mode=precise`（默认，SAG 式实体重排）与 `mode=fast` 两档。评估见 `evals/golden_qa.jsonl` + `scripts/run_rag_eval.py`（Recall@5，PixelRAG 式精确源匹配）。

所有工具签名：最后一个可选参数 `language: str = "zh"`，传 `"en"` 即得到英文输出。
All tools accept an optional trailing `language` arg; pass `"en"` for English.

## 快速开始 / Quick start

### 1. 安装依赖 / Install

```bash
pip install "mcp[cli]"
```

### 2. 在 MCP 客户端中配置 / Configure your client

#### Claude Desktop

Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "barista": {
      "command": "python",
      "args": ["C:/path/to/barista-skill/mcp-server/server.py"]
    }
  }
}
```

#### Cursor / VS Code / TRAE

在 MCP 设置中添加（路径用正斜杠 `/` 或双反斜杠 `\\`）/ Add to MCP settings (use `/` or `\\` in the path):

```json
{
  "mcpServers": {
    "barista": { "command": "python", "args": ["C:/path/to/barista-skill/mcp-server/server.py"] }
  }
}
```

### 3. 重启客户端 / Restart the client

### 4. 本地调试 / Local debug

```bash
mcp dev server.py          # MCP inspector / 检查器
python server.py            # 启动 stdio server / start stdio server
```

安装为命令 / Install as a console script (可选 / optional):

```bash
pip install -e .            # 之后可直接用 `barista-mcp` 启动
```

## 使用示例 / Examples

- "帮我查意式浓缩参数,深烘" / "espresso params, dark roast"
- "我的手冲太酸了" / "my pour-over is too sour"
- "卡布奇诺配方" / "cappuccino recipe"
- "算杯测分: 干香8.5 风味8.0 余韵7.5..." / "score: aroma 8.5 flavor 8.0 aftertaste 7.5..."
- "Comandante C40 怎么校准" / "how to calibrate C40"
- "浅烘埃塞日晒怎么调参" / "light ethiopia natural tuning"
- "查风味轮水果类" / "flavor wheel Fruit"
- "怎么系统训练品鉴" / "how to train palate"
- "咖啡入门看什么" / "where to start learning"

## 架构 / Architecture

```
mcp-server/
├── server.py          # MCP server, 29 tools (bilingual)
├── pyproject.toml     # packaging (entry point: barista-mcp -> server:main)
└── README.md          # this file
```

知识来源 / Knowledge source: `../references/` (25 zh topics + 21 en mirrored Markdown files). 工具返回的结构化数据来自 `../data/` (28 JSON files) + `server.py` 内置. The structured data returned by tools comes from `../data/` JSON files + built-in `server.py` constants.

## 传输协议 / Transport

默认 stdio（本地）/ Default **stdio** (local). 如需 SSE (HTTP 远程) / for SSE (HTTP remote), 改 `main()`:

```python
mcp.run(transport="sse", host="0.0.0.0", port=8000)
```

## 许可 / License

MIT — 与 barista-skill 主项目一致 / same as the main project.
