'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, MessageSquare, Pencil, Trash2, Settings, PanelLeftClose, PanelLeftOpen, User } from 'lucide-react'
import { MODULES, type ModuleId } from '@/lib/modules'
import { DockItem } from './motion/Dock'

export function Sidebar() {
  const conversations = useStore((s) => s.conversations)
  const currentId = useStore((s) => s.currentConversationId)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const create = useStore((s) => s.createConversation)
  const select = useStore((s) => s.selectConversation)
  const remove = useStore((s) => s.deleteConversation)
  const rename = useStore((s) => s.renameConversation)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const openSettings = useStore((s) => s.setShowSettings)
  const currentModule = useStore((s) => s.settings.currentModule)
  const updateSettings = useStore((s) => s.updateSettings)
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const setModule = (id: ModuleId) => {
    updateSettings({ currentModule: id })
    setViewMode(id)
  }

  return (
    <>
      <div
        className={
          'conach-panel relative z-10 border-r border-[var(--glass-border)] flex flex-col shrink-0 overflow-hidden sidebar-transition ' +
          (sidebarOpen ? 'w-64' : 'w-0 border-r-0')
        }
      >
        {sidebarOpen && (
          <div className='flex flex-col h-full animate-[fade-in_0.2s_ease_both]'>
            {/* Brand mark — CONACH-style double ring */}
            <div className='px-4 pt-5 pb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <svg width='28' height='28' viewBox='0 0 32 32' fill='none' stroke='currentColor' strokeWidth='1' className='text-conach'>
                  <circle cx='16' cy='16' r='14' />
                  <circle cx='16' cy='16' r='8' />
                  <circle cx='16' cy='16' r='2.5' fill='currentColor' />
                </svg>
                <div className='flex items-center gap-2'>
                  <span className='font-hero-eyebrow text-conach' style={{ letterSpacing: '0.30em' }}>
                    Barista
                  </span>
                </div>
              </div>
              <button onClick={create} className='conach-pill-btn !py-1 !px-2.5' data-tooltip='New conversation'>
                <Plus className='w-3.5 h-3.5' strokeWidth={1.5} />
              </button>
            </div>

            {/* Hairline divider */}
            <div className='conach-hair mx-4 mb-2' />

            {/* Module switcher — uppercase tracked pill buttons */}
            <div className='px-3 pb-3'>
              <p className='px-1 pb-2 font-hero-eyebrow text-conach-faint'>
                Modules / 模块
              </p>
              <div className='grid grid-cols-2 gap-1.5'>
                {MODULES.map((m) => {
                  const isActive = currentModule === m.id
                  return (
                    <DockItem key={m.id} className='dock-item'>
                      <button
                        onClick={() => setModule(m.id)}
                        title={m.description.zh}
                        data-tooltip={m.description.zh}
                        className={
                          'w-full flex items-center gap-1.5 px-2.5 py-2 text-[11px] rounded-full border transition-all duration-200 ' +
                          (isActive
                            ? 'border-transparent text-conach shadow-sm'
                            : 'border-[rgba(245,243,238,0.12)] text-conach-soft hover:border-[rgba(245,243,238,0.36)] hover:text-conach')
                        }
                        style={isActive ? { background: 'color-mix(in oklch, var(--accent) 22%, transparent)', boxShadow: 'inset 0 1px 0 0 var(--glass-highlight)' } : undefined}
                      >
                        <span
                          className='inline-block w-1.5 h-1.5 rounded-full shrink-0'
                          style={{ background: m.accent.light }}
                        />
                        <span className='font-hero-eyebrow !text-[10px]' style={{ letterSpacing: '0.18em' }}>
                          {m.label.zh}
                        </span>
                      </button>
                    </DockItem>
                  )
                })}
              </div>
            </div>

            <div className='conach-hair mx-4 mb-2' />

            {/* Conversation list */}
            <div className='flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scroll-slim'>
              <p className='px-2 pb-1 pt-1 font-hero-eyebrow text-conach-faint'>
                Sessions / 会话
              </p>
              {conversations.length === 0 ? (
                <p className='px-3 py-6 text-[11px] text-conach-faint text-center font-hero-eyebrow' style={{ letterSpacing: '0.16em' }}>
                  No sessions yet
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => select(conv.id)}
                    className={
                      'group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ' +
                      (conv.id === currentId
                        ? 'text-conach'
                        : 'text-conach-soft hover:text-conach')
                    }
                    style={conv.id === currentId ? { background: 'color-mix(in oklch, var(--accent) 18%, transparent)' } : undefined}
                    onMouseEnter={(e) => {
                      if (conv.id !== currentId) e.currentTarget.style.background = 'rgba(245,243,238,0.04)'
                    }}
                    onMouseLeave={(e) => {
                      if (conv.id !== currentId) e.currentTarget.style.background = ''
                    }}
                  >
                    <MessageSquare className='w-3.5 h-3.5 shrink-0 opacity-50' strokeWidth={1.5} />

                    {editingId === conv.id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => {
                          if (editTitle.trim()) rename(conv.id, editTitle.trim())
                          setEditingId(null)
                          setEditTitle('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editTitle.trim()) rename(conv.id, editTitle.trim())
                            setEditingId(null)
                            setEditTitle('')
                          }
                        }}
                        autoFocus
                        className='flex-1 conach-input !py-0.5 !px-1 text-xs'
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className='flex-1 text-xs truncate'>{conv.title || 'Untitled'}</span>
                    )}

                    <div className='hidden group-hover:flex items-center gap-0.5 shrink-0'>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(conv.id); setEditTitle(conv.title) }}
                        className='p-1 rounded hover:bg-[rgba(245,243,238,0.10)]'
                        data-tooltip='Rename'
                      >
                        <Pencil className='w-3 h-3' strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this conversation?')) remove(conv.id) }}
                        className='p-1 rounded hover:bg-[rgba(245,243,238,0.10)]'
                        data-tooltip='Delete'
                      >
                        <Trash2 className='w-3 h-3' strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className='conach-hair mx-4 mt-2' />

            {/* Bottom actions — uppercase tracked */}
            <div className='p-3 space-y-1'>
              <button
                onClick={() => setViewMode(viewMode === 'profile' ? 'chat' : 'profile')}
                className={
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[11px] transition-colors duration-150 ' +
                  (viewMode === 'profile'
                    ? 'text-conach'
                    : 'text-conach-soft hover:text-conach')
                }
                style={viewMode === 'profile' ? { background: 'color-mix(in oklch, var(--accent) 22%, transparent)' } : undefined}
                onMouseEnter={(e) => {
                  if (viewMode !== 'profile') e.currentTarget.style.background = 'rgba(245,243,238,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== 'profile') e.currentTarget.style.background = ''
                }}
                data-tooltip='画像 + 材料库 + 主题'
              >
                <User className='w-3.5 h-3.5' strokeWidth={1.5} />
                <span className='font-hero-eyebrow !text-[10px]' style={{ letterSpacing: '0.22em' }}>
                  My Profile
                </span>
              </button>
              <button
                onClick={() => openSettings(true)}
                className='flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[11px] text-conach-soft hover:text-conach transition-colors duration-150'
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,243,238,0.04)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
              >
                <Settings className='w-3.5 h-3.5' strokeWidth={1.5} />
                <span className='font-hero-eyebrow !text-[10px]' style={{ letterSpacing: '0.22em' }}>
                  API Settings
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className='fixed top-3 left-3 z-50 conach-pill-btn !p-2 transition-opacity duration-300 opacity-30 hover:opacity-100 shadow-lg'
        style={{ background: 'rgba(18,18,22,0.85)', backdropFilter: 'blur(24px)' }}
      >
        {sidebarOpen ? <PanelLeftClose className='w-3.5 h-3.5' strokeWidth={1.5} /> : <PanelLeftOpen className='w-3.5 h-3.5' strokeWidth={1.5} />}
      </button>
    </>
  )
}