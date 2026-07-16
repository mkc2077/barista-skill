# Barista MCP Server (bilingual / 双语)

将 [barista-skill](../) 咖啡师教练技能封装为 MCP (Model Context Protocol) 服务，可通过任何 MCP 兼容客户端调用。**每个工具都支持 `language="zh"`/`"en"` 双语返回。**

Wraps the [barista-skill](../) coffee-coach skill as a Model Context Protocol service, callable from any MCP-compatible client. **Every tool takes a `language="zh"`/`"en"` argument and returns localized output.**

## 提供的工具 (9) / Tools (9)

| 工具 / Tool | 功能 / What | 示例 / Example |
|------|------|------|
| `get_recipe` | 冲煮法起步参数 (14 种) / brew starter params (14 methods) | "查手冲参数" / "pour_over params" |
| `get_milk_drink` | 经典奶咖配方 (11 款, 比例联网核实) / milk-drink recipes | "卡布配方" / "cappuccino recipe" |
| `get_craft_recipe` | 特调咖啡 8 项 SOP 框架 (咖啡基底/茶底/自制糖浆/采购辅料/拼装) / craft coffee SOP | "特调怎么做" / "make a craft drink" |
| `diagnose_flavor` | 风味问题诊断与调整 / flavor diagnosis & fix | "太苦怎么办" / "too bitter" |
| `calculate_cupping_score` | SCA 杯测 100 分计算 / SCA cupping score | "算杯测分" / "score my cupping" |
| `calibrate_grinder` | 磨豆机校准方法与刻度 / grinder calibration | "C40 校准" / "calibrate C40" |
| `get_parameters_guide` | 按豆性/口味调参矩阵 / parameter tuning | "浅烘埃塞怎么调" / "light ethiopia" |
| `get_flavor_wheel` | SCA 风味轮类别与描述词 / flavor wheel | "水果类风味" / "Fruit flavors" |
| `get_sensory_training` | 感官训练方案 / sensory training plan | "怎么练品鉴" / "how to train palate" |
| `get_learning_resources` | 分阶段学习资源 / learning resources | "入门看什么" / "where to start" |

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
├── server.py          # MCP server, 10 tools (bilingual)
├── pyproject.toml     # packaging (entry point: barista-mcp -> server:main)
└── README.md          # this file
```

知识来源 / Knowledge source: `../references/` (15 Markdown files). 工具返回的结构化数据内置于 `server.py`。The structured data returned by tools is built into `server.py`.

## 传输协议 / Transport

默认 stdio（本地）/ Default **stdio** (local). 如需 SSE (HTTP 远程) / for SSE (HTTP remote), 改 `main()`:

```python
mcp.run(transport="sse", host="0.0.0.0", port=8000)
```

## 许可 / License

MIT — 与 barista-skill 主项目一致 / same as the main project.
