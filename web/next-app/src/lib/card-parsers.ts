// Card parsers: turn MCP tool raw text returns into structured card data.
// Pure functions, no side effects. Return null when the input does not look
// like the expected tool output (the message then falls back to markdown).

// Matches a markdown table row "| a | b |" capturing the two cell texts.
const ROW_RE = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/

export interface CuppingDim { name: string; score: number }
export interface CuppingCardData {
  tool: 'calculate_cupping_score'
  dimensions: CuppingDim[]
  total: number
  taintDeduction: number
  faultDeduction: number
  final: number
  grade: string
  isSpecialty: boolean
  [key: string]: unknown
}

export function parseCuppingScore(raw: string): CuppingCardData | null {
  const dims: CuppingDim[] = []
  let total: number | null = null
  let finalScore: number | null = null
  let taintDeduction = 0
  let faultDeduction = 0
  let grade = ''
  let isSpecialty = false
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const m = line.match(ROW_RE)
    if (!m) continue
    const nameRaw = m[1]
    const scoreRaw = m[2]
    const name = nameRaw.replace(/\*\*/g, '').trim()
    const isBold = nameRaw.includes('**')
    const lower = name.toLowerCase()
    if (isBold && (name.includes('十项总分') || lower.includes('ten-item total'))) {
      total = parseFloat(scoreRaw.replace(/\*\*/g, ''))
    } else if (isBold && (name.includes('最终得分') || lower.includes('final score'))) {
      finalScore = parseFloat(scoreRaw.replace(/\*\*/g, ''))
    } else if (!isBold && (name.includes('小瑕疵') || lower.includes('taint'))) {
      const d = scoreRaw.match(/-?[\d.]+/)
      taintDeduction = d ? parseFloat(d[0]) : 0
    } else if (!isBold && (name.includes('大瑕疵') || lower.includes('fault'))) {
      const d = scoreRaw.match(/-?[\d.]+/)
      faultDeduction = d ? parseFloat(d[0]) : 0
    } else if (!isBold && /^[\d.]+$/.test(scoreRaw.trim())) {
      dims.push({ name, score: parseFloat(scoreRaw) })
    }
  }
  const gm = raw.match(/\*\*([^*]+)\*\*\s*\|\s*(?:精品级|Specialty):\s*(yes|no)/)
  if (gm) { grade = gm[1].trim(); isSpecialty = gm[2] === 'yes' }
  if (finalScore === null) return null
  return { tool: 'calculate_cupping_score', dimensions: dims, total: total ?? 0,
    taintDeduction, faultDeduction, final: finalScore, grade, isSpecialty }
}

export interface CvaCardData {
  tool: 'calculate_cva_score'
  affective: number
  legacy100: number
  band: string
  isSpecialty: boolean
  descriptiveRichness?: number
  extrinsic?: number
  [key: string]: unknown
}

export function parseCvaScore(raw: string): CvaCardData | null {
  let affective: number | null = null
  let legacy100: number | null = null
  let band = ''
  let isSpecialty = false
  let descriptiveRichness: number | null = null
  let extrinsic: number | null = null
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const m = line.match(ROW_RE)
    if (!m) continue
    const label = m[1].replace(/\*\*/g, '').trim()
    const value = m[2].trim()
    const lower = label.toLowerCase()
    if (lower.includes('1-9') || label.includes('情感总分')) {
      affective = parseFloat(value)
    } else if (lower.includes('legacy') || label.includes('100') ) {
      legacy100 = parseFloat(value)
    } else if (lower.includes('band') || label === '评级') {
      band = value
    } else if (lower.includes('specialty') || label === '精品级') {
      isSpecialty = value.toLowerCase().startsWith('yes')
    } else if (lower.includes('descriptive') || label.includes('描述性丰富度')) {
      const d = value.match(/[\d.]+/)
      descriptiveRichness = d ? parseFloat(d[0]) : null
    } else if (lower.includes('extrinsic') || label.includes('外在属性')) {
      const d = value.match(/[\d.]+/)
      extrinsic = d ? parseFloat(d[0]) : null
    }
  }
  if (affective === null) return null
  const out: CvaCardData = { tool: 'calculate_cva_score', affective,
    legacy100: legacy100 ?? 0, band, isSpecialty }
  if (descriptiveRichness !== null) out.descriptiveRichness = descriptiveRichness
  if (extrinsic !== null) out.extrinsic = extrinsic
  return out
}

export interface TriangleCardData {
  tool: 'get_triangle_protocol'
  rounds: number
  difficulty: string
  difficultyProgression: string
  passThreshold: string
  totalCups: number
  cupsPerRound: number
  oddCount: number
  sameCount: number
  [key: string]: unknown
}

export function parseTriangleProtocol(raw: string): TriangleCardData | null {
  let text = raw.trim()
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  let obj: any
  try { obj = JSON.parse(text) } catch { return null }
  if (typeof obj.rounds !== 'number') return null
  if (obj.ok === false) return null
  return { tool: 'get_triangle_protocol', rounds: obj.rounds,
    difficulty: obj.difficulty || '', difficultyProgression: obj.difficulty_progression || '',
    passThreshold: obj.pass_threshold || '', totalCups: obj.total_cups || obj.rounds * 3,
    cupsPerRound: obj.cups_per_round || 3, oddCount: obj.odd_count ?? 1, sameCount: obj.same_count ?? 2 }
}

export interface StudyItem { name: string; url: string; desc: string }
export interface StudyPlanPhase { dayStart: number; dayEnd: number; title: string; days: number; items: StudyItem[] }
export interface StudyPlanCardData {
  tool: 'get_qgrader_study_plan'
  totalDays: number
  phases: StudyPlanPhase[]
  [key: string]: unknown
}

const SECTION_RE = /^###\s+(?:第\s+|Day\s+)?(\d+)\s*[-–]\s*(\d+)\s*(?:天|days)?\s*[:：]?\s*(.+?)\s*\((\d+)\s*(?:天|days)\)/
const ITEM_RE = /^-\s+\[([^\]]*)\]\(([^)]*)\)\s*[—-]\s*(.+)$/

export function parseQgraderStudyPlan(raw: string): StudyPlanCardData | null {
  const phases: StudyPlanPhase[] = []
  const titleM = raw.match(/\((\d+)\s*(?:days|天)\)/)
  const totalDays = titleM ? parseInt(titleM[1]) : 0
  let current: StudyPlanPhase | null = null
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    const sm = line.match(SECTION_RE)
    if (sm) {
      if (current) phases.push(current)
      current = { dayStart: +sm[1], dayEnd: +sm[2], title: sm[3].trim(), days: +sm[4], items: [] }
      continue
    }
    const im = line.match(ITEM_RE)
    if (im && current) {
      current.items.push({ name: im[1], url: im[2], desc: im[3].trim() })
    }
  }
  if (current) phases.push(current)
  if (phases.length === 0) return null
  return { tool: 'get_qgrader_study_plan', totalDays, phases }
}

export const CARD_PARSERS: Record<string, (raw: string) => Record<string, unknown> | null> = {
  calculate_cupping_score: parseCuppingScore,
  calculate_cva_score: parseCvaScore,
  get_triangle_protocol: parseTriangleProtocol,
  get_qgrader_study_plan: parseQgraderStudyPlan,
}
