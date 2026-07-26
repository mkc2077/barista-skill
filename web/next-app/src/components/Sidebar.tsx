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

  const handleNewChat = () => {
    createConversation()
  }

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
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 p-2 bg-theme-secondary border border-theme-border rounded-lg
            hover:border-theme-primary transition-all"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-5 h-5 theme-text" />
        </button>
      )}

      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden
          bg-theme-secondary border-r border-theme-border h-screen flex-shrink-0`}
      >
        <div className="flex flex-col h-full w-72">
          <div className="p-4 border-b border-theme-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☕</span>
                <h1 className="text-lg font-bold theme-primary">Barista</h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-theme-hover rounded transition-colors"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-5 h-5 theme-text-dim" />
              </button>
            </div>

            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5
                border border-theme-border rounded-lg hover:border-theme-primary
                hover:bg-theme-hover transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              新建对话
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="text-center theme-text-dim text-sm mt-8">暂无对话</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                    transition-colors mb-1
                    ${conv.id === currentConversationId
                      ? 'bg-theme-hover border border-theme-accent'
                      : 'hover:bg-theme-hover'}`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 theme-text-dim" />
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
                    <span className="flex-1 text-sm truncate">{conv.title}</span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                      className="p-1 hover:bg-theme-hover rounded"
                      title="重命名"
                    >
                      <Pencil className="w-3 h-3 theme-text-dim" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 hover:bg-theme-hover rounded"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3 theme-text-dim hover:theme-danger" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-theme-border">
            <div className="text-xs theme-text-dim mb-2 px-1 truncate">
              {settings.provider || '未配置'} · {settings.model || '—'}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                hover:bg-theme-hover transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
