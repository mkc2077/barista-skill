# Barista MCP Server

将 [barista-skill](../) 咖啡师教练技能封装为 MCP (Model Context Protocol) 服务，可通过任何 MCP 兼容客户端调用。

## 提供的工具（8 个）

| 工具 | 功能 | 示例调用场景 |
|------|------|-------------|
| `get_recipe` | 按冲煮法获取起步参数 | "帮我查手冲的参数" |
| `diagnose_flavor` | 风味问题诊断与调整建议 | "咖啡太苦怎么办" |
| `calculate_cupping_score` | SCA 100 分杯测评分计算 | "帮我算杯测分数" |
| `calibrate_grinder` | 磨豆机校准方法与刻度 | "C40 怎么校准" |
| `get_parameters_guide` | 按豆性/烘焙度/口味调整参数 | "浅烘埃塞怎么调参数" |
| `get_flavor_wheel` | SCA 风味轮类别与描述词查询 | "查一下水果类有哪些风味" |
| `get_sensory_training` | 感官训练方案（味觉/嗅觉/品鉴/记忆库） | "怎么练品鉴能力" |
| `get_learning_resources` | 按阶段推荐学习资源 | "入门该看什么" |

## 快速开始

### 1. 安装依赖

```bash
# 推荐使用 uv
pip install uv
uv pip install "mcp[cli]"

# 或直接 pip
pip install "mcp[cli]"
```

### 2. 在 MCP 客户端中配置

#### Claude Desktop

编辑配置文件（Windows: `%APPDATA%/Claude/claude_desktop_config.json`）：

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

#### TRAE / Cursor / VS Code

在 MCP 设置中添加：

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

> **注意**：请将路径替换为实际的绝对路径，Windows 路径使用正斜杠 `/` 或双反斜杠 `\\`。

### 3. 重启客户端

重启后即可在对话中使用咖啡相关功能，客户端会自动识别并调用工具。

### 4. 本地调试

```bash
# 使用 MCP CLI 调试
mcp dev server.py

# 列出所有工具
mcp list server.py
```

## 使用示例

配置完成后，在客户端对话中直接提问即可：

- "帮我查一下意式浓缩的参数，用的深烘豆"
- "我的手冲咖啡太酸了怎么办"
- "帮我算一下杯测分数：干香8.5 风味8.0 余韵7.5..."
- "Comandante C40 怎么校准？手冲用几格？"
- "浅烘埃塞日晒豆手冲参数怎么调？"
- "查一下风味轮水果类有哪些描述词"
- "怎么系统训练咖啡品鉴能力"
- "咖啡入门该看什么网站"

## 架构

```
mcp-server/
├── server.py          # MCP Server 主文件（8 个工具）
├── pyproject.toml     # 项目配置
└── README.md          # 本文件

知识库来源:
../references/         # 15 个 Markdown 参考文件（由 server.py 加载）
```

Server 启动时会自动加载上层 `references/` 目录的 15 个参考文件作为知识库，工具返回的结构化数据内置于 `server.py` 中。

## 传输协议

默认使用 **stdio** 传输（适合本地使用）。

如需 SSE 模式（HTTP 远程访问），修改 `server.py` 末尾：

```python
if __name__ == "__main__":
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
```

## 许可

MIT — 与 barista-skill 主项目一致。
