'use client'

/**
 * ProfileView — 独立模块「我的资料」(v7 P3c.3)
 *
 * 画像 + 材料库 + 主题/强调色。Sidebar「我的资料」入口进入，
 * 「返回对话」按钮回到聊天。本版本聚焦视觉升级：hero 头部、
 * 表单分组卡片化、材料库分类 chip 选择器、添加按钮显式主按钮。
 */

import { useState } from 'react'
import { useStore } from '@/store'
import { ThemeSwitcher } from './ThemeSwitcher'
import { ChevronDown, ChevronRight, Plus, Trash2, Package, User, Palette, Coffee, Droplets, Heart, ArrowLeft, Beaker } from 'lucide-react'
import type { InventoryItem, Settings } from '@/store'
import { MODULES, type ModuleId, type InventoryCategory } from '@/lib/modules'

const MAT_CATEGORY_LABEL: Record<InventoryCategory, string> = {
  bean: '咖啡豆', grinder: '磨豆机', brewer: '冲煮器具', machine: '咖啡机',
  dripper: '滤杯', filter: '滤纸', syrup: '糖浆/调味',
  kettle: '手冲壶', scale: '称', mug: '杯子', other: '其它',
}

// 按咖啡师工作流排序：先设备 → 再豆 → 再水 → 再口味
const MAT_CATEGORY_ORDER: InventoryCategory[] = [
  'bean', 'grinder', 'brewer', 'machine', 'dripper', 'filter',
  'kettle', 'scale', 'syrup', 'mug', 'other',
]

export function ProfileView() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const addInventoryItem = useStore((s) => s.addInventoryItem)
  const removeInventoryItem = useStore((s) => s.removeInventoryItem)
  const setViewMode = useStore((s) => s.setViewMode)
  const theme = useStore((s) => s.theme)
  const profile = settings.profile || ({} as any)
  const items = settings.inventoryItems || []

  const [materialExpanded, setMaterialExpanded] = useState(true)
  const [newCategory, setNewCategory] = useState<InventoryCategory>('bean')
  const [newName, setNewName] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newMeta, setNewMeta] = useState('')

  const handleAddItem = () => {
    if (!newName.trim()) return
    const meta = newMeta.trim()
      ? Object.fromEntries(
          newMeta.split(';')
            .map((kv) => kv.split(':').map((s) => s.trim()))
            .filter((pair): pair is [string, string] => pair.length === 2 && !!pair[1])
        )
      : undefined
    addInventoryItem({
      id: `${newCategory}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: newCategory,
      name: newName.trim(),
      brand: newBrand.trim() || undefined,
      meta,
      addedAt: Date.now(),
    })
    setNewName(''); setNewBrand(''); setNewMeta('')
  }

  const grouped = items.reduce<Record<InventoryCategory, InventoryItem[]>>((acc, it) => {
    (acc[it.category] = acc[it.category] || []).push(it)
    return acc
  }, {} as Record<InventoryCategory, InventoryItem[]>)

  const itemsInCategory = grouped[newCategory] || []
  const profileComplete = [profile.grinder, profile.brewer, profile.level, profile.tastePref].filter(Boolean).length

  return (
    <div className='flex-1 min-h-0 overflow-y-auto'>
      {/* ── Hero 头部：渐变 + 模块 accent 微光 + 返回按钮 ── */}
      <header
        className='relative px-6 py-8 border-b border-[var(--rule)] overflow-hidden'
        style={{
          backgroundImage:
            'linear-gradient(135deg, color-mix(in oklch, var(--accent) 10%, var(--surface)) 0%, var(--surface) 50%, var(--surface-raised) 100%)',
        }}
      >
        {/* 模块 accent 顶部细条（视觉锚点） */}
        <div className='absolute top-0 left-0 right-0 h-[3px]' style={{ background: 'var(--accent)' }} />
        {/* 微噪点纹理 */}
        <div
          className='absolute inset-0 opacity-[0.04] pointer-events-none'
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
        <div className='relative max-w-2xl mx-auto flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <User className='w-3.5 h-3.5' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <span className='eyebrow'>Profile & Gear</span>
            </div>
            <h1 className='font-editorial text-3xl text-[var(--text)] leading-tight'>我的资料</h1>
            <p className='text-xs text-[var(--text-muted)] mt-1.5 max-w-md'>
              {profileComplete > 0
                ? `画像完成度 ${profileComplete}/4 · 材料 ${items.length} 件 · 每次对话自动带入`
                : '记录你的设备、口味和手头材料，让顾问每次对话都精准推荐。'}
            </p>
          </div>
          <button
            onClick={() => setViewMode('chat')}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors shrink-0'
          >
            <ArrowLeft className='w-3.5 h-3.5' strokeWidth={1.5} />
            返回对话
          </button>
        </div>
      </header>

      <div className='max-w-2xl mx-auto px-6 py-8 space-y-5'>
        {/* ── 画像（按工作流分两卡：设备 / 口味） ── */}
        <SectionGroup icon={Coffee} title='设备与水' subtitle='磨豆机、器具、水质'>
          <div className='grid grid-cols-2 gap-3'>
            <Field label='磨豆机' value={profile.grinder} onChange={(v) => update({ profile: { ...profile, grinder: v } })} type='select' options={[
              ['', '-- 选择 --'],
              ['commandante_c40', 'Comandante C40'], ['1zpresso_jx_pro', '1Zpresso JX-Pro'],
              ['1zpresso_k_ultra', '1Zpresso K-Ultra'], ['timemore_c3', 'Timemore C3'],
              ['kingrinder_k6', 'Kingrinder K6'], ['lagom_mini', 'Lagom Mini'],
              ['df64', 'DF64'], ['niche_zero', 'Niche Zero'], ['other', '其它（下方输入）'],
            ]} />
            <Field label='常做器具' value={profile.brewer} onChange={(v) => update({ profile: { ...profile, brewer: v } })} type='select' options={[
              ['', '-- 选择 --'],
              ['pour_over', 'V60 手冲'], ['kalita', 'Kalita Wave'], ['ori', 'Origami'],
              ['aeropress', '爱乐压'], ['french_press', '法压壶'], ['espresso', '意式浓缩'],
              ['moka_pot', '摩卡壶'], ['cold_brew', '冷萃'], ['siphon', '虹吸壶'],
              ['turkish', '土耳其壶'], ['clever', '聪明杯'], ['budao', '挂耳'], ['other', '其它'],
            ]} />
            <Field label='手冲壶' value={profile.kettle} onChange={(v) => update({ profile: { ...profile, kettle: v } })} type='text' placeholder='如 Fellow Stagg EKG' />
            <Field label='水质 TDS (ppm)' value={profile.waterTds} onChange={(v) => update({ profile: { ...profile, waterTds: v } })} type='text' placeholder='如 120' />
            <Field label='水源' value={profile.waterSource} onChange={(v) => update({ profile: { ...profile, waterSource: v } })} type='text' placeholder='过滤水 / RO / 瓶装' />
            <CheckboxField label='有电子秤' checked={!!profile.scale} onChange={(v) => update({ profile: { ...profile, scale: v } })} />
          </div>
        </SectionGroup>

        <SectionGroup icon={Heart} title='口味与水平' subtitle='决定顾问给方案的复杂度'>
          <div className='grid grid-cols-2 gap-3'>
            <Field label='口味偏好' value={profile.tastePref} onChange={(v) => update({ profile: { ...profile, tastePref: v } })} type='select' options={[
              ['', '-- 选择 --'],
              ['acidity', '爱干净明亮酸'], ['sweetness', '爱甜感 / 回甘'],
              ['less_bitter', '怕苦'], ['body', '爱醇厚饱满'], ['clarity', '爱风味清晰'],
            ]} />
            <Field label='经验档位' value={profile.level} onChange={(v) => update({ profile: { ...profile, level: v } })} type='select' options={[
              ['', '-- 选择 --'],
              ['beginner', '新手'], ['intermediate', '进阶'], ['advanced', '资深'],
            ]} />
          </div>
          <Field
            label='常喝豆种（逗号分隔）'
            value={(profile.beansUsual || []).join(', ')}
            onChange={(v) => update({ profile: { ...profile, beansUsual: v.split(',').map((s: string) => s.trim()).filter(Boolean) } })}
            type='text'
            placeholder='ethiopia, colombia, washed, natural'
          />
        </SectionGroup>

        {/* ── 我的材料库 ── */}
        <SectionGroup icon={Package} title='我的材料库' subtitle='记录手头的豆/磨豆机/器具等，填品牌更精准' badge={`${items.length} 件`}>
          {/* 分类 chips：选择要管理的分类 */}
          <div className='flex flex-wrap gap-1.5 mb-4'>
            {MAT_CATEGORY_ORDER.map((cat) => {
              const count = (grouped[cat] || []).length
              const isActive = newCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={
                    'px-2.5 py-1 text-xs rounded-md border transition-colors ' +
                    (isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]')
                  }
                >
                  {MAT_CATEGORY_LABEL[cat]}
                  {count > 0 && <span className='ml-1 text-[var(--text-faint)]'>{count}</span>}
                </button>
              )
            })}
          </div>

          {/* 当前分类的已有 items */}
          {itemsInCategory.length > 0 && (
            <div className='mb-4 space-y-1.5'>
              {itemsInCategory.map((it) => (
                <div key={it.id} className='flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--rule)] bg-[var(--surface-raised)]'>
                  <span className='text-sm text-[var(--text)] flex-1 truncate'>
                    {it.brand && <span className='text-[var(--text-secondary)] font-medium'>{it.brand}</span>}
                    {it.brand && ' · '}
                    <span>{it.name}</span>
                    {it.meta && Object.keys(it.meta).length > 0 && (
                      <span className='text-[var(--text-faint)] ml-2 text-xs'>
                        {Object.entries(it.meta).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                      </span>
                    )}
                  </span>
                  <button onClick={() => removeInventoryItem(it.id)} className='btn-icon w-6 h-6 text-[var(--text-faint)] hover:text-[var(--danger)] shrink-0' aria-label='Remove'>
                    <Trash2 className='w-3 h-3' strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 添加表单（紧凑一行 + 次行） */}
          <div className='rounded-md border border-dashed border-[var(--border)] p-3 bg-[var(--surface-inset)]'>
            <div className='flex gap-2'>
              <input
                type='text'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={`新增 ${MAT_CATEGORY_LABEL[newCategory]}（如 ${newCategory === 'bean' ? '耶加雪菲 日晒' : newCategory === 'dripper' ? 'Hario V60 02' : 'Comandante C40'}）`}
                className='input text-sm flex-1'
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem() }}
              />
              <button
                onClick={handleAddItem}
                disabled={!newName.trim()}
                className='px-3 py-1.5 rounded-md text-sm font-medium text-white shrink-0 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed'
                style={{ background: 'var(--accent)' }}
              >
                <Plus className='w-4 h-4' strokeWidth={2} />
              </button>
            </div>
            <div className='grid grid-cols-2 gap-2 mt-2'>
              <input type='text' value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder='品牌 (可选，如 Hario / Comandante)' className='input text-xs' />
              <input type='text' value={newMeta} onChange={(e) => setNewMeta(e.target.value)} placeholder='规格 (可选，如 颜色:透明 / 杯型:02)' className='input text-xs' />
            </div>
          </div>
        </SectionGroup>

        {/* ── 主题 / 强调色 ── */}
        <SectionGroup icon={Palette} title='主题与强调色' subtitle='明暗 + 强调色（共 7 种预设）'>
          <div className='space-y-4'>
            <div>
              <p className='text-xs font-medium text-[var(--text-muted)] mb-2'>明暗模式</p>
              <ThemeSwitcher />
            </div>
            <div>
              <p className='text-xs font-medium text-[var(--text-muted)] mb-2'>强调色</p>
              <div className='flex flex-wrap gap-1.5'>
                <button
                  onClick={() => update({ accentOverride: 'auto' })}
                  className={
                    'px-3 py-1.5 text-xs rounded-md border flex items-center gap-1.5 transition-colors ' +
                    (settings.accentOverride === 'auto'
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]')
                  }
                  title='强调色跟随当前对话模块'
                >
                  <span className='text-[10px] font-keystroke uppercase tracking-widest opacity-70'>AUTO</span>
                  跟随模块
                </button>
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => update({ accentOverride: m.id })}
                    className={
                      'px-3 py-1.5 text-xs rounded-md border flex items-center gap-2 transition-colors ' +
                      (settings.accentOverride === m.id
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]')
                    }
                  >
                    <span
                      className='inline-block w-3 h-3 rounded-full shrink-0 ring-1 ring-inset ring-white/10'
                      style={{ background: m.accent[theme === 'dark' ? 'dark' : 'light'] }}
                    />
                    {m.label.zh}
                  </button>
                ))}
              </div>
              <p className='text-[var(--text-faint)] text-xs mt-2'>选「跟随模块」时切模块自动变色；选具体模块色则固定不变。</p>
            </div>
          </div>
        </SectionGroup>
      </div>
    </div>
  )
}

/* ─── 小组件 ─── */

function SectionGroup({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  title: string
  subtitle?: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <section className='relative surface p-5 overflow-hidden'>
      {/* 微噪点纹理（与 hero 协调但更淡） */}
      <div
        className='absolute inset-0 opacity-[0.025] pointer-events-none'
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      <div className='relative'>
        <div className='flex items-center justify-between mb-1'>
          <div className='flex items-center gap-2'>
            <span
              className='inline-flex items-center justify-center w-7 h-7 rounded-md'
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              <Icon className='w-3.5 h-3.5' strokeWidth={1.5} />
            </span>
            <h2 className='font-editorial text-lg text-[var(--text)]'>{title}</h2>
          </div>
          {badge && (
            <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--rule)]'>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className='text-xs text-[var(--text-faint)] ml-9 mb-4'>{subtitle}</p>}
        <div className={subtitle ? '' : 'mt-3'}>
          {children}
        </div>
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  type: 'text' | 'select'
  options?: [string, string][]
  placeholder?: string
}

function Field({ label, value, onChange, type, options, placeholder }: FieldProps) {
  return (
    <label className='block'>
      <span className='block text-[11px] font-medium text-[var(--text-muted)] mb-1 uppercase tracking-wide'>{label}</span>
      <div className='relative'>
        {type === 'text' ? (
          <input
            type='text'
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className='input text-sm w-full pr-3'
          />
        ) : (
          <>
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className='select text-sm w-full pr-8 appearance-none'
            >
              {(options || []).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
            <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-faint)] pointer-events-none' strokeWidth={1.5} />
          </>
        )}
      </div>
    </label>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className='flex items-center gap-2 h-9 mt-5 cursor-pointer select-none'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='w-4 h-4 accent-[var(--accent)] cursor-pointer'
      />
      <span className='text-sm text-[var(--text)]'>{label}</span>
    </label>
  )
}