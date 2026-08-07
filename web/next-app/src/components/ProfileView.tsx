'use client'

/**
 * ProfileView — 独立模块「我的资料」(v7 P3c.5)
 *
 * 画像（多设备 + per-模块口味）+ 材料库 + 主题/强调色 + 咖啡元素装饰。
 * v7 P3c.5 变更：
 *   - 设备：磨豆机 / 器具 / 手冲壶改成数组（多设备），旧的 select 改成 chip + 添加
 *   - 口味：按模块独立（意式可能爱苦、手冲爱酸、特调爱甜），不再是单一值
 *   - 主题/强调色：模块按钮显示咖啡元素字标（V60 / ES / CAP / LCH / Q / CUP）
 */

import { useState } from 'react'
import { useStore } from '@/store'
import type { TasteKey } from '@/store'
import { ThemeSwitcher } from './ThemeSwitcher'
import {
  ChevronDown, Plus, Trash2, Package, User, Palette, Coffee, Droplets, Heart,
  ArrowLeft, Beaker, Award, Eye, Sparkles, CupSoda, GlassWater,
} from 'lucide-react'
import type { InventoryItem, Settings } from '@/store'
import { MODULES, type ModuleId, type InventoryCategory } from '@/lib/modules'
import BlurText from './motion/BlurText'

const MAT_CATEGORY_LABEL: Record<InventoryCategory, string> = {
  bean: '咖啡豆', grinder: '磨豆机', brewer: '冲煮器具', machine: '咖啡机',
  dripper: '滤杯', filter: '滤纸', syrup: '糖浆/调味',
  kettle: '手冲壶', scale: '称', mug: '杯子', other: '其它',
}

const MAT_CATEGORY_ORDER: InventoryCategory[] = [
  'bean', 'grinder', 'brewer', 'machine', 'dripper', 'filter',
  'kettle', 'scale', 'syrup', 'mug', 'other',
]

// 共享噪点 SVG data URI（内层 url(#n) 不能含单引号，否则会与 JS 字符串冲突）
const NOISE_SVG = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'white\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'

const TASTE_OPTIONS: { key: TasteKey; label: string; short: string }[] = [
  { key: 'acidity', label: '干净明亮的酸', short: '酸' },
  { key: 'sweetness', label: '甜感回甘', short: '甜' },
  { key: 'less_bitter', label: '压住焦苦', short: '不苦' },
  { key: 'body', label: '醇厚饱满', short: '醇' },
  { key: 'clarity', label: '风味清晰', short: '清' },
]

const LEVEL_OPTIONS: { key: string; label: string }[] = [
  { key: 'beginner', label: '新手（用大白话）' },
  { key: 'intermediate', label: '进阶（给区间）' },
  { key: 'advanced', label: '资深（直接参数）' },
]

// 每个模块配 lucide 图标 key（ProfileView 用 lucide 渲染）
type ModuleIconName = 'Coffee' | 'CupSoda' | 'GlassWater' | 'Sparkles' | 'Award' | 'Eye'
const MODULE_ICON_KEY: Record<ModuleId, ModuleIconName> = {
  pourover: 'Coffee',
  espresso: 'CupSoda',
  milk: 'GlassWater',
  craft: 'Sparkles',
  sca: 'Award',
  sensory: 'Eye',
}

function ModuleIcon({ name, className, strokeWidth = 1.5 }: { name: ModuleIconName; className?: string; strokeWidth?: number }) {
  const C = { Coffee, CupSoda, GlassWater, Sparkles, Award, Eye }[name] || Coffee
  return <C className={className} strokeWidth={strokeWidth} />
}

export function ProfileView() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const addInventoryItem = useStore((s) => s.addInventoryItem)
  const removeInventoryItem = useStore((s) => s.removeInventoryItem)
  const setViewMode = useStore((s) => s.setViewMode)
  const theme = useStore((s) => s.theme)
  const profile = settings.profile || ({} as any)
  const items = settings.inventoryItems || []
  const devices = profile.devices || { grinders: [], brewers: [], kettles: [] }
  const tasteByModule: Partial<Record<ModuleId, TasteKey>> = profile.tasteByModule || {}

  const [materialExpanded, setMaterialExpanded] = useState(true)
  const [newCategory, setNewCategory] = useState<InventoryCategory>('bean')
  const [newName, setNewName] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newMeta, setNewMeta] = useState('')

  // 多设备临时输入
  const [newGrinder, setNewGrinder] = useState('')
  const [newBrewer, setNewBrewer] = useState('')
  const [newKettle, setNewKettle] = useState('')

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

  const addDevice = (kind: 'grinders' | 'brewers' | 'kettles', val: string, setter: (v: string) => void) => {
    const v = val.trim()
    if (!v) return
    const next = Array.from(new Set([...(devices[kind] || []), v]))
    update({ profile: { ...profile, devices: { ...devices, [kind]: next } } })
    setter('')
  }
  const removeDevice = (kind: 'grinders' | 'brewers' | 'kettles', val: string) => {
    update({
      profile: { ...profile, devices: { ...devices, [kind]: (devices[kind] || []).filter((x) => x !== val) } },
    })
  }
  const setTaste = (m: ModuleId, t: TasteKey) => {
    const next = { ...tasteByModule }
    if (tasteByModule[m] === t) delete next[m]  // 再次点同一格取消
    else next[m] = t
    update({ profile: { ...profile, tasteByModule: next } })
  }

  const grouped = items.reduce<Record<InventoryCategory, InventoryItem[]>>((acc, it) => {
    (acc[it.category] = acc[it.category] || []).push(it)
    return acc
  }, {} as Record<InventoryCategory, InventoryItem[]>)

  const itemsInCategory = grouped[newCategory] || []
  const profileComplete = [
    devices.grinders.length > 0, devices.brewers.length > 0,
    Object.keys(tasteByModule).length > 0, profile.level,
  ].filter(Boolean).length
  const moduleTasteCount = Object.keys(tasteByModule).length

  return (
    <div className='flex-1 min-h-0 overflow-y-auto'>
      {/* ── Hero 头部：渐变 + accent 顶条 + 噪点 + 咖啡杯装饰 SVG ── */}
      <header
        className='relative px-6 py-8 border-b border-[var(--rule)] overflow-hidden'
        style={{
          backgroundImage:
            'linear-gradient(135deg, color-mix(in oklch, var(--accent) 12%, var(--surface)) 0%, var(--surface) 55%, var(--surface-raised) 100%)',
        }}
      >
        <div className='absolute top-0 left-0 right-0 h-[3px]' style={{ background: 'var(--accent)' }} />
        <div
          className='absolute inset-0 opacity-[0.04] pointer-events-none'
          style={{ backgroundImage: NOISE_SVG }}
        />
        {/* 装饰性咖啡元素：右上角 lucide Coffee 大图标 + 蒸汽（绝对定位） */}
        <div className='absolute right-6 top-3 opacity-20 pointer-events-none' style={{ color: 'var(--accent)' }}>
          <Coffee className='w-16 h-16' strokeWidth={1.2} />
          <Beaker className='w-3 h-3 -mt-6 ml-10 opacity-60' strokeWidth={1.5} />
        </div>

        <div className='relative max-w-2xl mx-auto flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <User className='w-3.5 h-3.5' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              <span className='eyebrow'>Profile & Gear</span>
            </div>
            <h1 className='font-editorial text-3xl text-conach leading-tight'>
            <BlurText text='我的资料' delay={0.05} animateBy='letters' className='font-editorial text-3xl' stepDuration={0.04} />
          </h1>
            <p className='text-xs text-[var(--text-muted)] mt-1.5 max-w-md'>
              {profileComplete > 0
                ? `画像完成度 ${profileComplete}/4 · ${devices.grinders.length + devices.brewers.length} 台设备 · ${moduleTasteCount}/6 模块口味 · 材料 ${items.length} 件 · 每次对话自动带入`
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
        {/* ── 设备与水（多设备：磨豆机/器具/手冲壶） ── */}
        <SectionGroup icon={Coffee} title='设备与水' subtitle='多设备支持：可同时拥有 C40 + Niche Zero，按需选' badge={`${devices.grinders.length + devices.brewers.length + devices.kettles.length} 件`}>
          <DeviceRow
            label='磨豆机'
            icon={<Beaker className='w-3.5 h-3.5' strokeWidth={1.5} />}
            items={devices.grinders}
            value={newGrinder}
            onChange={setNewGrinder}
            placeholder='如 Comandante C40 / Niche Zero'
            onAdd={() => addDevice('grinders', newGrinder, setNewGrinder)}
            onRemove={(v) => removeDevice('grinders', v)}
          />
          <DeviceRow
            label='常做器具'
            icon={<Droplets className='w-3.5 h-3.5' strokeWidth={1.5} />}
            items={devices.brewers}
            value={newBrewer}
            onChange={setNewBrewer}
            placeholder='如 V60 / Kalita / Aeropress / 意式机'
            onAdd={() => addDevice('brewers', newBrewer, setNewBrewer)}
            onRemove={(v) => removeDevice('brewers', v)}
          />
          <DeviceRow
            label='手冲壶'
            icon={<Coffee className='w-3.5 h-3.5' strokeWidth={1.5} />}
            items={devices.kettles}
            value={newKettle}
            onChange={setNewKettle}
            placeholder='如 Fellow Stagg EKG'
            onAdd={() => addDevice('kettles', newKettle, setNewKettle)}
            onRemove={(v) => removeDevice('kettles', v)}
          />

          <div className='grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--rule)]'>
            <Field label='水质 TDS (ppm)' value={profile.waterTds} onChange={(v) => update({ profile: { ...profile, waterTds: v } })} type='text' placeholder='如 120' />
            <Field label='水源' value={profile.waterSource} onChange={(v) => update({ profile: { ...profile, waterSource: v } })} type='text' placeholder='过滤水 / RO / 瓶装' />
            <CheckboxField label='有电子秤' checked={!!profile.scale} onChange={(v) => update({ profile: { ...profile, scale: v } })} />
          </div>
        </SectionGroup>

        {/* ── 口味与水平（per-模块口味：意式可能爱苦，手冲爱酸，特调爱甜） ── */}
        <SectionGroup icon={Heart} title='口味与水平' subtitle='每种咖啡可以不同口味：意式爱苦、手冲爱酸、特调爱甜' badge={moduleTasteCount > 0 ? `${moduleTasteCount}/6 已设` : '未设'}>
          {/* 6 模块 × 5 口味选项 = 6 行（每模块一行：图标 + 名称 + 5 个口味 chip） */}
          <div className='space-y-2.5'>
            {MODULES.filter((m) => m.id !== 'sca' && m.id !== 'sensory').map((m) => (
              <div key={m.id} className='flex items-center gap-2'>
                <span
                  className='inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0'
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                  title={m.label.zh}
                >
                  <ModuleIcon name={m.iconKey} className='w-3.5 h-3.5' strokeWidth={1.5} />
                </span>
                <span className='text-xs text-[var(--text-secondary)] w-16 shrink-0'>{m.label.zh}</span>
                <div className='flex gap-1 flex-1'>
                  {TASTE_OPTIONS.map((t) => {
                    const isSelected = tasteByModule[m.id] === t.key
                    return (
                      <button
                        key={t.key}
                        onClick={() => setTaste(m.id, t.key)}
                        className={
                          'flex-1 px-1.5 py-1 text-[11px] rounded-md border transition-colors ' +
                          (isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-conach font-medium'
                            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-conach')
                        }
                        title={t.label}
                      >
                        {t.short}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-[var(--rule)]'>
            <Field
              label='经验档位'
              value={profile.level}
              onChange={(v) => update({ profile: { ...profile, level: v } })}
              type='select'
              options={[['', '-- 选择 --'], ...LEVEL_OPTIONS.map(o => [o.key, o.label] as [string, string])]}
            />
            <Field
              label='常喝豆种（逗号分隔）'
              value={(profile.beansUsual || []).join(', ')}
              onChange={(v) => update({ profile: { ...profile, beansUsual: v.split(',').map((s: string) => s.trim()).filter(Boolean) } })}
              type='text'
              placeholder='ethiopia, colombia, washed, natural'
            />
          </div>
        </SectionGroup>

        {/* ── 我的材料库 ── */}
        <SectionGroup icon={Package} title='我的材料库' subtitle='豆/磨豆机/滤杯/滤纸/咖啡机/糖浆等，建议填品牌' badge={`${items.length} 件`}>
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
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-conach'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-conach')
                  }
                >
                  {MAT_CATEGORY_LABEL[cat]}
                  {count > 0 && <span className='ml-1 text-[var(--text-faint)]'>{count}</span>}
                </button>
              )
            })}
          </div>

          {itemsInCategory.length > 0 && (
            <div className='mb-4 space-y-1.5'>
              {itemsInCategory.map((it) => (
                <div key={it.id} className='flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--rule)] bg-[var(--surface-raised)]'>
                  <span className='text-sm text-conach flex-1 truncate'>
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

        {/* ── 主题 / 强调色（每模块按钮显示咖啡元素字标） ── */}
        <SectionGroup icon={Palette} title='主题与强调色' subtitle='明暗 + 强调色（共 7 种预设）'>
          <div className='space-y-4'>
            <div>
              <p className='text-xs font-medium text-[var(--text-muted)] mb-2'>明暗模式</p>
              <ThemeSwitcher />
            </div>
            <div>
              <p className='text-xs font-medium text-[var(--text-muted)] mb-2'>强调色</p>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => update({ accentOverride: 'auto' })}
                  className={
                    'px-3 py-1.5 text-xs rounded-md border flex items-center gap-2 transition-colors ' +
                    (settings.accentOverride === 'auto'
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-conach'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-conach')
                  }
                  title='强调色跟随当前对话模块'
                >
                  <span className='text-[10px] font-keystroke uppercase tracking-widest opacity-70'>AUTO</span>
                  跟随模块
                </button>
                {MODULES.map((m) => {
                  const GLYPH = { pourover: 'V60', espresso: 'ES', milk: 'CAP', craft: 'LCH', sca: 'Q', sensory: 'CUP' }[m.id] || m.label.zh.slice(0, 2)
                  return (
                    <button
                      key={m.id}
                      onClick={() => update({ accentOverride: m.id })}
                      className={
                        'px-3 py-1.5 text-xs rounded-md border flex items-center gap-2 transition-colors ' +
                        (settings.accentOverride === m.id
                          ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-conach'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-conach')
                      }
                    >
                      <span
                        className='inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[10px] font-keystroke ring-1 ring-inset ring-white/10'
                        style={{
                          background: m.accent[theme === 'dark' ? 'dark' : 'light'],
                          color: 'white',
                        }}
                        aria-hidden
                      >
                        {GLYPH}
                      </span>
                      {m.label.zh}
                    </button>
                  )
                })}
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
  icon: Icon, title, subtitle, badge, children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  title: string; subtitle?: string; badge?: string; children: React.ReactNode
}) {
  // 共享噪点 SVG data URI（内层 url(#n) 不能含单引号，会与 JS 字符串冲突）
const NOISE_SVG = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'white\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'
  return (
    <section className='relative surface glow-border p-5 overflow-hidden'>
      <div className='absolute inset-0 opacity-[0.025] pointer-events-none' style={{ backgroundImage: NOISE_SVG }} />
      <div className='relative'>
        <div className='flex items-center justify-between mb-1'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-7 h-7 rounded-md' style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <Icon className='w-3.5 h-3.5' strokeWidth={1.5} />
            </span>
            <h2 className='font-editorial text-lg text-conach'>{title}</h2>
          </div>
          {badge && <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--rule)]'>{badge}</span>}
        </div>
        {subtitle && <p className='text-xs text-[var(--text-faint)] ml-9 mb-4'>{subtitle}</p>}
        <div className={subtitle ? '' : 'mt-3'}>{children}</div>
      </div>
    </section>
  )
}

function DeviceRow({
  label, icon, items, value, onChange, placeholder, onAdd, onRemove,
}: {
  label: string
  icon: React.ReactNode
  items: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  onAdd: () => void
  onRemove: (v: string) => void
}) {
  return (
    <div className='mb-3'>
      <div className='flex items-center gap-1.5 mb-1.5'>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <span className='text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide'>{label}</span>
        <span className='text-[10px] text-[var(--text-faint)] ml-1'>{items.length} 台</span>
      </div>
      {items.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-2'>
          {items.map((it) => (
            <span key={it} className='inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md border border-[var(--accent)] bg-[var(--accent-bg)] text-conach'>
              {it}
              <button onClick={() => onRemove(it)} className='ml-0.5 opacity-50 hover:opacity-100' aria-label='Remove'>
                <Trash2 className='w-3 h-3' strokeWidth={1.5} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className='flex gap-1.5'>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onAdd() }}
          placeholder={placeholder}
          className='input text-sm flex-1'
        />
        <button
          onClick={onAdd}
          disabled={!value.trim()}
          className='px-3 py-1.5 rounded-md text-sm font-medium text-white shrink-0 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed'
          style={{ background: 'var(--accent)' }}
          aria-label={`Add ${label}`}
        >
          <Plus className='w-4 h-4' strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type, options, placeholder }: {
  label: string; value: string | undefined; onChange: (v: string) => void
  type: 'text' | 'select'; options?: [string, string][]; placeholder?: string
}) {
  return (
    <label className='block'>
      <span className='block text-[11px] font-medium text-[var(--text-muted)] mb-1 uppercase tracking-wide'>{label}</span>
      <div className='relative'>
        {type === 'text' ? (
          <input type='text' value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className='input text-sm w-full pr-3' />
        ) : (
          <>
            <select value={value || ''} onChange={(e) => onChange(e.target.value)} className='select text-sm w-full pr-8 appearance-none'>
              {(options || []).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
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
      <input type='checkbox' checked={checked} onChange={(e) => onChange(e.target.checked)} className='w-4 h-4 accent-[var(--accent)] cursor-pointer' />
      <span className='text-sm text-conach'>{label}</span>
    </label>
  )
}