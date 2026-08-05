'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, MessageSquare, Pencil, Trash2, Settings, PanelLeftClose, PanelLeftOpen, Coffee, Package } from 'lucide-react'
import { MODULES, type ModuleId } from '@/lib/modules'

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

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const setModule = (id: ModuleId) => updateSettings({ currentModule: id })

  return (
    <>
      <div
        className={
          'bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0 overflow-hidden sidebar-transition ' +
          (sidebarOpen ? 'w-64' : 'w-0')
        }
      >
        {sidebarOpen && (
          <div className='flex flex-col h-full animate-[fade-in_0.2s_ease_both]'>
            <div className='px-4 pt-4 pb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Coffee className='w-4 h-4' style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                <span className='text-xs font-keystroke text-[var(--text-muted)] tracking-wider'>
                  BARISTA
                </span>
              </div>
              <button onClick={create} className='btn-icon w-7 h-7' data-tooltip='New conversation'>
                <Plus className='w-3.5 h-3.5' strokeWidth={1.5} />
              </button>
            </div>

            {/* 模块切换器（v7 P3c）—— 6 个专注域 + 1 个「全部」 */}
            <div className='px-2 pb-2'>
              <p className='px-2 pb-1 text-[10px] font-keystroke uppercase tracking-widest text-[var(--text-faint)]'>
                模块 / Modules
              </p>
              <div className='flex flex-wrap gap-1'>
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModule(m.id)}
                    title={m.description.zh}
                    data-tooltip={m.description.zh}
                    className={
                      'px-2 py-1 text-[11px] rounded-md border transition-colors duration-150 ' +
                      (currentModule === m.id
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]')
                    }
                  >
                    {m.label.zh}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-1 space-y-0.5'>
              {conversations.length === 0 ? (
                <p className='px-3 py-6 text-xs text-[var(--text-faint)] text-center'>
                  No sessions yet
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => select(conv.id)}
                    className={
                      'group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ' +
                      (conv.id === currentId
                        ? 'bg-[var(--accent-bg)] text-[var(--text)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-inset)] hover:text-[var(--text)]')
                    }
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
                        className='flex-1 bg-transparent text-xs outline-none border-b border-[var(--accent)] py-0.5'
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className='flex-1 text-xs truncate'>{conv.title || 'Untitled'}</span>
                    )}

                    <div className='hidden group-hover:flex items-center gap-0.5 shrink-0'>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(conv.id); setEditTitle(conv.title) }}
                        className='btn-icon w-6 h-6'
                        data-tooltip='Rename'
                      >
                        <Pencil className='w-3 h-3' strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this conversation?')) remove(conv.id) }}
                        className='btn-icon w-6 h-6'
                        style={{ color: 'var(--danger)' }}
                        data-tooltip='Delete'
                      >
                        <Trash2 className='w-3 h-3' strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className='p-3 border-t border-[var(--rule)] space-y-1'>
              <button
                onClick={() => openSettings(true)}
                className='flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-keystroke text-[var(--text-muted)] hover:bg-[var(--surface-inset)] transition-colors duration-150'
              >
                <Settings className='w-3.5 h-3.5' strokeWidth={1.5} />
                Settings
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className='absolute top-3 left-3 z-20 btn-icon w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-sm'
      >
        {sidebarOpen ? <PanelLeftClose className='w-3.5 h-3.5' strokeWidth={1.5} /> : <PanelLeftOpen className='w-3.5 h-3.5' strokeWidth={1.5} />}
      </button>
    </>
  )
}
