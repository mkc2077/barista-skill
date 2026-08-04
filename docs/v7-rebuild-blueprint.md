# v7 重建蓝图 — 「真·用户专属」私人咖啡教练

> 分支：`v7-rebuild`（main 保持稳定）
> 日期：2026-08-04
> 目标：在 v6.1 稳定核心之上做**架构级重构**，而非推倒重写——复用 26 个 MCP 工具、175 个测试、混合检索与双语知识库（ponytail 阶梯第 2 级：已在代码库里 → 复用）。

---

## 0. 重建策略（先说清取舍）

**不推倒重写**。v6.1 已有：26 工具 MCP server（175 测试通过）、CJK 2-gram + MiniLM 混合检索 + SAG 式实体重排、Next.js 16 前端（画像/库存/知识库/多模态）、AnySearch 联网链路。这些是资产不是负债。

v7 的价值增量集中在**四件事**，对应四个阶段：

| 阶段 | 名称 | 增量能力 | 对应参考项目 |
|------|------|---------|-------------|
| P1 | 知识引擎 | **定期自动更新知识库**（新配方/新冲煮手法）+ 增量索引 | SAG 增量管线、PixelRAG 阶段化管线 |
| P2 | RAG v2 | 事件-实体关联 + 元数据过滤 + 图像索引（豆卡/杯测表）+ 黄金问答评估 | SAG（事件/实体/SQL JOIN）、PixelRAG（双索引/元数据/LLM judge） |
| P3 | UI 设计系统 | 反俗套设计规范落地 + 高级动效组件 + 设计审计门禁 | taste-skill、impeccable、react-bits、ui-ux-pro-max |
| P4 | 小白开箱 | 方案B 一键体验优化（含 exe）、README 重写、release | awesome-llm-apps 的快速上手模式 |

---

## 1. P1 知识引擎：定期更新（本次最先做，因它是「无中生有」的核心需求）

### 需求拆解
用户要求"定期更新知识库，针对新配方、新冲煮手法"。现有机制全部是**手动/按需**（Settings 一键联网刷新、rag_search 时 mtime 检测重建）。缺一个**主动定时器**。

### 设计（最小可行）
```
knowledge_sync.py（mcp-server/ 内，纯 Python，无新依赖）
├── SyncSource（主题清单，默认：新特调配方 / 新冲煮手法 / 冠军方案 / 新磨豆机与器具）
├── sync_once(topics, api_key) → 调 AnySearch 拉取结构化结果
│   └── 复用 webSearchRaw 的同一 API（user 已填 key）
├── 去重：title 相似度 vs 已有 KnowledgeNote（本地存储）
├── 入库：复用 add_documents(texts, source_prefix="auto:") 增量 API
└── Scheduler（threading.Timer 循环，间隔可配置，默认每周）
    # ponytail: stdlib 定时器，先不引 APScheduler；间隔/批量到产品级再加
```
- **触发面**：① 方案B 独立版：Settings 新增「自动更新」开关 + 间隔（每天/每周/每月），app 启动后驻留调度；② 方案A：新增 MCP 工具 `check_knowledge_updates`，SKILL 提示模型每周主动调用一次；③ 仓库级：GitHub Actions schedule 每月自动跑 `scripts/knowledge_sync_cron.py` 拉取公开主题（可选，需 key 存 secret）。
- **验证**：单测（mock AnySearch）——新增文档去重不重复入库、增量索引可查询到新文档。

### 明确不做（P1）
- 不做 LLM 摘要/结构化抽取（首版只存原文 + 来源链接；抽取留 P2 与事件-实体一起做）
- 不做多源爬虫（只 AnySearch，一个 API 全家桶）

---

## 2. P2 RAG v2：从"向量+关键词"升级到"关联检索"

### 从 SAG 借鉴（性价比排序）
1. **事件-实体关联表（SQLite 一张表）**：每个知识条目抽取 1 条事件摘要 + N 个实体（豆种/产地/处理法/器具/手法），`event_entity` 表做 JOIN 扩展。天然增量、零图数据库。**这正是 v6.1 rag_entities 的进阶**——现在只有实体打分，没有关联扩展。
2. **元数据过滤**（PixelRAG payload filtering）：给 chunk 打 metadata（产地/处理法/烘焙度/器具/主题），检索时先过滤再向量排序。咖啡 KB 规模小，这个比多跳更常用。
3. **两档检索**：Fast（现有混合检索）/ Precise（+ 实体扩展 + LLM 重排），MCP 工具 `rag_search` 加 `mode` 参数。
4. **图像索引（可选，P2 后半）**：豆卡/杯测表用多模态 embedding 建第二个 collection，实现"文搜图/图搜图"。模型用用户已配的 LLM 供应商的多模态 embedding 端点；**不引 2B 本地 VLM**（硬件门槛违背小白定位）。不可用则显式降级并提示，绝不静默闭卷（PixelRAG 血泪教训）。

### 评估（PixelRAG 血泪教训）
- 建 `evals/golden_qa.jsonl`：30-50 条咖啡黄金问答（含多跳："埃塞俄比亚日晒浅烘配 4:6 法，中段酸涩怎么救"），RAG v2 前后跑 Recall@k。
- 判分用 **LLM judge**（语义分）而非 exact-match，先在小 smoke 集上验证 judge 本身。

### 明确不做（P2）
- 不做 GraphRAG 三元组/全局图（SAG 已证明事件-实体足够）
- 不做 LanceDB/pgvector（SQLite 足够，数据量 <1k 条目）

---

## 3. P3 UI 设计系统：反俗套 + 高级化

### 先立「设计上下文」（impeccable /impeccable init 模式）
仓库根建 `DESIGN.md`（产品是 **product 而非 brand** 定位），记录：
- 反参考（anti-references）：AI 俗套界面长什么样，本项目禁止出现
- 调色板：**避开** taste-skill 的 premium-consumer 禁令色系（cream/brass/espresso 默认盘）。候选方向：**Terracotta + Slate**（暖陶土配冷板岩——咖啡天然亲和但非俗套奶油棕）或 **Forest**（深绿 + 骨白 + 琥珀）。P3 开头定稿一个，全站锁定
- 字体：弃 Inter 默认，候选 Geist / Satoshi / Outfit；正文 serif 禁用（taste-skill serif discipline）
- 图标：从 lucide 迁到 @phosphor-icons/react（taste-skill 3.C 推荐），全项目单一家族
- 动效：弹簧物理已有 → 补 react-bits 精选组件（BlurText 类标题入场、Grainient/Noise 质感已有电影颗粒）;taste-skill 禁用的动效（bounce/elastic、滚动驱动全页抖动）列入反参考

### 执行清单（P3 内）
1. 写 `DESIGN.md` + `web/next-app/src/app/globals.css` 设计 token 重构（色板/字号/间距/圆角成变量）
2. 组件审计：SettingsPanel/ChatView/Sidebar 对照 impeccable 反模式清单（禁卡片套卡片、禁灰字彩底、禁纯黑纯灰）逐项过
3. react-bits 精选 3-5 个组件落地（标题动效、空状态、进度指示）
4. CI 加「设计自检」：不可行的 59 条规则全部自动化，但可以加一条 CSS 变量扫描——色板/字体 token 是否被硬编码值绕过（低成本高收益）
5. 全项目 `npm run build` + 截图回归

### 明确不做（P3）
- 不引 impeccable CLI/扩展全家桶（那是给 agent 的运行时，我们是产品）；只吸收其规则文本
- 不引 react-bits 全部 165 个组件（精选 3-5 个，每个都改造成本可控）

---

## 4. P4 小白开箱 + 发布

- **方案B 一键流再简化**：首启引导（Welcome 向导：3 步——填 API key → 选模型 → 可选填 AnySearch key），对标 awesome-llm-apps 的 quickstart 模式
- **exe 打包回归**：沿用 build-exe.py（python -S + PYTHONPATH 绕 safe-delete），v7 全量重打并实测
- **README 重写**：两种方案并排说明 + 各 3 步 quickstart + 常见问题（豆卡上传怎么用、知识库怎么自动更新）
- **版本发布**：v7.0.0，CHANGELOG 全量、docs/_release_v7.0.0.md、GitHub Release（流程已沉淀）

---

## 5. 验收标准（karpathy: goal-driven）

| 阶段 | 完成即验收 |
|------|-----------|
| P1 | `pytest mcp-server/` 全绿 + 新增测试 ≥3 个；Settings 出现「自动更新」开关；手动触发一次真实同步能入库 |
| P2 | golden QA 30 条上 Recall@5 不低于 v6.1 且元数据过滤用例通过；图像索引不可用时显式提示 |
| P3 | DESIGN.md 落地；CSS token 扫描门禁通过；截图回归无不一致 |
| P4 | 全新用户按 README 3 步内跑通方案B；exe 实机启动无报错 |

## 6. 风险与对策

- **AnySearch 免费额度/断网**：sync 失败显式报错 + 下次重试，不静默；缓存上次成功时间
- **自动更新污染知识库**：去重 + 来源强制记录（auto: 前缀 + URL），可一键清除 auto 类目（Settings 已有管理）
- **多模态 embedding 端点参差**：图像索引做成可选特性，探测失败即提示关闭，不阻塞主流程

## 7. 参考项目索引（含可借鉴点速查）

| 项目 | 借鉴点 | 落地阶段 |
|------|--------|---------|
| Zleap-AI/SAG | 事件-实体 SQL JOIN 关联检索、增量管线、两档检索、单适配层隔离 | P2 |
| StarTrail-org/PixelRAG | 双索引（文本+图像）、元数据过滤、LLM judge 评估、失败显式化 | P2 |
| Leonxlnx/taste-skill | 反俗套设计规则（配色禁令/字体纪律/图标家族/动效约束） | P3 |
| nextlevelbuilder/ui-ux-pro-max-skill | 高级 UI 规范补充 | P3 |
| pbakaus/impeccable | PRODUCT.md/DESIGN.md 设计上下文、59 条反模式 | P3 |
| DavidHDev/react-bits | 精选动画组件（BlurText/Grainient 等） | P3 |
| Shubhamsaboo/awesome-llm-apps | 小白 quickstart 模式参考 | P4 |
| HKUDS/CLI-Anything / nexu-io/open-design / build-your-own-x | 工程组织与设计 token 惯例（低优先级，按需查阅） | P4 |
