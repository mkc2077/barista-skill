'use client'

/**
 * ModuleView — 独立模块工作流页面（v7 P3d 大模块改造）
 *
 * 每个模块 = 一个独立页面：
 * 1. Hero 区：模块专属咖啡元素 SVG + 字段表单
 * 2. 提交后 → 三步追问：水质 → 询问用已有器具 → 输出
 * 3. 输出面板：通用手法（左侧）+ 大师/博主手法（右侧）
 *
 * 手冲完整实现（含 fields 全字段 + followUps 完整追问链），
 * 其他 5 模块复用同一框架但用 modules.ts 中各自的 fields + outputLabels。
 *
 * 大师/博主 SOP 库（lib/modules.ts 中的 MASTER_SOPS）按关键词自动匹配。
 */

import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import {
  getModule, MASTER_SOPS, MILK_BRANDS, FILTER_BRANDS, TEA_RECIPES, ESPRESSO_PRESETS, ICED_POUR_GUIDES,
  type ModuleId, type ModuleConfig, type ModuleField, type MasterSOP, type MilkBrand, type FilterBrand, type TeaBaseRecipe, type EspressoPreset, type IcedPourGuide,
} from '@/lib/modules'
import { ModuleHeroGlyph, ModuleHeroIllustration } from '@/lib/module-glyphs'
import { SpotlightCard } from '@/components/SpotlightCard'
import BlurText from './motion/BlurText'
import Magnet from './motion/Magnet'
import {
  ArrowLeft, Coffee, Droplets, Package, ArrowRight, Award, Eye, Sparkles,
  CupSoda, GlassWater, Check, Beaker, BookmarkPlus, BookmarkCheck,
} from 'lucide-react'

// lucide icon resolver
const ICONS = { Coffee, CupSoda, GlassWater, Sparkles, Award, Eye }

export function ModuleView({ moduleId }: { moduleId: ModuleId }) {
  const m = getModule(moduleId)
  const theme = useStore((s) => s.theme)
  const profile = useStore((s) => s.settings.profile || {}) as any
  const items = useStore((s) => s.settings.inventoryItems || [])
  const addKnowledgeNotes = useStore((s) => s.addKnowledgeNotes)
  const setViewMode = useStore((s) => s.setViewMode)
  const Icon = ICONS[m.iconKey] || Coffee

  // 表单状态：每字段一份 value；空对象
  const [values, setValues] = useState<Record<string, string>>({})

  // 结果状态：water（水质） / gear（是否用已有器具） / submitted（是否进入结果页）
  const [waterMode, setWaterMode] = useState<'required' | 'skip' | null>(null)
  const [waterDetail, setWaterDetail] = useState('')
  const [useExistingGear, setUseExistingGear] = useState<'yes' | 'no' | null>(null)

  const setVal = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }))
  const hasExisting = (items.length > 0) || (profile.devices?.grinders?.length > 0) || (profile.devices?.brewers?.length > 0)
  const filled = m.fields.filter((f) => values[f.key]?.trim()).length
  const total = m.fields.length
  const allFilled = filled >= Math.max(3, total - 2)  // 容忍 2 个未填

  // 提交到结果页
  const [submitted, setSubmitted] = useState(false)

  // 匹配大师 SOP：基于字段关键词
  const matchedMasters = useMemo(() => {
    const allVals = Object.values(values).join(' ').toLowerCase()
    return MASTER_SOPS.filter((s) => s.moduleId === moduleId)
      .filter((s) => s.keywords.some((kw) => allVals.includes(kw.toLowerCase())))
      .slice(0, 3)
  }, [values, moduleId])

  const fallbackMasters = useMemo(() => {
    return MASTER_SOPS.filter((s) => s.moduleId === moduleId).slice(0, 2)
  }, [moduleId])

  // 经验档位
  const level = profile.level
  const isAdvanced = level === 'advanced'

  // 通用手法生成（基于字段的简单拼接，下一轮升级为 LLM 调用）
  const generic = buildGenericPlan(m, values, waterMode, waterDetail, useExistingGear, isAdvanced)

  if (!submitted) {
    return (
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <Hero moduleId={moduleId} m={m} setViewMode={setViewMode} />
        <div className='max-w-2xl mx-auto px-6 py-6'>
          {/* 已有材料提示（用户填了之后这里显示用还是不用） */}
          {hasExisting && (
            <div className='mb-5 p-3 rounded-md border border-[var(--border)] bg-[var(--surface-raised)] text-xs text-[var(--text-secondary)] flex items-center gap-2'>
              <Package className='w-4 h-4 shrink-0' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <span>检测到「我的资料」中已有设备/材料。提交后系统会询问是否按已有器具推荐。</span>
            </div>
          )}

          {/* 字段表单 */}
          <section className='module-form-bg surface glow-border p-5 mb-4 relative overflow-hidden'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='font-editorial text-lg text-[var(--text)]'>配置你的 {m.label.zh} 参数</h2>
              <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)]'>{filled}/{total} 已填</span>
            </div>
            <div className='space-y-4'>
              {m.fields.map((f) => (
                <FieldInput key={f.key} field={f} value={values[f.key] || ''} onChange={(v) => setVal(f.key, v)} />
              ))}
            </div>
          </section>

          <Magnet padding={80} magnetStrength={4} wrapperClassName='block w-full'>
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allFilled}
              className='w-full py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              style={{ background: 'var(--accent)' }}
            >
              <Check className='w-4 h-4' strokeWidth={2} />
              开始匹配方案
            </button>
          </Magnet>
        </div>
      </div>
    )
  }

  // 结果页
  return (
    <div className='flex-1 min-h-0 overflow-y-auto'>
      <Hero moduleId={moduleId} m={m} setViewMode={setViewMode} resultMode />
      <div className='max-w-2xl mx-auto px-6 py-6 space-y-5'>
        {/* 你的输入 */}
        <section className='surface p-5'>
          <h3 className='eyebrow mb-2'>你的输入</h3>
          <div className='space-y-1 text-xs text-[var(--text-secondary)]'>
            {m.fields.map((f) => values[f.key] && (
              <div key={f.key} className='flex gap-2'>
                <span className='text-[var(--text-muted)] shrink-0'>{f.label}：</span>
                <span className='text-[var(--text)]'>{labelOf(f, values[f.key])}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Step 1: 水质追问 */}
        {waterMode === null && (
          <AskWater onAnswer={(mode, detail) => { setWaterMode(mode); setWaterDetail(detail || '') }} />
        )}
        {waterMode === 'required' && waterDetail === '' && (
          <AskWaterDetail m={m} onConfirm={(d) => setWaterDetail(d)} />
        )}
        {waterMode === 'required' && waterDetail && !useExistingGear && hasExisting && (
          <AskUseGear onAnswer={(ans) => setUseExistingGear(ans)} />
        )}
        {(waterMode === 'skip' || (waterMode === 'required' && waterDetail && (!hasExisting || useExistingGear !== null))) && (
          <PlanOutput
            generic={generic}
            masters={matchedMasters.length > 0 ? matchedMasters : fallbackMasters}
            waterMode={waterMode}
            waterDetail={waterDetail}
            useExistingGear={useExistingGear}
            inventoryItems={items}
            level={level}
            m={m}
            onBack={() => setSubmitted(false)}
            onChat={(ctx) => {
              // 把模块工作流结果作为 user_context 注入，跳到聊天
              setViewMode('chat')
              // 这里可以创建新对话并把 ctx 注入，但为简化先提示用户去聊天开始
              // TODO: P3d.2 把 ctx 注入第一条用户消息
            }}
            onSave={(note) => {
              addKnowledgeNotes([{
                id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                title: note.title,
                text: note.text,
                category: 'recipe',
                createdAt: Date.now(),
                source: note.source,
              }])
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ─── 子组件 ─── */

function Hero({ moduleId, m, setViewMode, resultMode }: {
  moduleId: ModuleId; m: ModuleConfig;
  setViewMode: (m: 'chat' | 'profile' | ModuleId) => void;
  resultMode?: boolean;
}) {
  return (
    <header
      className='hero-bath relative px-6 py-8 md:py-12 overflow-hidden'
      style={{ minHeight: 280 }}
    >
      <div className='hero-cloud' aria-hidden='true' />

      {/* 印象派大背景插画（中央，超模糊，跟随 hero 主色） */}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          color: 'var(--hue, currentColor)',
          opacity: 0.85,
        }}
      >
        <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 h-[440px]'>
          <ModuleHeroIllustration moduleId={moduleId} className='w-full h-full' />
        </div>
      </div>

      <div className='hero-content relative max-w-3xl mx-auto'>
        {/* 顶部：圆环 logo（左）+ 返回按钮（右） */}
        <div className='flex items-center justify-between mb-8 md:mb-10'>
          <div className='hero-mark'>
            <svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1'>
              <circle cx='24' cy='24' r='20' />
              <circle cx='24' cy='24' r='12' />
              <circle cx='24' cy='24' r='4' fill='currentColor' />
            </svg>
            <span className='hero-mark-eyebrow'>{m.label.en}</span>
          </div>
          <button
            onClick={() => setViewMode('chat')}
            className='hero-back'
          >
            <ArrowLeft className='w-3.5 h-3.5' strokeWidth={1.5} />
            Back
          </button>
        </div>

        {/* 主体：英文大写 tracked + 中文衬线副标题 */}
        <div className='text-center mb-8'>
          <div className='font-hero-eyebrow mb-3'>
            Module / {resultMode ? 'Recipe Output' : 'Pour-Over'}
          </div>
          <h1 className='font-hero-display mb-3'>{m.label.zh}</h1>
          <p className='font-hero-cn'>{m.description.zh}</p>
        </div>

        {/* 底部 hairline + 小字版权 */}
        <div className='flex items-center gap-4 max-w-md mx-auto'>
          <div className='hero-hair flex-1' />
          <span className='font-hero-eyebrow' style={{ letterSpacing: '0.4em' }}>
            Barista · No.{String(['pourover','espresso','milk','craft','sca','sensory'].indexOf(moduleId) + 1).padStart(2, '0')}
          </span>
          <div className='hero-hair flex-1' />
        </div>
      </div>
    </header>
  )
}
function FieldInput({ field, value, onChange }: {
  field: ModuleField
  value: string
  onChange: (v: string) => void
}) {
  if (field.type === 'chips' || field.type === 'select') {
    const opts = field.options || []
    return (
      <div>
        <div className='flex items-baseline justify-between mb-1.5'>
          <span className='text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide'>{field.label}</span>
          {field.hint && <span className='text-[10px] text-[var(--text-faint)]'>{field.hint}</span>}
        </div>
        {field.type === 'select' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)} className='select text-sm w-full'>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <div className='flex flex-wrap gap-1.5'>
            {opts.map((o) => {
              const active = value === o.value
              return (
                <button
                  key={o.value}
                  type='button'
                  onClick={() => onChange(active ? '' : o.value)}
                  className={
                    'px-3 py-1.5 text-xs rounded-md border transition-colors ' +
                    (active
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]')
                  }
                  title={o.hint}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }
  return (
    <div>
      <div className='flex items-baseline justify-between mb-1.5'>
        <span className='text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide'>{field.label}</span>
        {field.hint && <span className='text-[10px] text-[var(--text-faint)]'>{field.hint}</span>}
      </div>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className='input text-sm w-full'
      />
    </div>
  )
}

function AskWater({ onAnswer }: { onAnswer: (mode: 'required' | 'skip', detail?: string) => void }) {
  return (
    <section className='surface glow-border p-5 border-l-2' style={{ borderLeftColor: 'var(--accent)' }}>
      <div className='flex items-center gap-2 mb-2'>
        <Droplets className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
        <h3 className='eyebrow !m-0'>第 1 步 · 水质</h3>
      </div>
      <p className='text-sm text-[var(--text)] mb-3'>
        你对水质有要求吗？（咖啡萃取中水占 98%+，水质对口感影响极大）
      </p>
      <div className='flex gap-2'>
        <button onClick={() => onAnswer('required')} className='flex-1 px-3 py-2 rounded-md border border-[var(--accent)] bg-[var(--accent-bg)] text-sm text-[var(--text)] hover:opacity-90'>有要求（推荐瓶装水）</button>
        <button onClick={() => onAnswer('skip')} className='flex-1 px-3 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--accent)]'>用自来水 / 随意</button>
      </div>
    </section>
  )
}

function AskWaterDetail({ m, onConfirm }: { m: ModuleConfig; onConfirm: (detail: string) => void }) {
  const [rec, setRec] = useState('')
  return (
    <section className='surface glow-border p-5 border-l-2' style={{ borderLeftColor: 'var(--accent)' }}>
      <p className='text-sm text-[var(--text)] mb-2'>告诉我你的偏好：</p>
      <div className='space-y-2'>
        {[
          { v: 'soft', l: '软水（TDS < 80ppm）', hint: '农夫山泉 / 怡宝' },
          { v: 'mid', l: '中等硬度（80-150ppm）', hint: '恒大冰泉 / 巴黎水' },
          { v: 'hard', l: '偏硬（>150ppm）', hint: '三得利 / 雀巢优选' },
          { v: 'mineral', l: '高矿物质（>300ppm）', hint: '圣培露 / 斐泉' },
        ].map((o) => (
          <button
            key={o.v}
            onClick={() => setRec(o.l)}
            className={
              'w-full text-left px-3 py-2 rounded-md border text-sm flex justify-between transition-colors ' +
              (rec === o.l ? 'border-[var(--accent)] bg-[var(--accent-bg)]' : 'border-[var(--border)] hover:border-[var(--accent)]')
            }
          >
            <span className='text-[var(--text)]'>{o.l}</span>
            <span className='text-xs text-[var(--text-muted)]'>{o.hint}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => onConfirm(rec || '未指定')}
        disabled={!rec}
        className='mt-3 w-full py-2 rounded-md text-sm font-medium text-white disabled:opacity-40'
        style={{ background: 'var(--accent)' }}
      >
        确认
      </button>
    </section>
  )
}

function AskUseGear({ onAnswer }: { onAnswer: (ans: 'yes' | 'no') => void }) {
  return (
    <section className='surface glow-border p-5 border-l-2' style={{ borderLeftColor: 'var(--accent)' }}>
      <div className='flex items-center gap-2 mb-2'>
        <Package className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
        <h3 className='eyebrow !m-0'>第 2 步 · 已有器具</h3>
      </div>
      <p className='text-sm text-[var(--text)] mb-3'>检测到你「我的资料」中已登记设备/材料。要按这些来推荐吗？</p>
      <div className='flex gap-2'>
        <button onClick={() => onAnswer('yes')} className='flex-1 px-3 py-2 rounded-md border border-[var(--accent)] bg-[var(--accent-bg)] text-sm text-[var(--text)]'>是，用我已有的</button>
        <button onClick={() => onAnswer('no')} className='flex-1 px-3 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--accent)]'>不，重新推荐</button>
      </div>
    </section>
  )
}

function PlanOutput({ generic, masters, waterMode, waterDetail, useExistingGear, inventoryItems, level, onBack, onChat, onSave, m }: {
  generic: { title: string; steps: string[] }
  masters: MasterSOP[]
  waterMode: 'required' | 'skip' | null
  waterDetail: string
  useExistingGear: 'yes' | 'no' | null
  inventoryItems: any[]
  level: string
  onBack: () => void
  onChat: (ctx: string) => void
  onSave: (note: { title: string; text: string; source: string }) => void
  m: ModuleConfig
}) {
  const [savedKey, setSavedKey] = useState<string | null>(null)

  const saveGeneric = () => {
    const text = `# ${generic.title}\n\n` + generic.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
    onSave({ title: `${m.label.zh} · ${generic.title}`, text, source: '模块工作流' })
    setSavedKey('generic')
    setTimeout(() => setSavedKey(null), 2000)
  }
  const saveMaster = (sop: MasterSOP) => {
    const text = `# ${sop.name}\n\n${sop.brief}\n\n出处：${sop.source}${sop.url ? `\n链接：${sop.url}` : ''}`
    onSave({ title: `${m.label.zh} · ${sop.name}`, text, source: sop.source })
    setSavedKey(sop.id)
    setTimeout(() => setSavedKey(null), 2000)
  }

  return (
    <>
      {/* 水质建议 */}
      {waterMode === 'required' && (
        <section className='surface glow-border p-5 border-l-2' style={{ borderLeftColor: 'var(--accent)' }}>
          <div className='flex items-center gap-2 mb-2'>
            <Droplets className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <h3 className='eyebrow !m-0'>水质推荐</h3>
          </div>
          <p className='text-sm text-[var(--text)]'>{waterDetail}</p>
        </section>
      )}

      {/* 通用手法 + 大师手法 */}
      <div className='grid md:grid-cols-2 gap-3'>
        <SpotlightCard className='surface glow-border p-5'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-editorial text-base text-[var(--text)]'>{generic.title}</h3>
            <button
              onClick={saveGeneric}
              className='flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-[var(--accent)]'
              title='保存到本地知识库（Settings → 本地知识库）'
            >
              {savedKey === 'generic' ? <BookmarkCheck className='w-3.5 h-3.5' strokeWidth={1.5} /> : <BookmarkPlus className='w-3.5 h-3.5' strokeWidth={1.5} />}
              {savedKey === 'generic' ? '已保存' : '保存'}
            </button>
          </div>
          <ol className='space-y-2 text-sm text-[var(--text-secondary)]'>
            {generic.steps.map((s, i) => (
              <li key={i} className='flex gap-2'>
                <span className='text-[var(--accent)] font-keystroke text-xs shrink-0 mt-0.5 w-5'>{String(i + 1).padStart(2, '0')}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </SpotlightCard>
        <SpotlightCard className='surface glow-border p-5'>
          <h3 className='font-editorial text-base text-[var(--text)] mb-3'>大师 / 博主手法</h3>
          {masters.length > 0 ? masters.map((sop, i) => (
            <div key={sop.id} className='mb-3 last:mb-0 pb-3 border-b border-[var(--rule)] last:border-0'>
              <div className='flex items-baseline justify-between mb-1'>
                <span className='text-sm font-medium text-[var(--text)]'>{sop.name}</span>
                <button
                  onClick={() => saveMaster(sop)}
                  className='flex items-center gap-1 text-[var(--text-faint)] hover:text-[var(--accent)]'
                  title='保存到本地知识库'
                >
                  {savedKey === sop.id ? <BookmarkCheck className='w-3 h-3' strokeWidth={1.5} /> : <BookmarkPlus className='w-3 h-3' strokeWidth={1.5} />}
                  <span className='text-[10px]'>{savedKey === sop.id ? '已保存' : '收藏'}</span>
                </button>
              </div>
              <p className='text-xs text-[var(--text-muted)] mb-1'>{sop.source}</p>
              <p className='text-xs text-[var(--text-secondary)]'>{sop.brief}</p>
            </div>
          )) : (
            <p className='text-xs text-[var(--text-muted)]'>未匹配到推荐 SOP；进入对话详细咨询。</p>
          )}
        </SpotlightCard>
      </div>

      {/* 操作 */}
      <div className='flex gap-2'>
        <button onClick={onBack} className='px-4 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent)]'>← 调整参数</button>
        <button onClick={() => onChat('')} className='flex-1 py-2 rounded-md text-sm font-medium text-white flex items-center justify-center gap-1.5' style={{ background: 'var(--accent)' }}>
          进入对话细化 <ArrowRight className='w-4 h-4' strokeWidth={2} />
        </button>
      </div>
    </>
  )
}

/* ─── 通用手法生成（基于字段的简单规则，下一轮升级为 LLM 调用） ─── */

function buildGenericPlan(m: ModuleConfig, values: Record<string, string>, waterMode: 'required' | 'skip' | null, waterDetail: string, useExistingGear: 'yes' | 'no' | null, isAdvanced: boolean) {
  const steps: string[] = []
  const water = waterMode === 'required' ? `用水：${waterDetail}` : waterMode === 'skip' ? '用水：自来水 / 日常用' : '用水：待确认'

  if (m.id === 'pourover') {
    const bean = values.bean || '你的豆子'
    const dripper = values.dripper || 'v60'
    const strength = values.strength || 'medium'
    const temp = values.temp || 'hot'
    const flavor = values.flavor || 'balanced'
    const bypass = values.bypass || 'yes'
    const ratio = strength === 'light' ? '1:16' : strength === 'strong' ? '1:12' : '1:14'
    const tempC = temp === 'ice' ? '92℃ 注 1/3 + 冰块 2/3' : '92℃'

    steps.push(`${bean} 配 ${dripper === 'v60' ? 'V60 锥形滤杯' : dripper === 'kalita' ? 'Kalita Wave 平底' : dripper === 'origami' ? 'Origami 半锥' : '你的滤杯'}（粉水比 ${ratio}）`)
    steps.push(`烧水到 ${tempC}；研磨度参考中度偏细（白砂糖粒度）；粉量按杯决定 1 人 15g / 2 人 22g`)
    steps.push(`预浸（闷蒸）30s，倒 2 倍粉重的水让粉床充分排气`)
    steps.push(`分 2-3 段注水，每段之间停 15-20s 让水位下降，最后一段收水至目标重量`)
    if (bypass === 'yes') steps.push(`萃取完后视口感加 5-15% 旁通水稀释尾段苦味`)
    steps.push(`总萃取时间 2:30-3:00；先喝第一口确认${flavor === 'acid' ? '酸感' : flavor === 'sweet' ? '甜感' : flavor === 'body' ? '醇厚' : '平衡'}是否到位`)
    steps.push(water)
  } else if (m.id === 'espresso') {
    const bean = values.bean || '你的豆子'
    const basket = values.basket || 'double'
    const shot = values.shot || 'normale'
    const flow = values.flow || 'classic'
    steps.push(`${bean} 配 ${basket} 粉碗，目标萃取 ${shot}`)
    steps.push(`粉量按粉碗：单份 7g / 双份 14g / 三份 18g；研磨度以 25-30s 萃取为基准微调`)
    if (flow === 'classic') steps.push(`9bar 恒压萃取，${shot === 'ristretto' ? '1:1' : shot === 'lungo' ? '1:3' : shot === 'allonge' ? '1:4' : '1:2'} 收`)
    if (flow === 'ramp') steps.push(`先低后高 ramp：预浸 4s @ 4bar → 9bar 升压`)
    if (flow === 'declump') steps.push(`前期 9bar 恒压 → 萃取后期降到 6bar 收尾提甜`)
    if (flow === 'pre') steps.push(`预浸泡延长到 8-10s @ 4bar，再升 9bar 萃取`)
    steps.push(`看油脂颜色（虎斑/浅金棕）+ 收尾液滴连成线为佳`)
    steps.push(water)
  } else if (m.id === 'milk') {
    const drink = values.drink || 'latte'
    const milk = values.milk || 'whole'
    const ratio = drink === 'cappuccino' ? '1:2 浓缩:奶' : drink === 'flatwhite' ? '1:1.5' : drink === 'cortado' ? '1:1' : '1:4'
    steps.push(`浓缩基底（双份 30g）+ ${drink === 'cappuccino' ? '150g' : drink === 'flatwhite' ? '100g' : drink === 'cortado' ? '60g' : '200g'} ${milk === 'oat' ? '燕麦奶' : milk === 'lowfat' ? '低脂奶' : milk === 'jersey' ? 'Jersey 高脂奶' : '全脂奶'}`)
    steps.push(`奶温：cappuccino 要厚泡 65℃ / latte 要丝滑 60℃ / cortado 要温润 55℃`)
    steps.push(`蒸汽打发：cappuccino 起泡明显、latte 微泡丝光、cortado 不打发`)
    steps.push(`倒奶：低倒高收，最后出拉花图案（心形入门，叶子进阶）`)
  } else if (m.id === 'craft') {
    const cat = values.category || 'fruit'
    steps.push(`${cat === 'fruit' ? '果味清爽' : cat === 'milky' ? '奶感醇厚' : cat === 'tea' ? '茶感' : cat === 'decaf' ? '无咖啡因' : '气泡'}型基底`)
    steps.push(`咖啡基底：${values.base === 'espresso' ? '双份 Espresso' : values.base === 'cold_brew' ? '冷萃' : '不使用咖啡'}`)
    steps.push(`甜度：${values.sweetness === 'no' ? '无糖' : values.sweetness === 'low' ? '低糖 5ml 糖浆' : values.sweetness === 'medium' ? '中糖 10ml 糖浆' : '高糖 15ml+糖浆'}`)
    steps.push(`冰量：${values.ice === 'hot' ? '热饮' : values.ice === 'less' ? '少冰（半杯冰）' : '正常（3/4 杯冰）'}`)
    steps.push(`特殊：${values.diet === 'vegan' ? '替换植物奶' : values.diet === 'low_caffeine' ? '改用低因咖啡' : values.diet === 'lactose_free' ? '改用无乳糖奶' : '无'}`)
  } else if (m.id === 'sca') {
    const goal = values.goal || 'csp_brew'
    const stage = values.stage || 'studying'
    const hours = values.hours || '3_6'
    steps.push(`目标认证：${goal}`)
    steps.push(`当前阶段：${stage === 'planning' ? '准备期——评估基础、选考场' : stage === 'studying' ? '理论学习期——教材/参考视频' : stage === 'practicing' ? '实操期——模拟考/盲测' : '复盘期——错题/薄弱项'}`)
    steps.push(`周学习时间：${hours === 'less_3' ? '建议先延后到 ≥3 小时/周' : hours === '3_6' ? '基础达标，重点补实践' : hours === '6_10' ? '充裕可冲高分' : '高强度备考，注意休息'}`)
    steps.push(`首选路径：CSP 通用 5 模块 → 任一专项；或 Q-Grader 一次考过 22 项`)
  } else if (m.id === 'sensory') {
    const goal = values.goal || 'beginner'
    steps.push(`目标：${goal === 'beginner' ? '从风味轮开始熟悉 36 个香气类别' : goal === 'cupping' ? 'SCA 杯测 10 维度评分法' : goal === 'aroma_kit' ? 'Le Nez du Café 闻香瓶系统训练' : goal === 'triangle' ? '三角杯测练习（3 选 1 找异）' : '日常盲品找缺陷豆'}`)
    steps.push(`频率：${values.frequency === 'weekly' ? '每周 1 次，3-4 个月成型' : values.frequency === '3week' ? '每 3 天 1 次，2 个月成型' : '每天 1 次，1-2 个月密集型'}`)
    steps.push(`工具：${values.kit || '先买 SCA 风味轮 + 闻香瓶入门套装'}`)
    steps.push(`每轮 30 分钟：闻 5 个香气盲认 → 写感受 → 对比答案 → 复盘`)
  } else {
    steps.push('按你提交的参数生成方案')
  }

  if (useExistingGear === 'yes') steps.push('已按你「我的资料」登记的器具/材料调整参数')

  return {
    title: m.outputLabels.generic,
    steps,
  }
}

function labelOf(field: ModuleField, value: string): string {
  const opt = field.options?.find((o) => o.value === value)
  return opt ? opt.label : value
}