'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft, ChevronRight, Pencil, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

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

  const handleFinishRename = (id: string) => {
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <>
      {/* Sidebar panel */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-theme-secondary border-r border-theme-border
        flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-spring`}>
        {sidebarOpen && (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <span className="text-xs font-keystroke theme-text-dim tracking-wider">Sessions</span>
              <button onClick={handleNewChat} className="p-1 rounded-lg hover:bg-theme-hover press-physics">
                <Plus className="w-4 h-4 theme-text-dim" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors duration-200',
                    conv.id === currentConversationId
                      ? 'bg-theme-chat theme-text'
                      : 'hover:bg-theme-hover theme-text-dim'
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />

                  {editingId === conv.id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleFinishRename(conv.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(conv.id)}
                      autoFocus
                      className="flex-1 bg-transparent text-xs outline-none border-b border-theme-accent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 text-xs truncate-1 font-ebug">{conv.title || 'Untitled'}</span>
                  )}

                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button onClick={(e) => handleStartRename(conv.id, conv.title, e)} className="p-0.5 rounded hover:bg-theme-hover press-physics">
                      <Pencil className="w-3 h-3 theme-text-dim" strokeWidth={1.5} />
                    </button>
                    <button onClick={(e) => handleDelete(conv.id, e)} className="p-0.5 rounded hover:bg-theme-hover press-physics">
                      <Trash2 className="w-3 h-3 text-red-600" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 py-3 border-t border-theme-terminal">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-theme-hover transition-colors duration-200 press-physics text-xs font-ebug theme-text-dim"
              >
                <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-0 p-2 rounded-full bg-surface-secondary border border-theme-border z-10 hover:bg-theme-hover press-physics"
      >
        {sidebarOpen ? <PanelLeftClose className="w-4 h-4 text-dim" /> : <PanelLeftOpen className="w-4 h-4 text-dim" />}
      </button>
    </>
  )
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
