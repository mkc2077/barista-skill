'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'

export function Sidebar() {
  const conversations = useStore((s) => s.conversations)
  const currentConversationId = useStore((s) => s.currentConversationId)
  const createConversation = useStore((s) => s.createConversation)
  const selectConversation = useStore((s) => s.selectConversation)
  const deleteConversation = useStore((s) => s.deleteConversation)
  const renameConversation = useStore((s) => s.renameConversation)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const setShowSettings = useStore((s) => s.setShowSettings)
  const settings = useStore((s) => s.settings)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleNewChat = () => createConversation()

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation(id)
  }

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditTitle(title)
  }

  const handleFinishRename = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <>
      {/* Floating toggle — detached bezel pill (soft-skill Fluid Island) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-5 top-5 z-50 bezel-shell-sm bg-theme-secondary press-physics shadow-ambient"
          aria-label="Open sidebar"
        >
          <div className="bezel-core-sm p-2">
            <ChevronRight className="w-4 h-4 theme-text" strokeWidth={1.5} />
          </div>
        </button>
      )}

      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-editorial overflow-hidden
          bg-theme-secondary border-r border-theme-border h-screen flex-shrink-0`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Header */}
          <div className="p-4 border-b border-theme-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-xl theme-primary leading-none">Barista</span>
                <span className="eyebrow" style={{ padding: '0.15rem 0.4rem', fontSize: '0.5rem' }}>v5</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-theme-hover rounded-lg transition-colors ease-editorial"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-4 h-4 theme-text-dim" strokeWidth={1.5} />
              </button>
            </div>

            {/* New Chat CTA with star-border accent ring */}
            <div className="star-border rounded-[0.9rem]">
              <button
                onClick={handleNewChat}
                className="relative z-[1] w-full flex items-center justify-center gap-2 px-4 py-2.5
                  bg-theme-primary text-white rounded-[0.9rem] text-sm font-medium press-physics
                  transition-colors duration-200 ease-editorial hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>新建对话</span>
              </button>
            </div>
          </div>

          {/* Conversation list with staggered entry */}
          <div className="flex-1 overflow-y-auto p-3">
            {conversations.length === 0 ? (
              <p className="text-center theme-text-dim text-xs mt-8 font-keystroke">::_no_conversations</p>
            ) : (
              conversations.map((conv, idx) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  style={{ animationDelay: `${idx * 28}ms` }}
                  className={`animate-stagger group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
                    transition-all duration-300 ease-editorial mb-1
                    ${conv.id === currentConversationId
                      ? 'bg-theme-hover ring-1 ring-theme-accent/40 shadow-ambient'
                      : 'hover:bg-theme-hover'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 theme-text-dim" strokeWidth={1.5} />
                  {editingId === conv.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={handleFinishRename}
                      onKeyDown={e => { if (e.key === 'Enter') handleFinishRename() }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-transparent border-b border-theme-primary text-sm outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-sm truncate theme-text">{conv.title}</span>
                  )}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-editorial">
                    <button
                      onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                      className="p-1 hover:bg-theme-hover rounded-lg press-physics"
                      title="重命名"
                      type="button"
                    >
                      <Pencil className="w-3 h-3 theme-text-dim" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 hover:bg-theme-hover rounded-lg press-physics"
                      title="删除"
                      type="button"
                    >
                      <Trash2 className="w-3 h-3 theme-text-dim hover:text-theme-danger" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: keystroke meta + settings entry */}
          <div className="p-3 border-t border-theme-border">
            <div className="px-3 mb-2">
              <span className="font-keystroke text-[10px] uppercase tracking-wider theme-text-dim block truncate">
                {settings.provider || '未配置'} · {settings.model || '—'}
              </span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl
                hover:bg-theme-hover transition-colors ease-editorial text-sm"
            >
              <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
              设置
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
