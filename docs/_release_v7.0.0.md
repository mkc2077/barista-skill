# Release Notes — v7.0.0（2026-08-05）

> 发布说明（GitHub Release notes 来源）。版本号经 `data/version.json` 单一来源派生，SKILL.md / pyproject / server.py / README / CHANGELOG 全部对齐。

## 一句话

从"对话工具"升级为**模块化私人咖啡教练**：6 个专业模块（手冲/意式/奶咖/特调/SCA/感官）各配独立主题与分工，知识库每周自动更新，RAG 支持元数据过滤，画像支持多设备 + 按模块口味。

## 亮点

### 🧩 模块化重构
- 6 模块切换器 + 每模块专属 system prompt
- 每模块独立 accent 主题（切模块即变色）；「我的资料」7 种强调色预设

### 👤 我的资料（独立模块）
- 多设备：磨豆机/器具/手冲壶多台共存
- 口味按模块独立：意式爱苦、手冲爱酸、特调爱甜
- 材料库 11 类（品牌 + 规格），旧数据自动迁移

### 🔄 知识库自动更新
- 3 个新 MCP 工具：`sync_knowledge_now` / `check_knowledge_updates` / `set_knowledge_schedule`
- 方案B 设置面板：定期自动同步（每天/每周/每月）+ 立即同步

### 🔍 RAG v2
- 元数据过滤 + fast/precise 两档检索
- 黄金问答 Recall@5 评估

### 🎨 设计系统
- `DESIGN.md` 反 AI 俗套契约 12 条 + CSS 令牌门禁（self_check [7.1]）
- 咖啡烘焙色阶背景、卡片纸感纹理、Terracotta→Carob 深焦糖调色
- react-bits 动效（BlurText / Magnet）

## 兼容性

- 旧 localStorage 数据（inventoryBeans / inventoryGrinders / tastePref / 单值设备）首次加载自动迁移
- 工具数 26 → 29（+3 知识库同步工具），全部双语（zh/en）
- pyproject 从 `data/version.json` 动态读版本（单一来源不变）

## 验证

- `self_check` ALL CHECKS PASSED（含工具对齐 [1.1] + CSS 令牌门禁 [7.1]）
- 后端 pytest 全绿
- 前端 `next build` exit 0；Barista.exe 一键打包可用

## 获取

- **方案A（Skill）**：以 Skill 加载本仓库（SKILL.md + mcp-server），配合 WorkBuddy / Claude Code / Trae / Codex 等 Agent
- **方案B（本地一键启动）**：双击 `Barista.exe`（Windows）或 `./start.sh`（macOS/Linux），自带内置 MCP，填自己的模型 API Key 即用
