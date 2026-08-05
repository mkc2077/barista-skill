/**
 * 模块注册表（v7 P3c：模块化拆分 + 不同模块分工不同）。
 *
 * 每个模块 = 一个"专业咖啡顾问"的专注域，对应 SKILL.md 覆盖范围内的细分方向。
 * 当前 6 个模块（一号用户场景驱动）：
 *   - pourover 手冲 / 通用（默认）
 *   - espresso 意式浓缩（萃取率、压力曲线、预浸泡、变压）
 *   - milk 奶咖（11 款经典奶咖）
 *   - craft 特调（连锁/创意咖啡 SOP）
 *   - sca SCA 认证与备考
 *   - sensory 感官训练（杯测、风味辨识、化学→感官）
 *
 * 字段含义：
 *   - id: 模块 id（与 settings.currentModule 对齐）
 *   - label.zh / label.en: 用户可见的中英文标签
 *   - description: 一句话描述模块的专业域
 *   - prompt: 注入到 system prompt 末端的模块专属指令（告诉模型"专注此模块，给专业回答"）
 *   - ragFilter: 调 rag_search 时附加的元数据过滤（v7 P2），空字符串 = 不附加
 *   - defaultMaterialCategories: 默认在「我的材料库」中此模块关心哪些物料类别
 *
 * 后续 P3c.2 会加：
 *   - accentVar: per-module accent CSS variable（切换 module 后整个界面主色随之变）
 *   - icon: lucide 图标
 *   - tools: 此模块优先调用的 MCP 工具子集
 */

export type ModuleId = 'pourover' | 'espresso' | 'milk' | 'craft' | 'sca' | 'sensory'

export type InventoryCategory =
  | 'bean'           // 咖啡豆
  | 'grinder'        // 磨豆机（手磨/电磨）
  | 'brewer'         // 冲煮器具（V60/Kalita/Aeropress/法压/摩卡壶...）
  | 'machine'        // 意式咖啡机
  | 'dripper'        // 滤杯（V60/Origami/Kalita Wave 单独品类，便于单独记录杯型+材质）
  | 'filter'         // 滤纸（漂白/未漂白/金属片，单独品类便于记录品牌型号）
  | 'syrup'          // 糖浆/调味
  | 'kettle'         // 烧水壶（鹅颈/温控）
  | 'scale'          // 称
  | 'mug'            // 杯子
  | 'other'

export interface InventoryItem {
  id: string
  category: InventoryCategory
  name: string
  brand?: string
  meta?: Record<string, string>
  addedAt: number
}

export interface ModuleConfig {
  id: ModuleId
  label: { zh: string; en: string }
  description: { zh: string; en: string }
  prompt: string
  ragFilter: string
  defaultMaterialCategories: InventoryCategory[]
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'pourover',
    label: { zh: '手冲', en: 'Pour Over' },
    description: {
      zh: 'V60 / Kalita / 法压 / 爱乐压 / 摩卡壶等通用冲煮参数与排查',
      en: 'V60, Kalita, French press, AeroPress, moka, general brewing',
    },
    prompt: '## 当前模块：手冲（通用）\n用户当前在与"手冲/通用冲煮模块"对话。优先考虑 V60 / Kalita / 法压 / 爱乐压 / 摩卡壶 / 冷萃 等器具的起步参数与诊断。所有参数建议参考 references/recipes-baseline.md。',
    ragFilter: '',
    defaultMaterialCategories: ['bean', 'grinder', 'brewer', 'dripper', 'filter', 'kettle', 'scale'],
  },
  {
    id: 'espresso',
    label: { zh: '意式', en: 'Espresso' },
    description: {
      zh: '萃取率、压力曲线、预浸泡、变压萃取、SOE 选豆',
      en: 'Yield, pressure curves, pre-infusion, pressure profiling, SOE',
    },
    prompt: '## 当前模块：意式浓缩\n用户当前在请教意式/浓缩相关问题。优先使用 get_recipe(method="espresso", ...) / get_parameters_guide / calibrate_grinder。涉及变压萃取时必须联网核实，不编造压力曲线参数。讨论萃取率（EY%）与 TDS 浓度时给出具体范围。',
    ragFilter: '',
    defaultMaterialCategories: ['bean', 'grinder', 'machine', 'scale'],
  },
  {
    id: 'milk',
    label: { zh: '奶咖', en: 'Milk Drinks' },
    description: {
      zh: '11 款经典奶咖（卡布/拿铁/澳白/可塔朵/玛奇朵/摩卡/康宝蓝/爱尔兰/维也纳/Affogato）',
      en: '11 classic milk drinks, ratios, milk texturing',
    },
    prompt: '## 当前模块：奶咖\n用户当前在请教奶咖相关问题。优先调用 get_milk_drink(name=..., language="zh")。回答聚焦在：咖啡基底（浓缩/Ristretto/Lungo）+ 奶（蒸汽、打发温度）+ 比例 + 顺序。不要泛泛甩 11 款清单，只答用户问的那一种。',
    ragFilter: '',
    defaultMaterialCategories: ['bean', 'machine', 'mug', 'syrup'],
  },
  {
    id: 'craft',
    label: { zh: '特调', en: 'Craft' },
    description: {
      zh: '连锁与创意特调咖啡 SOP（吉米/JPG/GABEE/Onyx/SEY/Blue Bottle 等）',
      en: 'Chain & signature craft recipes, must web-verify',
    },
    prompt: '## 当前模块：特调咖啡\n用户当前在请教特调/创意咖啡。优先 get_craft_recipe(...)。**任何具体门店或博主配方必须联网核实（AnySearch），标注来源 URL + 获取日期**，不编造门店当下菜单。涉及连锁配方时先 ask 用户具体想要哪一类（果味清爽/奶感醇厚/茶感/无咖啡因）。',
    ragFilter: '',
    defaultMaterialCategories: ['bean', 'syrup', 'mug'],
  },
  {
    id: 'sca',
    label: { zh: 'SCA 备考', en: 'SCA Prep' },
    description: {
      zh: 'SCA CSP 6 大模块 + Q-Grader 22 项考试（CVA 新标 + 三角杯测）',
      en: 'SCA CSP modules, Q-Grader exams, CVA scoring',
    },
    prompt: '## 当前模块：SCA / Q-Grader 备考\n用户当前在准备 SCA 或 Q-Grader 考试。优先调用 get_sca_path / get_sca_course / get_qgrader_exam / get_qgrader_study_plan / calculate_cva_score / get_triangle_protocol / search_sca_sources。涉及 CVA 评分时用 SCA-102/103/104/105 新标（1-9 分），旧 100 分制只在对照说明时使用。',
    ragFilter: '',
    defaultMaterialCategories: [],
  },
  {
    id: 'sensory',
    label: { zh: '感官', en: 'Sensory' },
    description: {
      zh: 'SCA 杯测 10 维度 + 风味轮 + 闻香瓶训练 + 感官训练计划',
      en: 'SCA cupping, flavor wheel, sensory training',
    },
    prompt: '## 当前模块：感官训练\n用户当前在做感官训练或杯测相关咨询。优先 get_sensory_training / get_flavor_wheel / calculate_cupping_score。涉及 10 个评分维度（干香/湿香/酸/醇厚/平衡/...）时按 SCA 标准；新人降级到风味轮类别。',
    ragFilter: '',
    defaultMaterialCategories: [],
  },
]

export const MODULE_IDS: ModuleId[] = MODULES.map(m => m.id)

export function getModule(id: ModuleId | undefined | null): ModuleConfig {
  if (id && MODULE_IDS.includes(id)) return MODULES.find(m => m.id === id)!
  return MODULES[0]  // 默认 pourover
}