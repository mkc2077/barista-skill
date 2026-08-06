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
  /** 强调色（深色主题下的 swatch；与 globals.css [data-module] 覆盖保持一致） */
  accent: { light: string; dark: string }
  /** lucide 图标 key（用于主题/强调色选择与模块按钮） */
  iconKey: 'Coffee' | 'CupSoda' | 'GlassWater' | 'Sparkles' | 'Award' | 'Eye'
}

/** 每个模块配一个咖啡领域的小 SVG（用 lucide 不一定够时用 inline SVG） */
export const MODULE_CAFE_GLYPHS: Record<ModuleId, string> = {
  pourover: 'V60',  // 手冲滤杯（V60 风格）
  espresso: 'ES',  // 意式浓缩杯（双份）
  milk: 'CAP',  // 奶泡（cup + art pattern）
  craft: 'LCH',  // 分层特调（layered craft）
  sca: 'Q',     // SCA Q-Grader 证书徽章
  sensory: 'CUP', // 杯测勺+杯
}

/** 每个模块工作流的输入字段（v7 P3d） */
export interface ModuleFieldOption {
  value: string
  label: string
  hint?: string
}

export interface ModuleField {
  key: string
  label: string
  hint?: string
  type: 'select' | 'chips' | 'text' | 'text-optional'
  options?: ModuleFieldOption[]
  placeholder?: string
}

export interface ModuleConfig {
  id: ModuleId
  label: { zh: string; en: string }
  description: { zh: string; en: string }
  prompt: string
  ragFilter: string
  defaultMaterialCategories: InventoryCategory[]
  accent: { light: string; dark: string }
  iconKey: 'Coffee' | 'CupSoda' | 'GlassWater' | 'Sparkles' | 'Award' | 'Eye'
  /** 输入字段（按模块定制） */
  fields: ModuleField[]
  /** 提交后的追问链（按顺序询问） */
  followUps: string[]
  /** 输出侧标题：通用手法 vs 大师/博主手法 */
  outputLabels: { generic: string; master: string }
}

/** 大师/博主 SOP 库（精简版，按模块分类） */
export interface MasterSOP {
  id: string
  moduleId: ModuleId
  name: string
  source: string  // 出处
  brief: string   // 一句话手法特征
  url?: string    // 原文链接
  keywords: string[]  // 匹配关键词（如滤杯/产地/期望风味）
}

export const MASTER_SOPS: MasterSOP[] = [
  // 手冲
  { id: 'pour-tetsu', moduleId: 'pourover', name: '粕谷哲 4:6 法', source: 'Tetsu Kasuya 2016 WBC 冠军', brief: '分两段注水，先甜后浓；适合浅烘、酸感豆', keywords: ['v60', '浅烘', '酸'] },
  { id: 'pour-tetsu-deep', moduleId: 'pourover', name: '粕谷哲 4:6 法（中深烘调整）', source: 'Tetsu Kasuya', brief: '4:6 法中深烘变体，先浓后甜', keywords: ['v60', '中烘', '深烘'] },
  { id: 'pour-origami-james', moduleId: 'pourover', name: 'James Hoffmann 单段中心注水', source: 'James Hoffmann YouTube', brief: 'Origami/平底滤杯单段快速绕圈，干净清晰', keywords: ['origami', 'kalita', '清晰'] },
  { id: 'pour-george-1', moduleId: 'pourover', name: 'George Howell 单段慢注', source: 'George Howell', brief: '细水流慢注 3min，强调萃取均匀', keywords: ['v60', '平衡'] },
  { id: 'pour-chemex', moduleId: 'pourover', name: 'Chemex 5 段式', source: 'Chemex 官方', brief: '梅卡克斯厚滤纸 5 段注水，分批均匀萃取', keywords: ['chemex', '厚滤纸'] },
  // 意式
  { id: 'esp-flat-9bar', moduleId: 'espresso', name: 'Flat 9 Bar 标准', source: 'SCA 教学', brief: '9bar 恒压 25-30s 萃取，EY 18-22%', keywords: ['意式机', '9bar', '标准'] },
  { id: 'esp-lance-hedrick', moduleId: 'espresso', name: 'Lance Hedrick 减压变压', source: 'Lance Hedrick YouTube', brief: '预浸降压 + 后期减压，甜感突出', keywords: ['变压', '甜'] },
  { id: 'esp-julian', moduleId: 'espresso', name: 'Julian 给你的「苦甜平衡」配方', source: '36 味咖啡实验室', brief: '深烘意式机 1:2 ratio 高温快萃取', keywords: ['深烘', '平衡'] },
  // 意式：超萃 / 快萃（v7 P3d.2 用户实测方案）
  {
    id: 'esp-over-extraction',
    moduleId: 'espresso',
    name: '超萃 · 詹森瑰夏 92℃',
    source: '本机实测方案（v7 P3d.2）',
    brief: '20g 粉 / 92℃ / 85% 通过率 / 3s 预浸 / 6g/s → 5s 时降至 3g/s / 30s 萃 60g + 90g 水 60g 冰',
    keywords: ['超萃', '瑰夏', '减压', '变压', '冰'],
  },
  {
    id: 'esp-fast-extraction',
    moduleId: 'espresso',
    name: '快萃 · 98℃ 阶梯降压',
    source: '本机实测方案（v7 P3d.2）',
    brief: '15g 粉 / 98℃ / 1:6 粉水比 / Ditting 3 格 / PCL cylin 粉碗 / 9bar×5s → 7bar×7s → 6bar×5s → 5bar×4s / 150-180g 冰',
    keywords: ['快萃', '阶梯', '变压', '冰', '夏季'],
  },
]

/* ─── 牛奶品牌推荐库（v7 P3d.2） ─── */
export interface MilkBrand {
  name: string
  cat: 'whole' | 'oat'
  fat: string          // 脂肪含量 / 特性
  use: string          // 推荐场景
  where: string        // 哪里买
  brands_using: string[]  // 谁在用
}

export const MILK_BRANDS: MilkBrand[] = [
  { name: '黑石咖啡 · 行动力 4.0', cat: 'whole', fat: '高脂 4.0% / 蛋白 3.6%', use: '拉花厚泡、dirty 液面分层、生椰拿铁厚感', where: '黑石咖啡门店 / 微信小程序', brands_using: ['黑石咖啡（全系）'] },
  { name: '沃集鲜 · 鲜牛奶', cat: 'whole', fat: '鲜奶 3.6g 蛋白 / 100ml', use: '日常奶咖首选、甜感足', where: '盒马 / 京东到家', brands_using: ['%Arabica（部分门店）', 'Manner'] },
  { name: '悦鲜活 · 低温鲜奶', cat: 'whole', fat: '低温巴氏 / 鲜感保留好', use: '不抢咖啡风味、奶咖平衡', where: '便利店 / 美团买菜', brands_using: ['%Arabica（部分门店）'] },
  { name: '卫岗 · 新绿园 Pro', cat: 'whole', fat: '优质乳蛋白', use: '奶咖平衡、性价比高', where: '南京 / 苏南区域', brands_using: ['南京本地咖啡店'] },
  { name: 'OATLY · 咖啡大师（燕麦奶）', cat: 'oat', fat: '燕麦基 / 适配咖啡', use: '燕麦拿铁标配、不会分层', where: '盒马 / 便利店', brands_using: ['%Arabica', 'M Stand', 'Manner'] },
  { name: 'OATOAT · 茶饮燕麦奶', cat: 'oat', fat: '燕麦基（更低糖）', use: '燕麦拿铁清爽版', where: '京东 / 微信小程序', brands_using: ['精品咖啡馆'] },
]

/* ─── 滤纸品牌型号（v7 P3d.2） ─── */
export interface FilterBrand {
  brand: string
  model: string
  dripper: string[]
  flow: 'fast' | 'medium' | 'slow'
  bleaching: 'white' | 'natural' | 'n/a'
  usedBy: string[]
  note: string
}

export const FILTER_BRANDS: FilterBrand[] = [
  { brand: 'Hario', model: 'V60 02 漂白纸', dripper: ['v60'], flow: 'fast', bleaching: 'white', usedBy: ['粕谷哲', 'Hoffmann（部分）'], note: '纸质薄、流速快，浅烘酸感豆首选' },
  { brand: 'Hario', model: 'V60 02 未漂白', dripper: ['v60'], flow: 'medium', bleaching: 'natural', usedBy: ['多数精品咖啡馆'], note: '纸质略厚，流速适中，多数情况通杀' },
  { brand: 'Kliba (Cafec)', model: 'Abaca 深棕纸', dripper: ['v60', 'kalita'], flow: 'medium', bleaching: 'natural', usedBy: ['2018 WBC 季军'], note: '马尼拉麻纸，吸附率强、苦味低' },
  { brand: 'Cafec', model: 'T-90 漂白纸', dripper: ['v60'], flow: 'fast', bleaching: 'white', usedBy: ['日本多家精品店'], note: '比 Hario 02 略薄、流速稍快' },
  { brand: 'Melitta', model: 'Original 1x4 漂白', dripper: ['melitta'], flow: 'medium', bleaching: 'white', usedBy: ['德式传统'], note: 'Melitta 扇形标配' },
  { brand: 'Origami', model: 'Origami 折纸滤纸', dripper: ['origami'], flow: 'medium', bleaching: 'white', usedBy: ['Hoffmann', '多数 Origami 用户'], note: '折纸滤杯专用，半锥形通用' },
  { brand: 'Kalita', model: 'Wave 185/155 漂白', dripper: ['kalita'], flow: 'slow', bleaching: 'white', usedBy: ['George Howell'], note: '平底三孔，流速慢、浸泡均匀' },
]

/* ─── 茶基底泡茶 SOP（v7 P3d.2 用户定制） ─── */
export interface TeaBaseRecipe {
  name: string
  ratio: string
  leafG: number
  waterG: number
  tempC: number
  steepMin: number
  iceG: number
  flavor: string
  pairing: string[]
}

export const TEA_RECIPES: TeaBaseRecipe[] = [
  { name: '茉莉花茶', ratio: '1:35', leafG: 10, waterG: 205, tempC: 80, steepMin: 7, iceG: 100, flavor: '花香清雅、与咖啡融合不抢味', pairing: ['茉莉拿铁', '茉莉dirty'] },
  { name: '绿茶（龙井/碧螺春）', ratio: '1:50', leafG: 10, waterG: 350, tempC: 80, steepMin: 5, iceG: 150, flavor: '清爽草本、回甘明显', pairing: ['抹茶拿铁', '绿茶冰拿'] },
  { name: '鸭屎香（凤凰单丛）', ratio: '1:50', leafG: 10, waterG: 350, tempC: 90, steepMin: 8, iceG: 150, flavor: '蜜兰香突出、特调中的高级感', pairing: ['鸭屎香dirty', '潮汕特调'] },
  { name: '红茶（祁门/正山小种）', ratio: '1:25', leafG: 10, waterG: 200, tempC: 100, steepMin: 18, iceG: 50, flavor: '浓郁醇厚、奶感融合好', pairing: ['脏脏茶', '英式奶咖茶'] },
]

/* ─── 意式萃取预设（v7 P3d.2） ─── */
export interface EspressoPreset {
  id: string
  name: string
  bean: string
  doseG: number
  tempC: number
  grindPassPct: number
  grindNote: string
  basket: string
  waterTempRamp: { pressure: number; seconds: number }[]
  preInfuseSec: number
  totalSeconds: number
  liquidG: number
  ice?: { waterG: number; iceG: number }
  ratio: string
  notes: string
  requireFlowProfile: boolean
}

export const ESPRESSO_PRESETS: EspressoPreset[] = [
  {
    id: 'over-janson',
    name: '超萃 · 詹森瑰夏',
    bean: '詹森瑰夏（Janson Geisha）',
    doseG: 20, tempC: 92, grindPassPct: 85, grindNote: '通过率 85%',
    basket: '20g VST 或 IMS 精密粉碗',
    preInfuseSec: 3,
    waterTempRamp: [
      { pressure: 6, seconds: 5 },
      { pressure: 3, seconds: 25 },
    ],
    totalSeconds: 30, liquidG: 60, ratio: '20g 粉 → 60g 液',
    ice: { waterG: 90, iceG: 60 },
    notes: '前 5s 6g/s 流速，之后降至 3g/s；总时长 30s。必须咖啡机支持变压调温。',
    requireFlowProfile: true,
  },
  {
    id: 'fast-summer',
    name: '快萃 · 98℃ 阶梯降压',
    bean: 'SOE 或中烘拼配',
    doseG: 15, tempC: 98, grindPassPct: 85, grindNote: 'Ditting 研磨 3 格',
    basket: 'PCL cylin（圆柱粉碗）',
    preInfuseSec: 0,
    waterTempRamp: [
      { pressure: 9, seconds: 5 },
      { pressure: 7, seconds: 7 },
      { pressure: 6, seconds: 5 },
      { pressure: 5, seconds: 4 },
    ],
    totalSeconds: 21, liquidG: 90, ratio: '15g 粉 → 90g 液 (1:6)',
    ice: { waterG: 0, iceG: 170 },
    notes: '9 → 7 → 6 → 5 bar 阶梯降压；总时长约 21s。完成后加 150-180g 冰稀释。',
    requireFlowProfile: true,
  },
]

/* ─── 冰手冲模式（v7 P3d.2） ─── */
export type IcedPourMode = 'direct' | 'on_ice' | 'normal'

export interface IcedPourGuide {
  mode: IcedPourMode
  label: string
  method: string
  ratio: string
  gear?: string[]
  iceG?: number
}

export const ICED_POUR_GUIDES: IcedPourGuide[] = [
  { mode: 'direct', label: '冰球/分享壶直饮', method: '热咖啡液直接倒在冰球上，或用 emptyglas 净分享壶降温', ratio: '热液 100% 浓度（不稀释）', gear: ['冰球（推荐 Crystal Tea / IKEA 透明冰格）', 'emptyglas 净分享壶（容量 250 / 450 ml）'] },
  { mode: 'on_ice', label: '加冰块', method: '冰块占杯 30-40%，热液倒在冰上快速降温稀释', ratio: '热液:冰 ≈ 2:1（约 33% 稀释）', iceG: 150 },
  { mode: 'normal', label: '常温/冰水直兑', method: '热液加冰水直接稀释', ratio: '热液:冰水 1:1' },
]

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
    accent: { light: 'oklch(50% 0.16 45)', dark: 'oklch(64% 0.15 45)' },
    iconKey: 'Coffee',
    fields: [
      { key: 'bean', label: '豆子信息', hint: '产地 / 处理法 / 烘焙度 / 品种', type: 'text', placeholder: '如 耶加雪菲 / 日晒 / 浅-中烘 / Heirloom' },
      { key: 'dripper', label: '滤杯', type: 'select', options: [
        { value: '', label: '-- 选择 --' },
        { value: 'v60', label: 'Hario V60', hint: '锥形 / 流速快' },
        { value: 'kalita', label: 'Kalita Wave', hint: '平底 / 浸泡均匀' },
        { value: 'origami', label: 'Origami', hint: '半锥形 / 折纸滤纸通用' },
        { value: 'chemex', label: 'Chemex', hint: '玻璃厚滤纸' },
        { value: 'melitta', label: 'Melitta', hint: '传统扇形' },
        { value: 'clever', label: '聪明杯', hint: '浸泡式' },
      ]},
      { key: 'material', label: '滤杯材质', type: 'chips', options: [
        { value: 'ceramic', label: '陶瓷' },
        { value: 'glass', label: '玻璃' },
        { value: 'plastic', label: '树脂' },
        { value: 'metal', label: '金属' },
      ]},
      { key: 'filter', label: '滤纸', type: 'chips', options: [
        { value: 'white', label: '漂白' },
        { value: 'natural', label: '未漂白' },
        { value: 'metal', label: '金属片' },
        { value: 'cloth', label: '滤布' },
      ]},
      { key: 'strength', label: '浓度', type: 'chips', options: [
        { value: 'light', label: '淡 1:16' },
        { value: 'medium', label: '中 1:14' },
        { value: 'strong', label: '浓 1:12' },
      ]},
      { key: 'temp', label: '热 / 冰', type: 'chips', options: [
        { value: 'hot', label: '热' },
        { value: 'ice', label: '冰冲（冰块代水）' },
      ]},
      { key: 'flavor', label: '期望风味', type: 'chips', options: [
        { value: 'sweet', label: '偏甜' },
        { value: 'acid', label: '偏酸' },
        { value: 'balanced', label: '平衡' },
        { value: 'body', label: '醇厚' },
      ]},
      { key: 'bypass', label: '接受旁通水?', hint: '萃取后加水稀释尾段', type: 'chips', options: [
        { value: 'yes', label: '接受' },
        { value: 'no', label: '不接受' },
      ]},
      { key: 'paper_brand', label: '滤纸品牌型号', hint: '不同品牌流速/吸附率差异显著；不填可让顾问联网推荐', type: 'chips', options: [
        { value: 'hario_white', label: 'Hario 02 漂白' },
        { value: 'hario_natural', label: 'Hario 02 未漂白' },
        { value: 'kliba_abaca', label: 'Kliba Abaca 深棕' },
        { value: 'cafec_t90', label: 'Cafec T-90 漂白' },
        { value: 'melitta_orig', label: 'Melitta Original 1x4' },
        { value: 'origami_white', label: 'Origami 漂白' },
        { value: 'kalita_wave', label: 'Kalita Wave 185/155' },
      ]},
      { key: 'iced_mode', label: '冰手冲方式', hint: '仅在选「冰冲」时追问；直饮 vs 加冰 vs 冰水', type: 'chips', options: [
        { value: 'direct', label: '直饮（冰球/分享壶）' },
        { value: 'on_ice', label: '加冰块' },
        { value: 'normal', label: '冰水直兑' },
      ]},
    ],
    followUps: ['water', 'useExistingGear', 'levelCheck'],
    outputLabels: { generic: '通用手法', master: '大师/博主手法' },
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
    accent: { light: 'oklch(44% 0.11 30)', dark: 'oklch(62% 0.11 30)' },
    iconKey: 'CupSoda',
    fields: [
      { key: 'bean', label: '豆子信息', hint: '产地 / 处理法 / 烘焙度', type: 'text', placeholder: '如 巴西 / 日晒 / 中深烘 SOE' },
      { key: 'basket', label: '粉碗尺寸', type: 'chips', options: [
        { value: 'single', label: '单份 7g' },
        { value: 'double', label: '双份 14g' },
        { value: 'triple', label: '三份 18g' },
        { value: 'triple_lungo', label: '三份长 21g' },
      ]},
      { key: 'shot', label: '目标萃取', type: 'chips', options: [
        { value: 'ristretto', label: 'Ristretto 1:1' },
        { value: 'normale', label: 'Normale 1:2' },
        { value: 'lungo', label: 'Lungo 1:3' },
        { value: 'allonge', label: 'Allongé 1:4' },
      ]},
      { key: 'ey', label: '萃取率偏好', type: 'chips', options: [
        { value: 'safe', label: '稳妥 18-22%' },
        { value: 'yield', label: '高产 22-26%' },
      ]},
      { key: 'flow', label: '流量/萃取方式', type: 'chips', options: [
        { value: 'classic', label: '经典 9bar 恒压' },
        { value: 'ramp', label: 'Ramp 升压' },
        { value: 'declump', label: '减压收尾' },
        { value: 'pre', label: '预浸泡长' },
        { value: 'over_extraction', label: '超萃 · 詹森瑰夏 92℃' },
        { value: 'fast_extraction', label: '快萃 · 98℃ 阶梯降压' },
      ]},
      { key: 'has_flow_profile', label: '机器是否变压调温?', hint: '超萃/快萃/变压需要咖啡机支持', type: 'chips', options: [
        { value: 'yes', label: '支持（La Marzocco / Decent / Slayer 等）' },
        { value: 'no', label: '不支持（普通泵压）' },
        { value: 'unknown', label: '不确定' },
      ]},
      { key: 'basket', label: '粉碗', type: 'select', options: [
        { value: '', label: '-- 选择 --' },
        { value: 'vst_20g', label: 'VST 20g 精密粉碗' },
        { value: 'ims_20g', label: 'IMS 20g 精密粉碗' },
        { value: 'pcl_cylin', label: 'PCL cylin 圆柱粉碗' },
        { value: 'stock_18g', label: '原厂 18g 粉碗' },
        { value: 'stock_14g', label: '原厂 14g 粉碗' },
      ]},
      { key: 'flavor', label: '期望风味', type: 'chips', options: [
        { value: 'bitter', label: '偏苦' },
        { value: 'acid', label: '偏酸' },
        { value: 'sweet', label: '偏甜' },
        { value: 'body', label: '醇厚' },
      ]},
    ],
    followUps: ['water', 'useExistingGear', 'levelCheck'],
    outputLabels: { generic: '通用萃取参数', master: '大师/冠军配方' },
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
    accent: { light: 'oklch(58% 0.09 85)', dark: 'oklch(74% 0.07 85)' },
    iconKey: 'GlassWater',
    fields: [
      { key: 'base', label: '咖啡基底', type: 'chips', options: [
        { value: 'espresso', label: 'Espresso' },
        { value: 'ristretto', label: 'Ristretto' },
        { value: 'lungo', label: 'Lungo' },
      ]},
      { key: 'drink', label: '想做的奶咖', type: 'select', options: [
        { value: '', label: '-- 选择 --' },
        { value: 'latte', label: '拿铁 Latte' },
        { value: 'cappuccino', label: '卡布奇诺 Cappuccino' },
        { value: 'flatwhite', label: '澳白 Flat White' },
        { value: 'cortado', label: '可塔朵 Cortado' },
        { value: 'macchiato', label: '玛奇朵 Macchiato' },
        { value: 'mocha', label: '摩卡 Mocha' },
        { value: 'affogato', label: 'Affogato' },
        { value: 'vienna', label: '维也纳 Vienna' },
      ]},
      { key: 'milk', label: '牛奶', type: 'chips', options: [
        { value: 'whole', label: '全脂牛奶' },
        { value: 'oat', label: '燕麦奶' },
      ]},
      { key: 'dish_type', label: '特殊品类', hint: 'dirty / 生椰拿铁 等需要特殊牛奶和比例', type: 'chips', options: [
        { value: 'none', label: '常规奶咖' },
        { value: 'dirty', label: 'Dirty（液面分层）' },
        { value: 'coconut_latte', label: '生椰拿铁（椰乳替代）' },
        { value: 'iced', label: '厚椰乳 / 椰子水' },
      ]},
      { key: 'milk_brand', label: '牛奶品牌', hint: '留空则提交后联网推荐', type: 'text-optional', placeholder: '如 行动力 4.0 / OATLY 咖啡大师 / 沃集鲜' },
      { key: 'flavor', label: '期望风格', type: 'chips', options: [
        { value: 'strong', label: '咖啡感强' },
        { value: 'balanced', label: '奶咖平衡' },
        { value: 'milky', label: '奶香为主' },
        { value: 'sweet', label: '偏甜' },
      ]},
      { key: 'temp', label: '奶温', type: 'chips', options: [
        { value: 'hot', label: '热 60-65℃' },
        { value: 'warm', label: '温 55-60℃' },
        { value: 'iced', label: '冰奶咖' },
      ]},
    ],
    followUps: ['water', 'useExistingGear', 'milkBrandLookup'],
    outputLabels: { generic: '通用配比', master: '冠军/精品配方' },
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
    accent: { light: 'oklch(52% 0.16 355)', dark: 'oklch(68% 0.13 355)' },
    iconKey: 'Sparkles',
    fields: [
      { key: 'category', label: '品类', type: 'chips', options: [
        { value: 'fruit', label: '果味清爽' },
        { value: 'milky', label: '奶感醇厚' },
        { value: 'tea', label: '茶咖 / 茶基底饮品' },
        { value: 'decaf', label: '无咖啡因' },
        { value: 'sparkling', label: '气泡/苏打' },
      ]},
      { key: 'tea_base', label: '茶基底（茶咖时必填）', hint: '茉莉/绿茶/鸭屎香/红茶等；选其它会联网查配方', type: 'chips', options: [
        { value: 'none', label: '不用茶基底' },
        { value: 'jasmine', label: '茉莉花茶' },
        { value: 'green', label: '绿茶（龙井/碧螺春）' },
        { value: 'yashixiang', label: '鸭屎香（凤凰单丛）' },
        { value: 'black', label: '红茶（祁门/正山小种）' },
      ]},
      { key: 'sweetness', label: '甜度', type: 'chips', options: [
        { value: 'no', label: '无糖' },
        { value: 'low', label: '低糖' },
        { value: 'medium', label: '中糖' },
        { value: 'high', label: '高糖' },
      ]},
      { key: 'ice', label: '冰量', type: 'chips', options: [
        { value: 'hot', label: '热' },
        { value: 'less', label: '少冰' },
        { value: 'normal', label: '正常' },
      ]},
      { key: 'base', label: '咖啡基底', type: 'chips', options: [
        { value: 'espresso', label: 'Espresso' },
        { value: 'cold_brew', label: '冷萃' },
        { value: 'pourover', label: '手冲（热/冷）' },
        { value: 'none', label: '不用咖啡' },
      ]},
      { key: 'diet', label: '饮食约束', type: 'chips', options: [
        { value: 'normal', label: '无' },
        { value: 'vegan', label: '素食/植物奶' },
        { value: 'low_caffeine', label: '低咖啡因' },
        { value: 'lactose_free', label: '乳糖不耐' },
      ]},
    ],
    followUps: ['water', 'useExistingGear', 'levelCheck'],
    outputLabels: { generic: '通用特调骨架', master: '门店 / 博主 SOP' },
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
    accent: { light: 'oklch(50% 0.12 255)', dark: 'oklch(66% 0.11 255)' },
    iconKey: 'Award',
    fields: [
      { key: 'goal', label: '目标认证', type: 'chips', options: [
        { value: 'csp_brew', label: 'CSP Brewing' },
        { value: 'csp_barista', label: 'CSP Barista Skills' },
        { value: 'csp_sensory', label: 'CSP Sensory' },
        { value: 'csp_roast', label: 'CSP Roasting' },
        { value: 'csp_green', label: 'CSP Green Coffee' },
        { value: 'qgrader', label: 'Q-Grader' },
      ]},
      { key: 'stage', label: '当前阶段', type: 'chips', options: [
        { value: 'planning', label: '准备中' },
        { value: 'studying', label: '学习中' },
        { value: 'practicing', label: '模拟考中' },
        { value: 'reviewing', label: '复盘错题' },
      ]},
      { key: 'hours', label: '周学习时间', type: 'chips', options: [
        { value: 'less_3', label: '<3 小时' },
        { value: '3_6', label: '3-6 小时' },
        { value: '6_10', label: '6-10 小时' },
        { value: 'more_10', label: '>10 小时' },
      ]},
      { key: 'deadline', label: '期望考试月份', type: 'text-optional', placeholder: '如 2027-03' },
    ],
    followUps: ['levelCheck'],
    outputLabels: { generic: '通用备考路径', master: '考过的前辈分享' },
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
    accent: { light: 'oklch(48% 0.10 150)', dark: 'oklch(66% 0.09 150)' },
    iconKey: 'Eye',
    fields: [
      { key: 'goal', label: '训练目标', type: 'chips', options: [
        { value: 'beginner', label: '新手入门风味轮' },
        { value: 'cupping', label: '杯测打分入门' },
        { value: 'aroma_kit', label: 'Le Nez du Café 闻香瓶' },
        { value: 'triangle', label: '三角杯测练习' },
        { value: 'production', label: '日常盲品找缺陷' },
      ]},
      { key: 'frequency', label: '训练频率', type: 'chips', options: [
        { value: 'weekly', label: '每周 1 次' },
        { value: '3week', label: '每 3 天 1 次' },
        { value: 'daily', label: '每天' },
      ]},
      { key: 'kit', label: '已有器具', type: 'chips', options: [
        { value: 'wheel', label: '风味轮' },
        { value: 'aroma', label: '闻香瓶' },
        { value: 'cupping_glasses', label: '杯测杯 5+ 个' },
      ]},
    ],
    followUps: ['levelCheck'],
    outputLabels: { generic: '训练计划', master: 'SCA 杯测标准' },
  },
]

export const MODULE_IDS: ModuleId[] = MODULES.map(m => m.id)

export function getModule(id: ModuleId | undefined | null): ModuleConfig {
  if (id && MODULE_IDS.includes(id)) return MODULES.find(m => m.id === id)!
  return MODULES[0]  // 默认 pourover
}