#!/usr/bin/env python3
"""Update CHANGELOG for v5.0.0 release."""
import pathlib

p = pathlib.Path("D:/codex/barista-skill/CHANGELOG.md")
content = p.read_text(encoding="utf-8")

new_entry = (
    "## [5.0.0] - 2026-08-02\n\n"
    "### 重大重构\n"
    "- **版本飞跃至 5.0.0**：反映项目从 v4 系列到完全重写的架构级跃迁\n"
    "- **前端设计系统重构**（详见 v4.7.0 / v4.7.1 / v4.8.0）：\n"
    "  - Double-Bezel 嵌套外壳、Editorial 字体层级（Instrument Serif + JetBrains Mono）\n"
    "  - 弹簧物理微交互、电影颗粒覆盖层、Aurora Glow、Glass Panel\n"
    "  - 4 个咖啡主题（浅烘/手冲/深烘/浓缩）oklch 色板\n"
    "- **RAG 搜索引擎增强**（借鉴 SAG 架构）：_strip_query_noise 噪声过滤、hybrid retrieval（语义 0.6 + 词法 0.4）\n"
    "- **API 供应商扩展**：从 8 家扩至 16 家（新增 Gemini / Mistral / Grok / MiniMax / 混元 / SiliconFlow / OpenRouter / 百川）\n"
    "- **一键启动优化**：start.bat 从打开旧 HTML 改为 Next.js dev server；自动检测 Node/Python/npm 依赖\n"
    "- **全栈验证**：tsc --noEmit 零错；next build 编译成功；self_check ALL PASSED；pytest 159 passed\n\n---\n"
)

idx = content.index("---\n") + 4
content = content[:idx] + new_entry + content[idx:]
p.write_text(content, encoding="utf-8")
print("CHANGELOG.md updated to v5.0.0")
