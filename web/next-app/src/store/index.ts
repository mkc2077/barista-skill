import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type ThemeMode = "light" | "dark";

export interface ToolCard {
  tool: string;
  data: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: string;
  cards?: ToolCard[];
  images?: string[];
}

export interface UserProfile {
  grinder: string;
  brewer: string;
  kettle: string;
  scale: boolean;
  waterTds: string;
  waterSource: string;
  tastePref: string;          // acidity | sweetness | less_bitter | body | clarity
  dislikes: string[];          // e.g. ['焦苦', '涩']
  level: string;               // beginner | intermediate | advanced
  beansUsual: string[];         // origins/processes the user likes
}

export interface InventoryBean {
  id: string;
  name: string;
  origin?: string;
  process?: string;
  roast?: string;              // light | medium | dark
  note?: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  text: string;
  category: string;            // recipe | method | bean | gear | search | note
  createdAt: number;
  source?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  mcpServerOn: boolean;
  mcpServerUrl: string;
  webSearchOn: boolean;
  anysearchKey: string;
  profile: UserProfile;
  inventoryBeans: InventoryBean[];
  inventoryGrinders: string[];
  knowledge: KnowledgeNote[];
}

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: Settings;
  theme: ThemeMode;
  sidebarOpen: boolean;
  showSettings: boolean;
  streaming: boolean;

  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addMessage: (convId: string, msg: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (convId: string, msgId: string, content: string) => void;
  appendCards: (convId: string, msgId: string, cards: ToolCard[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setShowSettings: (v: boolean) => void;
  setStreaming: (v: boolean) => void;
  exportData: () => { conversations: Conversation[]; settings: Settings; theme: ThemeMode };
  importData: (data: { conversations: Conversation[]; settings: Partial<Settings>; theme: ThemeMode }) => void;
}

const defaultSettings: Settings = {
  provider: "",
  apiKey: "",
  baseUrl: "",
  model: "",
  temperature: 0.7,
  systemPrompt: "",
  mcpServerOn: true,
  mcpServerUrl: "http://127.0.0.1:8765/mcp",
  webSearchOn: false,
  anysearchKey: "",
  profile: {
    grinder: "",
    brewer: "",
    kettle: "",
    scale: false,
    waterTds: "",
    waterSource: "",
    tastePref: "",
    dislikes: [],
    level: "",
    beansUsual: [],
  },
  inventoryBeans: [],
  inventoryGrinders: [],
  knowledge: [],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      theme: "dark",
      sidebarOpen: true,
      showSettings: false,
      streaming: false,

      createConversation: () => {
        const id = uuidv4();
        const now = Date.now();
        const conv: Conversation = { id, title: "新对话", messages: [], createdAt: now, updatedAt: now };
        set((s) => ({ conversations: [conv, ...s.conversations], currentConversationId: id }));
        return id;
      },
      selectConversation: (id) => set({ currentConversationId: id }),
      deleteConversation: (id) =>
        set((s) => {
          const convs = s.conversations.filter((c) => c.id !== id);
          return { conversations: convs, currentConversationId: s.currentConversationId === id ? (convs[0]?.id ?? null) : s.currentConversationId };
        }),
      renameConversation: (id, title) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)) })),
      addMessage: (convId, msg) => {
        const id = uuidv4();
        const full: Message = { ...msg, id, timestamp: Date.now() };
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== convId) return c;
            const messages = [...c.messages, full];
            const title = c.title === "新对话" && msg.role === "user" ? msg.content.slice(0, 24) + (msg.content.length > 24 ? "…" : "") : c.title;
            return { ...c, messages, title, updatedAt: Date.now() };
          }),
        }));
        return id;
      },
      updateMessage: (convId, msgId, content) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id !== convId ? c : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, content } : m)), updatedAt: Date.now() })) })),
      appendCards: (convId, msgId, cards) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id !== convId ? c : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, cards: [...(m.cards || []), ...cards] } : m)), updatedAt: Date.now() })) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setShowSettings: (v) => set({ showSettings: v }),
      setStreaming: (v) => set({ streaming: v }),
      exportData: () => { const { conversations, settings, theme } = get(); return { conversations, settings, theme }; },
      importData: (data) => {
        const state = get();
        set({
          conversations: data.conversations || [],
          settings: { ...state.settings, ...(data.settings || {}) },
          theme: data.theme || state.theme,
          currentConversationId: (data.conversations || [])[0]?.id ?? null,
        });
      },
    }),
    {
      name: "barista-skill-store-v6",
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = (persisted as any) || {};
        const cur = current as any;
        const sSettings = { ...cur.settings, ...(p.settings || {}) };
        const dp = cur.settings.profile || {};
        sSettings.profile = {
          ...dp,
          ...(p.settings?.profile || {}),
          dislikes: p.settings?.profile?.dislikes ?? dp.dislikes ?? [],
          beansUsual: p.settings?.profile?.beansUsual ?? dp.beansUsual ?? [],
        };
        sSettings.inventoryBeans = p.settings?.inventoryBeans ?? cur.settings.inventoryBeans ?? [];
        sSettings.inventoryGrinders = p.settings?.inventoryGrinders ?? cur.settings.inventoryGrinders ?? [];
        sSettings.knowledge = p.settings?.knowledge ?? cur.settings.knowledge ?? [];
        return { ...cur, ...p, settings: sSettings };
      },
    }
  )
);

export const useCurrentConversation = () =>
  useStore((s) => s.conversations.find((c) => c.id === s.currentConversationId) ?? null);
