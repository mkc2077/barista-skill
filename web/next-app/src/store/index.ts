import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export type Theme = 'light-roast' | 'pour-over' | 'dark-roast' | 'espresso'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  model?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface Settings {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  customPrompt: string
  mcpEnabled: boolean
  mcpUrl: string
  // 联网搜索（Scheme B 本地版）：使用 AnySearch，用户自带 API Key（匿名亦可）
  webSearchEnabled: boolean
  anysearchApiKey: string
}

export interface AppState {
  conversations: Conversation[]
  currentConversationId: string | null
  settings: Settings
  theme: Theme
  sidebarOpen: boolean
  showSettings: boolean
  isStreaming: boolean

  createConversation: () => string
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessage: (conversationId: string, messageId: string, content: string) => void
  updateSettings: (partial: Partial<Settings>) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setShowSettings: (show: boolean) => void
  setStreaming: (streaming: boolean) => void
  exportData: () => { conversations: Conversation[]; settings: Settings; theme: Theme }
  importData: (data: { conversations: Conversation[]; settings: Settings; theme: Theme }) => void
}

const defaultSettings: Settings = {
  provider: '',
  apiKey: '',
  baseUrl: '',
  model: '',
  temperature: 0.7,
  customPrompt: '',
  mcpEnabled: true,
  mcpUrl: 'http://127.0.0.1:8765/mcp',
  webSearchEnabled: false,
  anysearchApiKey: '',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      theme: 'pour-over',
      sidebarOpen: true,
      showSettings: false,
      isStreaming: false,

      createConversation: () => {
        const id = uuidv4()
        const now = Date.now()
        const conversation: Conversation = {
          id,
          title: '新对话',
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }))
        return id
      },

      selectConversation: (id) => {
        set({ currentConversationId: id })
      },

      deleteConversation: (id) => {
        set((state) => {
          const conversations = state.conversations.filter(c => c.id !== id)
          const currentConversationId =
            state.currentConversationId === id
              ? (conversations[0]?.id ?? null)
              : state.currentConversationId
          return { conversations, currentConversationId }
        })
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }))
      },

      addMessage: (conversationId, message) => {
        const id = uuidv4()
        const fullMessage: Message = {
          ...message,
          id,
          timestamp: Date.now(),
        }
        set((state) => ({
          conversations: state.conversations.map(c => {
            if (c.id !== conversationId) return c
            const messages = [...c.messages, fullMessage]
            const title =
              c.title === '新对话' && message.role === 'user'
                ? message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '')
                : c.title
            return { ...c, messages, title, updatedAt: Date.now() }
          }),
        }))
        return id
      },

      updateMessage: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
          ),
        }))
      },

      updateSettings: (partial) => {
        set((state) => ({ settings: { ...state.settings, ...partial } }))
      },

      setTheme: (theme) => {
        set({ theme })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setShowSettings: (show) => {
        set({ showSettings: show })
      },

      setStreaming: (streaming) => {
        set({ isStreaming: streaming })
      },

      exportData: () => {
        const { conversations, settings, theme } = get()
        return { conversations, settings, theme }
      },

      importData: (data) => {
        set({
          conversations: data.conversations || [],
          settings: { ...defaultSettings, ...data.settings },
          theme: data.theme || 'pour-over',
          currentConversationId: data.conversations?.[0]?.id ?? null,
        })
      },
    }),
    {
      name: 'barista-chat-next',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const useCurrentConversation = () =>
  useStore((state) =>
    state.conversations.find(c => c.id === state.currentConversationId) || null
  )
