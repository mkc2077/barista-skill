import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { ModuleId, InventoryItem } from '@/lib/modules'

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

// 口味档位（按模块独立偏好）
export type TasteKey = 'acidity' | 'sweetness' | 'less_bitter' | 'body' | 'clarity'

export interface UserDevices {
  grinders: string[]
  brewers: string[]
  kettles: string[]
}

export interface UserProfile {
  // 多设备（v7 P3c.5）：用户可能多台磨豆机/器具，按需勾选
  devices: UserDevices
  waterTds: string
  waterSource: string
  scale: boolean
  dislikes: string[]
  level: string
  beansUsual: string[]
  // 口味偏好按模块独立（v7 P3c.5）：意式爱苦 / 手冲爱酸 / 特调爱甜
  tasteByModule: { [K in ModuleId]?: TasteKey }
  // Legacy（v7 P3c.5 前单字段，保留为兼容期读取，UI 写入请用 devices/tasteByModule）
  grinder?: string
  brewer?: string
  kettle?: string
  tastePref?: string
}

// Legacy (kept for migration from v6.x)
export interface InventoryBean {
  id: string;
  name: string;
  origin?: string;
  process?: string;
  roast?: string;
  note?: string;
}

export type { InventoryItem, ModuleId };

export interface KnowledgeNote {
  id: string;
  title: string;
  text: string;
  category: string;
  createdAt: number;
  source?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  moduleId?: ModuleId;
}

export type AccentOverride = 'auto' | ModuleId;

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
  autoSyncOn: boolean;
  syncIntervalDays: number;
  autoSyncTopics: string[];
  lastSyncAt: number;
  currentModule: ModuleId;
  accentOverride: AccentOverride;
  inventoryItems: InventoryItem[];
  profile: UserProfile;
  // Legacy fields (read-only compat)
  inventoryBeans: InventoryBean[];
  inventoryGrinders: string[];
  knowledge: KnowledgeNote[];
}

export type ViewMode = 'chat' | 'profile';

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: Settings;
  theme: ThemeMode;
  sidebarOpen: boolean;
  showSettings: boolean;
  viewMode: ViewMode;
  streaming: boolean;

  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addMessage: (convId: string, msg: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (convId: string, msgId: string, content: string) => void;
  appendCards: (convId: string, msgId: string, cards: ToolCard[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addKnowledgeNotes: (notes: KnowledgeNote[]) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setViewMode: (m: ViewMode) => void;
  toggleSidebar: () => void;
  setShowSettings: (v: boolean) => void;
  setStreaming: (v: boolean) => void;
  exportData: () => { conversations: Conversation[]; settings: Settings; theme: ThemeMode };
  importData: (data: { conversations: Conversation[]; settings: Partial<Settings>; theme: ThemeMode }) => void;
}

const defaultProfile: UserProfile = {
  devices: { grinders: [], brewers: [], kettles: [] },
  waterTds: "",
  waterSource: "",
  scale: false,
  dislikes: [],
  level: "",
  beansUsual: [],
  tasteByModule: {},
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
  autoSyncOn: false,
  syncIntervalDays: 7,
  autoSyncTopics: [],
  lastSyncAt: 0,
  currentModule: 'pourover',
  accentOverride: 'auto',
  inventoryItems: [],
  profile: defaultProfile,
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
      viewMode: 'chat',
      streaming: false,

      createConversation: () => {
        const id = uuidv4();
        const now = Date.now();
        const conv: Conversation = {
          id, title: "新对话", messages: [], createdAt: now, updatedAt: now,
          moduleId: get().settings.currentModule,
        };
        set((s) => ({ conversations: [conv, ...s.conversations], currentConversationId: id }));
        return id;
      },
      selectConversation: (id) => set({ currentConversationId: id }),
      deleteConversation: (id) =>
        set((s) => {
          const convs = s.conversations.filter((c) => c.id !== id);
          return {
            conversations: convs,
            currentConversationId: s.currentConversationId === id ? (convs[0]?.id ?? null) : s.currentConversationId,
          };
        }),
      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)),
        })),
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
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id !== convId ? c : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, content } : m)), updatedAt: Date.now() }
          ),
        })),
      appendCards: (convId, msgId, cards) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id !== convId ? c : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, cards: [...(m.cards || []), ...cards] } : m)), updatedAt: Date.now() }
          ),
        })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      addKnowledgeNotes: (notes) =>
        set((s) => ({ settings: { ...s.settings, knowledge: [...(s.settings.knowledge || []), ...notes] } })),
      addInventoryItem: (item) =>
        set((s) => ({ settings: { ...s.settings, inventoryItems: [...(s.settings.inventoryItems || []), item] } })),
      updateInventoryItem: (id, patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            inventoryItems: (s.settings.inventoryItems || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
          },
        })),
      removeInventoryItem: (id) =>
        set((s) => ({
          settings: { ...s.settings, inventoryItems: (s.settings.inventoryItems || []).filter((it) => it.id !== id) },
        })),
      setTheme: (theme) => set({ theme }),
      setViewMode: (m) => set({ viewMode: m }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setShowSettings: (v) => set({ showSettings: v }),
      setStreaming: (v) => set({ streaming: v }),
      exportData: () => {
        const { conversations, settings, theme } = get();
        return { conversations, settings, theme };
      },
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
          // v7 P3c.5 迁移：把旧单值字段映射到 devices/tasteByModule
          devices: (p.settings?.profile?.devices && Object.keys(p.settings.profile.devices).length > 0)
            ? p.settings.profile.devices
            : {
                grinders: [p.settings?.profile?.grinder, ...(dp.grinders || [])].filter(Boolean),
                brewers: [p.settings?.profile?.brewer, ...(dp.brewers || [])].filter(Boolean),
                kettles: [p.settings?.profile?.kettle, ...(dp.kettles || [])].filter(Boolean),
              },
          tasteByModule: (p.settings?.profile?.tasteByModule && Object.keys(p.settings.profile.tasteByModule).length > 0)
            ? p.settings.profile.tasteByModule
            : (p.settings?.profile?.tastePref ? { pourover: p.settings.profile.tastePref as any } : (dp.tasteByModule || {})),
          dislikes: p.settings?.profile?.dislikes ?? dp.dislikes ?? [],
          beansUsual: p.settings?.profile?.beansUsual ?? dp.beansUsual ?? [],
        };
        sSettings.inventoryBeans = p.settings?.inventoryBeans ?? cur.settings.inventoryBeans ?? [];
        sSettings.inventoryGrinders = p.settings?.inventoryGrinders ?? cur.settings.inventoryGrinders ?? [];
        sSettings.knowledge = p.settings?.knowledge ?? cur.settings.knowledge ?? [];
        sSettings.currentModule = p.settings?.currentModule ?? cur.settings.currentModule ?? 'pourover';
        sSettings.accentOverride = p.settings?.accentOverride ?? cur.settings.accentOverride ?? 'auto';
        const persistedItems: InventoryItem[] = p.settings?.inventoryItems ?? cur.settings.inventoryItems ?? [];
        const migrated: InventoryItem[] = [];
        if (!p.settings?.inventoryItems && cur.settings.inventoryItems?.length === 0) {
          for (const b of (p.settings?.inventoryBeans ?? [])) {
            migrated.push({
              id: b.id ?? `bean-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              category: 'bean',
              name: b.name,
              brand: b.origin,
              meta: {
                ...(b.process ? { process: b.process } : {}),
                ...(b.roast ? { roast: b.roast } : {}),
                ...(b.note ? { note: b.note } : {}),
              },
              addedAt: Date.now(),
            });
          }
          for (const g of (p.settings?.inventoryGrinders ?? [])) {
            migrated.push({
              id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              category: 'grinder',
              name: g,
              addedAt: Date.now(),
            });
          }
        }
        sSettings.inventoryItems = persistedItems.length > 0 || migrated.length === 0 ? persistedItems : migrated;
        return { ...cur, ...p, settings: sSettings };
      },
    }
  )
);

export const useCurrentConversation = () =>
  useStore((s) => s.conversations.find((c) => c.id === s.currentConversationId) ?? null);