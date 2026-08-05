'use client'

/**
 * ProfileView — 独立模块「我的资料」(v7 P3c.3)
 *
 * 把 SettingsPanel 中的「我的画像 & 素材」+ 「我的材料库」+ 「主题/强调色选择」
 * 提到顶层独立页面，Sidebar 有「我的资料」入口一键进入。
 * SettingsPanel 退化为只放 API 配置 / 联网 / 知识库自动更新 等系统项。
 */

import { useState } from 'react'
import { useStore } from '@/store'
import { ThemeSwitcher } from './ThemeSwitcher'
import { ChevronDown, ChevronRight, Plus, Trash2, Package, User, Palette } from 'lucide-react'
import type { InventoryItem, Settings } from '@/store'
import { MODULES, type ModuleId, type InventoryCategory } from '@/lib/modules'

const MAT_CATEGORY_LABEL: Record<InventoryCategory, string> = {
  bean: '咖啡豆', grinder: '磨豆机', brewer: '冲煮器具', machine: '咖啡机',
  dripper: '滤杯', filter: '滤纸', syrup: '糖浆 / 调味',
  kettle: '手冲壶', scale: '称', mug: '杯子', other: '其它',
}

const TASTE_LABEL: Record<string, string> = {
  acidity: '酸感', sweetness: '甜感', less_bitter: '少苦', body: '醇厚', clarity: '清爽',
}
const LEVEL_LABEL: Record<string, string> = {
  beginner: '新手', intermediate: '进阶', advanced: '资深',
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

  const [materialExpanded, setMaterialExpanded] = useState(true)

  // 材料库新增表单
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

  return (
    <div className='flex-1 min-h-0 overflow-y-auto px-6 py-10'>
      <div className='max-w-2xl mx-auto'>
        {/* 顶部：返回按钮 + 标题 */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <User className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <h1 className='font-editorial text-2xl text-[var(--text)]'>我的资料</h1>
            <span className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-muted)] ml-1'>
              Profile & Gear
            </span>
          </div>
          <button
            onClick={() => setViewMode('chat')}
            className='btn btn-secondary text-xs'
          >
            ← 返回对话
          </button>
        </div>

        {/* 我的画像 */}
        <section className='surface p-5 mb-4'>
          <h2 className='eyebrow mb-3'>画像 / Profile</h2>
          <p className='text-xs text-[var(--text-faint)] mb-4'>
            这些信息会注入每轮 system prompt，让顾问针对你的设备与口味给建议。
          </p>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>磨豆机</label>
              <select value={profile.grinder || ''} onChange={(e) => update({ profile: { ...profile, grinder: e.target.value } })} className='select text-xs'>
                <option value=''>-- 选择 --</option>
                <option value='comandante_c40'>Comandante C40</option>
                <option value='1zpresso_jx_pro'>1Zpresso JX-Pro</option>
                <option value='timemore_c3'>Timemore C3</option>
                <option value='mahlkonig_ek43'>Mahlkönig EK43</option>
                <option value='eureka_mignon'>Eureka Mignon</option>
                <option value='baratza_sette_270'>Baratza Sette 270</option>
                <option value='other'>其它</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>常做器具</label>
              <select value={profile.brewer || ''} onChange={(e) => update({ profile: { ...profile, brewer: e.target.value } })} className='select text-xs'>
                <option value=''>-- 选择 --</option>
                <option value='pour_over'>手冲（V60/Kalita）</option>
                <option value='aeropress'>爱乐压</option>
                <option value='french_press'>法压壶</option>
                <option value='espresso'>意式机</option>
                <option value='moka_pot'>摩卡壶</option>
                <option value='cold_brew'>冷萃</option>
                <option value='other'>其它</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>手冲壶</label>
              <input type='text' value={profile.kettle || ''} onChange={(e) => update({ profile: { ...profile, kettle: e.target.value } })} placeholder='如 Fellow Stagg EKG' className='input text-xs' />
            </div>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>经验档位</label>
              <select value={profile.level || ''} onChange={(e) => update({ profile: { ...profile, level: e.target.value } })} className='select text-xs'>
                <option value=''>-- 选择 --</option>
                <option value='beginner'>新手</option>
                <option value='intermediate'>进阶</option>
                <option value='advanced'>资深</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>口味偏好</label>
              <select value={profile.tastePref || ''} onChange={(e) => update({ profile: { ...profile, tastePref: e.target.value } })} className='select text-xs'>
                <option value=''>-- 选择 --</option>
                <option value='acidity'>酸感</option>
                <option value='sweetness'>甜感</option>
                <option value='less_bitter'>少苦</option>
                <option value='body'>醇厚</option>
                <option value='clarity'>清爽</option>
              </select>
            </div>
            <div className='flex items-end'>
              <label className='flex items-center gap-1.5 text-xs cursor-pointer'>
                <input type='checkbox' checked={profile.scale ?? false} onChange={(e) => update({ profile: { ...profile, scale: e.target.checked } })} className='accent-[var(--accent)]' />
                有电子秤
              </label>
            </div>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>水质 TDS（ppm）</label>
              <input type='text' value={profile.waterTds || ''} onChange={(e) => update({ profile: { ...profile, waterTds: e.target.value } })} placeholder='如 120' className='input text-xs' />
            </div>
            <div>
              <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>水源</label>
              <input type='text' value={profile.waterSource || ''} onChange={(e) => update({ profile: { ...profile, waterSource: e.target.value } })} placeholder='过滤水 / RO / 瓶装' className='input text-xs' />
            </div>
          </div>
          <div className='mt-3'>
            <label className='block text-xs font-medium text-[var(--text-muted)] mb-1'>常喝豆种（逗号分隔）</label>
            <input
              type='text'
              value={(profile.beansUsual || []).join(', ')}
              onChange={(e) => update({ profile: { ...profile, beansUsual: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) } })}
              placeholder='ethiopia, colombia, washed, natural'
              className='input text-xs'
            />
          </div>
        </section>

        {/* 我的材料库 */}
        <section className='surface p-5 mb-4'>
          <button
            onClick={() => setMaterialExpanded(!materialExpanded)}
            className='flex items-center gap-1.5 w-full mb-3'
          >
            {materialExpanded ? <ChevronDown className='w-3.5 h-3.5' strokeWidth={1.5} /> : <ChevronRight className='w-3.5 h-3.5' strokeWidth={1.5} />}
            <Package className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <h2 className='eyebrow !m-0'>我的材料库</h2>
            <span className='text-[10px] font-keystroke text-[var(--text-faint)]'>{items.length} 件</span>
          </button>
          {materialExpanded && (
            <>
              <p className='text-xs text-[var(--text-faint)] mb-3'>记录磨豆机 / 滤杯 / 滤纸 / 咖啡机 / 咖啡豆 / 糖浆等，建议填品牌方便精准推荐。</p>
              {(Object.entries(grouped) as [InventoryCategory, InventoryItem[]][]).map(([cat, list]) => (
                <div key={cat} className='mb-3'>
                  <p className='text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-faint)] mb-1.5'>{MAT_CATEGORY_LABEL[cat]}</p>
                  {list.map((it) => (
                    <div key={it.id} className='flex items-center gap-1 text-xs mb-1'>
                      <span className='text-[var(--text)] flex-1 truncate'>
                        {it.brand && <span className='text-[var(--text-secondary)]'>{it.brand} · </span>}
                        {it.name}
                        {it.meta && Object.keys(it.meta).length > 0 && (
                          <span className='text-[var(--text-faint)]'> ({Object.entries(it.meta).map(([k, v]) => `${k}: ${v}`).join(' / ')})</span>
                        )}
                      </span>
                      <button onClick={() => removeInventoryItem(it.id)} className='btn-icon w-5 h-5' aria-label='Remove'><Trash2 className='w-3 h-3' strokeWidth={1.5} /></button>
                    </div>
                  ))}
                </div>
              ))}
              <div className='border-t border-[var(--rule)] pt-3 space-y-1'>
                <div className='flex gap-1'>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as InventoryCategory)} className='select text-xs w-28'>
                    {(Object.keys(MAT_CATEGORY_LABEL) as InventoryCategory[]).map((k) => (
                      <option key={k} value={k}>{MAT_CATEGORY_LABEL[k]}</option>
                    ))}
                  </select>
                  <input type='text' value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='名称 (如 Hario V60 02 / Kalita Wave 155)' className='input text-xs flex-1' />
                  <button onClick={handleAddItem} disabled={!newName.trim()} className='btn-icon w-7 h-7 disabled:opacity-40' aria-label='Add'><Plus className='w-3.5 h-3.5' strokeWidth={1.5} /></button>
                </div>
                <div className='flex gap-1'>
                  <input type='text' value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder='品牌 (可选，如 Hario / Comandante)' className='input text-xs w-36' />
                  <input type='text' value={newMeta} onChange={(e) => setNewMeta(e.target.value)} placeholder='规格 (可选, 如 颜色: 透明)' className='input text-xs flex-1' />
                </div>
              </div>
            </>
          )}
        </section>

        {/* 主题与强调色 */}
        <section className='surface p-5 mb-4'>
          <div className='flex items-center gap-1.5 mb-3'>
            <Palette className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <h2 className='eyebrow !m-0'>主题 / 强调色</h2>
          </div>
          <div className='space-y-3'>
            <div>
              <p className='text-xs font-medium text-[var(--text-muted)] mb-1.5'>明暗模式</p>
              <ThemeSwitcher />
            </div>
            <div>
              <p className='text-xs font-medium text-[var(--text-muted)] mb-1.5'>强调色</p>
              <div className='flex flex-wrap gap-1.5'>
                <button
                  onClick={() => update({ accentOverride: 'auto' })}
                  className={
                    'px-2.5 py-1.5 text-xs rounded-md border flex items-center gap-1.5 transition-colors ' +
                    (settings.accentOverride === 'auto'
                      ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]')
                  }
                  title='强调色跟随当前对话模块'
                >
                  <span className='text-[10px] font-keystroke uppercase tracking-widest'>AUTO</span>
                  跟随模块
                </button>
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => update({ accentOverride: m.id })}
                    className={
                      'px-2.5 py-1.5 text-xs rounded-md border flex items-center gap-2 transition-colors ' +
                      (settings.accentOverride === m.id
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]')
                    }
                  >
                    <span
                      className='inline-block w-3 h-3 rounded-full shrink-0'
                      style={{ background: m.accent[theme === 'dark' ? 'dark' : 'light'] }}
                    />
                    {m.label.zh}
                  </button>
                ))}
              </div>
              <p className='text-[var(--text-faint)] text-xs mt-2'>选「跟随模块」时切模块自动变色；选具体模块色则固定不变。</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}