# Barista Coffee Coach Skill

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-6.1.1-blue)
![MCP tools](https://img.shields.io/badge/MCP%20tools-29-blueviolet)
![Brew methods](https://img.shields.io/badge/brew-14%20methods-success)
![Tests](https://img.shields.io/badge/tests-175%20pass-success)

Dedicated coffee coach skill. The AI leads, asking deep follow-ups until it finds the ONE variable that will make the cup better. Bilingual (zh/en). 29-tool MCP server, one-click local app, RAG layer.

---

## English

### v6.1 highlights

- Persistent user profile (gear / taste / beans / water) via localStorage
- Bean & grinder inventory tracked in Settings
- Personal knowledge library with one-click web refresh via AnySearch
- Multimodal image input: upload bean cards / grinder product pages / cupping gauge sheets

### Quick start

1. Python 3.10+ and Node.js 20+ on the machine
2. Double-click start.bat (Windows) or run ./start.sh (macOS / Linux)
3. Fill in your API key in the Settings panel
4. Start asking coffee questions - images and your memories load automatically

### Coverage

| Area | What |
|------|------|
| Brewing | 14 methods (V60 / Kalita / AeroPress / French / espresso / moka / cold brew / ice drip / Turkish / Vietnamese phin / ...) + 11 milk drinks + craft specialty recipes |
| Beans | Selection / storage / processing / roast / altitude / moisture / aging; 12 origins + 6 processing matrices |
| Sensory | SCA cupping (10 dims), CVA novel scale (SCA-102/103/104/105), flavor wheel, triangle cupping; chemistry maps to sensory |
| Grinder | 5 hand grinders + multiple electric models, calibration tack + use tips |
| Espresso | Yield rate, pressure curves, pre-infusion, variable pressure |
| Water | TDS, hardness, pH, chlorine, mineral impact |
| Champions | 4:6 method (Kasuya Tetso) and others, web-verified |
| SCA | 6 modules each Foundation / Intermediate / Professional |
| Q-Grader | 22 exams: full content as exam type, passing scores, study traps |
| Green | Defect beans I/II, scoring rules, sieve/SPE grading |
| Learning | Official sources + community (Xiaohongshu / WeChat / Zhihu / forums / Bilibili) |

### MCP tools (29)

| Group | Tools |
|-------|-------|
| Brew / Sensory | get_recipe, get_parameters_guide, diagnose_flavor, identify_flavor, get_sensory_training, get_craft_recipe, start_brew_session, next_step, log_brew_result |
| Milk / Flavor | get_milk_drink, get_flavor_wheel |
| Grinder | calibrate_grinder |
| Cupping | calculate_cupping_score, calculate_cva_score |
| SCA / Green | get_sca_path, get_sca_course, get_green_grade, get_defect_bean, search_sca_sources |
| Q-Grader | get_qgrader_exam, get_qgrader_study_plan, get_triangle_protocol |
| Learning / RAG | get_learning_resources, rag_search, search_references, add_knowledge |

Every tool supports language=zh/en and a user_context JSON parameter for personalization. Full tool docs: mcp-server/README.md

### RAG

Hybrid retrieval: CJK 2-gram keyword + sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2) cosine over references/ documents. Falls back to pure keyword when sentence-transformers is not installed. SAG-style entity rerank (mcp-server/rag_entities.py) boosts chunks that share entities with the query. PixelRAG screenshot pipeline deferred - see docs/adr/0001-pixelrag-screenshot-retrieval-deferred.md

### Project structure

        barista-skill/
        data/            structured JSON
        references/      dual-language topic docs (en/ mirror)
        mcp-server/      MCP server + RAG engine + tests
        web/             Next.js 16.x frontend with profile/inventory/knowledge panel
        scripts/         repo utilities (build_rag_index / self_check)
        docs/            ADRs / roadmap / releases
        start.bat        one-click launcher (Windows)
        start.sh         one-click launcher (macOS / Linux)
        SKILL.md        skill protocol file

### Decision tracking

The project adopted hygiene patterns from mattpocock/skills and ponytail:

- ADRs (docs/adr/) record decisions, no re-litigation
- Out-of-scope (docs/out-of-scope/) documents deliberate non-features
- SKILL.md frontmatter lists triggers, one per branch

---

## Chinese

### v6.1 核心新功能

- 跨对话画像持久化 — 设备/口味/豆子/水质横跨对话保存，每个请求的 system prompt 都带上你的画像
- 手上豆库存 — 设置面板里随时增删手头上的豆子与磨豆机，存入 localStorage
- 个人知识库 + 一键联网刷新 — 搜索关键词，一键三秒 AskAnySearch，结果结构化存为 KnowledgeNote；最近 8 条注入每个对话
- 多模态图片理解 — 聊天输入框附带上传按钮，可发豆卡/磨豆机商品页/杯测图，模型会读内容并据此回答

### 快速开始

1. Python 3.10+ 与 Node.js 20+ 已安装
2. 双击 start.bat (Windows) / 运行 ./start.sh (macOS / Linux)
3. 在弹窗里：选一家供应商、填 Key、选 Model、保存
4. 开始输入咖啡问题 — 图片与用户记忆会自动加载

### 覆盖范围

| 域 | 内容 |
|-------|-------|
| 冲煮 | 14 器具（V60 / Kalita / 法压 / 爱乐压 / 意式 / 摩卡壶 / 冷萃 / 冰滴 / 土耳其 / 越南 phin...）+ 11 经典奶咖 + 特调配方 |
| 豆子 | 选购/保存/处理法/烘焙等级/海拔/含水率/养豆；12 产地 + 6 处理法参数矩阵 |
| 感官 | SCA 杯测 (10维度)、CVA 新标 (SCA-102/103/104/105) 与旧分制对照、风味车轮、三角杯测；化学反应 ↔ 感官映射 |
| 磨豆机 | 5 手磨 + 多台电磨的校正刻度 + 实战使用建议 |
| 意式 | 萃取率/压力曲线/预浸泡/变压分析 |
| 水质 | TDS、硬度、pH、氯、矿物质影响 |
| 冠军 | 粕谷哲 4:6 法等冠军配方，联网核实、不编造 |
| SCA | 6 模块（Barista/Brewing/Sensory/Roasting/Green/Q）各 Foundation/Intermediate/Professional，含目标与课时、考试形式 |
| Q-Grader | 22 项考试：每项考试形式（盲测/笔试/实操）、通过线、常错现场、备考材料索引 |
| 生豆 | 筛网 + SPE 分级 + 瑕疵豆一级/二级 + 扣分规则 |
| 特调 | 连锁品牌配方 + 咖啡奶茶特调（无咖啡因也记录） |
| 学习 | 新手至资深资源：官方 SCA/CQI 训练 + 社区（小红书/感官/公众号/论坛/B站） |

### MCP 工具 (29)

| 组 | 工具 |
|-------|------|
| 冲煮/感官 | get_recipe, get_parameters_guide, diagnose_flavor, identify_flavor, get_sensory_training, get_craft_recipe, start_brew_session, next_step, log_brew_result |
| 牛奶/风味 | get_milk_drink, get_flavor_wheel |
| 调磨 | calibrate_grinder |
| 杯测 | calculate_cupping_score, calculate_cva_score |
| SCA/生豆 | get_sca_path, get_sca_course, get_green_grade, get_defect_bean, search_sca_sources |
| Q-Grader | get_qgrader_exam, get_qgrader_study_plan, get_triangle_protocol |
| 学习/RAG | get_learning_resources, rag_search, search_references, add_knowledge |

全部 29 个工具都支持 language=zh/en + user_context JSON，文档详见 mcp-server/README.md

### RAG 检索

混合检索：CJK 2-gram 关键词得分 + sentence-transformers（paraphrase-multilingual-MiniLM-L12-v2）余弦相似度，按 references/ 文档分块。若未装 sentence-transformers 自动退化为纯关键词检索。SAG-style 实体超边重排（rag_entities.py）会boost 与查询共享实体的文档。PixelRAG 截屏通道延后 — 见 ADR 0001。

### 决策追源

项目借鉴 mattpocock/skills 与 ponytail 的文档卫生规则：

- ADRs (docs/adr/) 记录"我们为何这样设计"，未来不再重复争辩
- Out-of-scope (docs/out-of-scope/) 记录有意图不做的东西，并说明为何不做
- SKILL.md frontmatter 把触发关键词拍平，一个分支一个触发

### 致敬与灵感来源

- Leonxlnx/taste-skill
- nextlevelbuilder/ui-ux-pro-max-skill
- pbakaus/impeccable
- DavidHDev/react-bits
- Zleap-AI/SAG
- StarTrail-org/PixelRAG
- mattpocock/skills
- Shubhamsaboo/awesome-llm-apps
- codecrafters-io/build-your-own-x
- ponytail
- andrej-karpathy-skills

### License

MIT.
