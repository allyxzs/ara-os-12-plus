"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AgentId, AGENT_LIST } from "@/lib/agents/registry";
import { AraThinkMode } from "@/lib/agents/arathink";
import { MemoryEntry } from "@/lib/agents/mnemos";
import { GeneratedImageItem } from "@/lib/agents/vinta-image";
import { ProviderConfig } from "@/lib/agents/llm-providers";
import {
  DEFAULT_GENERATION_PARAMS,
  GenerationParams,
  TRANSFORMER_MODELS,
} from "@/lib/transformers/models";
import {
  ThemeConfig,
  ThemePreset,
  THEME_PRESETS,
  ColorMode,
  generateRandomHarmony,
} from "@/lib/theme/palettes";

export type VortexShape =
  | "tensor-toroid"
  | "black-hole"
  | "quantum-helix"
  | "harmonic-sphere"
  | "lorenz-chaos"
  | "spiral-galaxy";

export type MouseMode = "orbit" | "pan";
export type ViewPreset = "full" | "minimal" | "vortex-only" | "workspace" | "focus-clean";

export interface PanelVisibility {
  topBar: boolean;
  agentBar: boolean;
  curvature: boolean;
  torsion: boolean;
  swarm: boolean;
  dmaStream: boolean;
  particleFft: boolean;
  callouts: boolean;
  chatConsole: boolean;
}

export interface VortexConfig {
  enabled: boolean;
  shape: VortexShape;
  particleCount: number;
  opacity: number;
  sharpness: number;
  particleSize: number;
  hue: number;
  speed: number;
  turbulence: number;
  twistDeg: number;
  apertureMm: number;
  strainPct: number;
  aspectRatio: number;
  whiteCoreMix: number;
  audioFftEnabled: boolean;
  audioEnergy: number;
}

export interface SavedThemeProfile {
  id: string;
  name: string;
  createdAt: string;
  theme: ThemeConfig;
  vortex: Pick<
    VortexConfig,
    "enabled" | "shape" | "hue" | "opacity" | "sharpness" | "particleSize" | "whiteCoreMix"
  >;
  panels: PanelVisibility;
}

export interface MessageStats {
  tokens: number;
  tps: number;
  ttftMs?: number;
  totalMs?: number;
  device?: string;
  modelId?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  isStreaming?: boolean;
  isCurrentlyThinking?: boolean;
  error?: string;
  timestamp: string;
  activeAgents?: AgentId[];
  recalledMemories?: Array<{ id: string; title: string; score: number }>;
  generatedImage?: GeneratedImageItem;
  providerUsed?: string;
  stats?: MessageStats;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface DmaLogEntry {
  id: string;
  time: string;
  agent: AgentId;
  text: string;
}

interface AraState {
  vortex: VortexConfig;
  theme: ThemeConfig;
  panels: PanelVisibility;
  savedProfiles: SavedThemeProfile[];
  mouseMode: MouseMode;
  viewPreset: ViewPreset;
  cameraResetSignal: number;
  panelResetSignal: number;
  customizerOpen: boolean;
  memoryVaultOpen: boolean;
  vintaStudioOpen: boolean;
  commandPaletteOpen: boolean;
  chatExpanded: boolean;
  previewHtml: string | null;
  previewTitle: string;
  inspectedAgent: AgentId | null;

  activeAgents: AgentId[];
  agentConfidences: Record<AgentId, number>;
  forcedAgents: AgentId[];
  isThinking: boolean;
  araThinkMode: AraThinkMode;
  dmaLogs: DmaLogEntry[];

  sessions: ChatSession[];
  activeSessionId: string;
  memories: MemoryEntry[];
  images: GeneratedImageItem[];
  providerConfig: ProviderConfig;
  generationParams: GenerationParams;
  imageApiProvider: "vinta-local" | "openai";
  imageApiKey: string;

  updateVortex: (patch: Partial<VortexConfig>) => void;
  toggleVortexEnabled: () => void;
  updateTheme: (patch: Partial<ThemeConfig>) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  applyThemePreset: (preset: ThemePreset) => void;
  randomizeHarmony: () => void;
  togglePanel: (key: keyof PanelVisibility) => void;
  setPanels: (patch: Partial<PanelVisibility>) => void;
  applyViewPreset: (preset: ViewPreset) => void;
  setMouseMode: (mode: MouseMode) => void;
  triggerCameraReset: () => void;
  triggerPanelReset: () => void;
  setCustomizerOpen: (open: boolean) => void;
  setMemoryVaultOpen: (open: boolean) => void;
  setVintaStudioOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setChatExpanded: (expanded: boolean) => void;
  openWebPreview: (html: string | null, title?: string) => void;
  setInspectedAgent: (id: AgentId | null) => void;
  setAraThinkMode: (mode: AraThinkMode) => void;
  toggleForcedAgent: (id: AgentId) => void;
  setIsThinking: (thinking: boolean, agents?: AgentId[]) => void;
  pushDmaLog: (agent: AgentId, text: string) => void;
  updateProviderConfig: (patch: Partial<ProviderConfig>) => void;
  updateGenerationParams: (patch: Partial<GenerationParams>) => void;
  setImageProvider: (provider: "vinta-local" | "openai", apiKey?: string) => void;

  saveCurrentProfile: (name: string) => void;
  loadSavedProfile: (id: string) => void;
  deleteSavedProfile: (id: string) => void;

  createSession: () => void;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearActiveSession: () => void;
  appendMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  deleteMessage: (id: string) => void;
  truncateAfterMessage: (id: string, includeTarget?: boolean) => void;
  addMemories: (entries: MemoryEntry[]) => void;
  updateMemoryEmbedding: (id: string, embedding: number[]) => void;
  deleteMemory: (id: string) => void;
  togglePinMemory: (id: string) => void;
  addGeneratedImage: (img: GeneratedImageItem) => void;
  exportUiConfigJson: () => string;
  importUiConfigJson: (raw: string) => boolean;
  resetUiDefaults: () => void;
}

const nowTime = () => new Date().toTimeString().slice(0, 8);

const defaultConfidences = AGENT_LIST.reduce((acc, a) => {
  acc[a.id] = a.baseConfidence;
  return acc;
}, {} as Record<AgentId, number>);

const DEFAULT_VORTEX: VortexConfig = {
  enabled: true,
  shape: "tensor-toroid",
  particleCount: 85000,
  opacity: 0.95,
  sharpness: 1.45,
  particleSize: 0.65,
  hue: 330,
  speed: 1.0,
  turbulence: 0.65,
  twistDeg: 62.8,
  apertureMm: 95.9,
  strainPct: 18.0,
  aspectRatio: 1.231,
  whiteCoreMix: 0.72,
  audioFftEnabled: false,
  audioEnergy: 0.15,
};

const DEFAULT_THEME: ThemeConfig = {
  colorMode: "dark",
  bgColor: "#000000",
  surfaceColor: "#07080f",
  textColor: "#f4f4f8",
  mutedTextColor: "#94a3b8",
  accentPrimary: "#ff2a85",
  accentSecondary: "#00f0ff",
  accentTertiary: "#9b5de5",
  borderTint: 0.28,
  surfaceTint: 0.06,
  panelOpacity: 0.84,
  panelBlur: 12,
  borderRadius: 6,
  glowIntensity: 0.85,
  fontScale: 1.0,
  fontStyle: "mono",
  density: "comfortable",
  backdropStyle: "radial-aurora",
  backdropIntensity: 0.65,
  activePresetId: "aether-black",
};

const DEFAULT_PANELS: PanelVisibility = {
  topBar: true,
  agentBar: true,
  curvature: true,
  torsion: true,
  swarm: true,
  dmaStream: true,
  particleFft: true,
  callouts: true,
  chatConsole: true,
};

const INITIAL_SESSION_ID = "session-prime";

const INITIAL_MEMORIES: MemoryEntry[] = [
  {
    id: "mem-core-1",
    title: "Arquitetura Ara OS 12+ v3 (Transformers Neural)",
    content:
      "Ecossistema de 10 agentes (Morvat, Cortex, Vinta, Veritas, Mnemos, Lumeta, Noetra, Janus, Kernelis e Archon) rodando modelos Hugging Face Transformers reais via WebGPU/WASM ou PyTorch.",
    source: "manual",
    tags: ["transformers", "ecossistema", "ara-os"],
    pinned: true,
    createdAt: new Date().toISOString(),
    tokens: 52,
  },
];

export const useAraStore = create<AraState>()(
  persist(
    (set, get) => ({
      vortex: DEFAULT_VORTEX,
      theme: DEFAULT_THEME,
      panels: DEFAULT_PANELS,
      savedProfiles: [],
      mouseMode: "orbit",
      viewPreset: "full",
      cameraResetSignal: 0,
      panelResetSignal: 0,
      customizerOpen: false,
      memoryVaultOpen: false,
      vintaStudioOpen: false,
      commandPaletteOpen: false,
      chatExpanded: false,
      previewHtml: null,
      previewTitle: "Lumeta Live Preview",
      inspectedAgent: null,

      activeAgents: ["cortex", "mnemos", "archon"],
      agentConfidences: defaultConfidences,
      forcedAgents: [],
      isThinking: false,
      araThinkMode: "arathink",
      dmaLogs: [
        {
          id: "log-1",
          time: nowTime(),
          agent: "cortex",
          text: "ARA OS 12+ v3 inicializado — Motor Hugging Face Transformers pronto (WebGPU/WASM).",
        },
        {
          id: "log-2",
          time: nowTime(),
          agent: "noetra",
          text: "Respostas automáticas removidas: inferência 100% neural com streaming token-a-token.",
        },
        {
          id: "log-3",
          time: nowTime(),
          agent: "archon",
          text: "10 repositórios allyxzs/* sincronizados no roteador multi-agente.",
        },
      ],

      sessions: [
        {
          id: INITIAL_SESSION_ID,
          title: "Nova Conversa // Transformers",
          createdAt: new Date().toISOString(),
          messages: [],
        },
      ],
      activeSessionId: INITIAL_SESSION_ID,
      memories: INITIAL_MEMORIES,
      images: [],
      providerConfig: {
        provider: "transformers-web",
        model: TRANSFORMER_MODELS[0].id,
        device: "auto",
        dtype: "q4f16",
        baseUrl: "http://localhost:8000",
        neuralMemoryEnabled: false,
      },
      generationParams: DEFAULT_GENERATION_PARAMS,
      imageApiProvider: "vinta-local",
      imageApiKey: "",

      updateVortex: (patch) =>
        set((state) => ({
          vortex: { ...state.vortex, ...patch },
        })),

      toggleVortexEnabled: () => {
        const next = !get().vortex.enabled;
        set((state) => ({
          vortex: { ...state.vortex, enabled: next },
          panels: next
            ? state.panels
            : {
                ...state.panels,
                callouts: false,
                chatConsole: true,
              },
        }));
        get().pushDmaLog(
          "morvat",
          next
            ? "Vórtice 3D WebGL reativado na GPU."
            : "Vórtice 3D desativado (0% GPU) — liberando mais VRAM para o modelo Transformer."
        );
      },

      updateTheme: (patch) =>
        set((state) => ({
          theme: { ...state.theme, ...patch },
        })),

      setColorMode: (mode) => {
        const current = get().theme;
        if (current.colorMode === mode) return;
        const targetPreset =
          THEME_PRESETS.find((p) => p.mode === mode) ||
          (mode === "light" ? THEME_PRESETS[6] : THEME_PRESETS[0]);

        set((state) => ({
          theme: {
            ...state.theme,
            colorMode: mode,
            bgColor: targetPreset.bgColor,
            surfaceColor: targetPreset.surfaceColor,
            textColor: targetPreset.textColor,
            mutedTextColor: targetPreset.mutedTextColor,
            borderTint: targetPreset.borderTint,
            surfaceTint: targetPreset.surfaceTint,
            activePresetId: `${state.theme.activePresetId}-${mode}`,
          },
        }));
        get().pushDmaLog(
          "lumeta",
          `Tema global alternado para MODO ${mode === "light" ? "CLARO" : "ESCURO"}.`
        );
      },

      toggleColorMode: () => {
        const next: ColorMode = get().theme.colorMode === "dark" ? "light" : "dark";
        get().setColorMode(next);
      },

      applyThemePreset: (preset) => {
        set((state) => ({
          theme: {
            ...state.theme,
            colorMode: preset.mode,
            bgColor: preset.bgColor,
            surfaceColor: preset.surfaceColor,
            textColor: preset.textColor,
            mutedTextColor: preset.mutedTextColor,
            accentPrimary: preset.accentPrimary,
            accentSecondary: preset.accentSecondary,
            accentTertiary: preset.accentTertiary,
            backdropStyle: preset.backdropStyle,
            borderTint: preset.borderTint,
            surfaceTint: preset.surfaceTint,
            activePresetId: preset.id,
          },
          vortex: {
            ...state.vortex,
            hue: preset.hue,
          },
        }));
        get().pushDmaLog("lumeta", `Preset global aplicado → ${preset.name} (${preset.mode.toUpperCase()}).`);
      },

      randomizeHarmony: () => {
        const mode = get().theme.colorMode;
        const harmony = generateRandomHarmony(mode);
        const { hue, ...themePatch } = harmony;
        set((state) => ({
          theme: { ...state.theme, ...themePatch },
          vortex: { ...state.vortex, hue },
        }));
        get().pushDmaLog("vinta", `Nova harmonia cromática aplicada em toda a interface (HUE ${hue}°).`);
      },

      togglePanel: (key) =>
        set((state) => ({
          panels: { ...state.panels, [key]: !state.panels[key] },
        })),

      setPanels: (patch) =>
        set((state) => ({
          panels: { ...state.panels, ...patch },
        })),

      applyViewPreset: (preset) => {
        if (preset === "vortex-only") {
          set((state) => ({
            viewPreset: preset,
            vortex: { ...state.vortex, enabled: true },
            panels: {
              topBar: true,
              agentBar: false,
              curvature: false,
              torsion: false,
              swarm: false,
              dmaStream: false,
              particleFft: false,
              callouts: false,
              chatConsole: false,
            },
          }));
        } else if (preset === "focus-clean") {
          set((state) => ({
            viewPreset: preset,
            vortex: { ...state.vortex, enabled: false },
            chatExpanded: true,
            panels: {
              topBar: true,
              agentBar: true,
              curvature: false,
              torsion: false,
              swarm: false,
              dmaStream: false,
              particleFft: false,
              callouts: false,
              chatConsole: true,
            },
          }));
        } else if (preset === "minimal") {
          set({
            viewPreset: preset,
            chatExpanded: false,
            panels: {
              topBar: true,
              agentBar: true,
              curvature: false,
              torsion: false,
              swarm: false,
              dmaStream: true,
              particleFft: false,
              callouts: false,
              chatConsole: true,
            },
          });
        } else if (preset === "workspace") {
          set({
            viewPreset: preset,
            chatExpanded: false,
            panels: {
              topBar: true,
              agentBar: true,
              curvature: true,
              torsion: false,
              swarm: true,
              dmaStream: true,
              particleFft: false,
              callouts: false,
              chatConsole: true,
            },
          });
        } else {
          set((state) => ({
            viewPreset: "full",
            chatExpanded: false,
            panels: {
              topBar: true,
              agentBar: true,
              curvature: true,
              torsion: true,
              swarm: true,
              dmaStream: true,
              particleFft: true,
              callouts: state.vortex.enabled,
              chatConsole: state.panels.chatConsole,
            },
          }));
        }
      },

      setMouseMode: (mouseMode) => set({ mouseMode }),
      triggerCameraReset: () => set((s) => ({ cameraResetSignal: s.cameraResetSignal + 1 })),
      triggerPanelReset: () => set((s) => ({ panelResetSignal: s.panelResetSignal + 1 })),
      setCustomizerOpen: (customizerOpen) => set({ customizerOpen }),
      setMemoryVaultOpen: (memoryVaultOpen) => set({ memoryVaultOpen }),
      setVintaStudioOpen: (vintaStudioOpen) => set({ vintaStudioOpen }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setChatExpanded: (chatExpanded) => set({ chatExpanded }),
      openWebPreview: (previewHtml, previewTitle = "Lumeta Live Preview") =>
        set({ previewHtml, previewTitle }),
      setInspectedAgent: (inspectedAgent) => set({ inspectedAgent }),
      setAraThinkMode: (araThinkMode) => set({ araThinkMode }),

      toggleForcedAgent: (id) =>
        set((state) => {
          const exists = state.forcedAgents.includes(id);
          return {
            forcedAgents: exists
              ? state.forcedAgents.filter((a) => a !== id)
              : [...state.forcedAgents, id],
          };
        }),

      setIsThinking: (isThinking, agents) =>
        set((state) => ({
          isThinking,
          activeAgents: agents ?? state.activeAgents,
        })),

      pushDmaLog: (agent, text) =>
        set((state) => ({
          dmaLogs: [
            ...state.dmaLogs.slice(-45),
            {
              id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              time: nowTime(),
              agent,
              text,
            },
          ],
        })),

      updateProviderConfig: (patch) =>
        set((state) => ({
          providerConfig: { ...state.providerConfig, ...patch },
        })),

      updateGenerationParams: (patch) =>
        set((state) => ({
          generationParams: { ...state.generationParams, ...patch },
        })),

      setImageProvider: (imageApiProvider, apiKey) =>
        set((state) => ({
          imageApiProvider,
          imageApiKey: apiKey !== undefined ? apiKey : state.imageApiKey,
        })),

      saveCurrentProfile: (name) => {
        const { theme, vortex, panels } = get();
        const profile: SavedThemeProfile = {
          id: `prof-${Date.now()}`,
          name: name.trim() || `Perfil ${get().savedProfiles.length + 1}`,
          createdAt: new Date().toISOString(),
          theme: { ...theme },
          vortex: {
            enabled: vortex.enabled,
            shape: vortex.shape,
            hue: vortex.hue,
            opacity: vortex.opacity,
            sharpness: vortex.sharpness,
            particleSize: vortex.particleSize,
            whiteCoreMix: vortex.whiteCoreMix,
          },
          panels: { ...panels },
        };
        set((s) => ({ savedProfiles: [profile, ...s.savedProfiles] }));
        get().pushDmaLog("mnemos", `Perfil visual salvo: "${profile.name}".`);
      },

      loadSavedProfile: (id) => {
        const profile = get().savedProfiles.find((p) => p.id === id);
        if (!profile) return;
        set((s) => ({
          theme: { ...s.theme, ...profile.theme },
          vortex: { ...s.vortex, ...profile.vortex },
          panels: { ...s.panels, ...profile.panels },
        }));
        get().pushDmaLog("lumeta", `Perfil visual carregado: "${profile.name}".`);
      },

      deleteSavedProfile: (id) =>
        set((s) => ({ savedProfiles: s.savedProfiles.filter((p) => p.id !== id) })),

      createSession: () => {
        const id = `session-${Date.now()}`;
        const newSession: ChatSession = {
          id,
          title: `Sessão ${get().sessions.length + 1}`,
          createdAt: new Date().toISOString(),
          messages: [],
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
      },

      selectSession: (activeSessionId) => set({ activeSessionId }),

      deleteSession: (id) =>
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id);
          if (remaining.length === 0) {
            const fresh: ChatSession = {
              id: `session-${Date.now()}`,
              title: "Nova Conversa",
              createdAt: new Date().toISOString(),
              messages: [],
            };
            return { sessions: [fresh], activeSessionId: fresh.id };
          }
          return {
            sessions: remaining,
            activeSessionId: state.activeSessionId === id ? remaining[0].id : state.activeSessionId,
          };
        }),

      clearActiveSession: () =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeSessionId ? { ...s, messages: [] } : s
          ),
        })),

      appendMessage: (msg) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s;
            const title =
              s.messages.length === 0 && msg.role === "user"
                ? msg.content.slice(0, 34) + (msg.content.length > 34 ? "..." : "")
                : s.title;
            return { ...s, title, messages: [...s.messages, msg] };
          }),
        })),

      updateMessage: (id, patch) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
            };
          }),
        })),

      deleteMessage: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s;
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== id),
            };
          }),
        })),

      truncateAfterMessage: (id, includeTarget = false) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.activeSessionId) return s;
            const idx = s.messages.findIndex((m) => m.id === id);
            if (idx === -1) return s;
            return {
              ...s,
              messages: s.messages.slice(0, includeTarget ? idx : idx + 1),
            };
          }),
        })),

      addMemories: (entries) =>
        set((state) => ({
          memories: [...entries, ...state.memories],
        })),

      updateMemoryEmbedding: (id, embedding) =>
        set((state) => ({
          memories: state.memories.map((m) => (m.id === id ? { ...m, embedding } : m)),
        })),

      deleteMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        })),

      togglePinMemory: (id) =>
        set((state) => ({
          memories: state.memories.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)),
        })),

      addGeneratedImage: (img) =>
        set((state) => ({
          images: [img, ...state.images].slice(0, 30),
        })),

      exportUiConfigJson: () => {
        const { vortex, theme, panels, generationParams } = get();
        return JSON.stringify({ version: "12.8.0", vortex, theme, panels, generationParams }, null, 2);
      },

      importUiConfigJson: (raw) => {
        try {
          const parsed = JSON.parse(raw);
          set((state) => ({
            vortex: parsed.vortex ? { ...state.vortex, ...parsed.vortex } : state.vortex,
            theme: parsed.theme ? { ...state.theme, ...parsed.theme } : state.theme,
            panels: parsed.panels ? { ...state.panels, ...parsed.panels } : state.panels,
            generationParams: parsed.generationParams
              ? { ...state.generationParams, ...parsed.generationParams }
              : state.generationParams,
          }));
          return true;
        } catch {
          return false;
        }
      },

      resetUiDefaults: () =>
        set((state) => ({
          vortex: DEFAULT_VORTEX,
          theme: DEFAULT_THEME,
          panels: DEFAULT_PANELS,
          viewPreset: "full",
          chatExpanded: false,
          panelResetSignal: state.panelResetSignal + 1,
        })),
    }),
    {
      name: "ara-os-12-plus-v3-storage",
      partialize: (state) => ({
        vortex: state.vortex,
        theme: state.theme,
        panels: state.panels,
        savedProfiles: state.savedProfiles,
        sessions: state.sessions.map((s) => ({
          ...s,
          messages: s.messages.map((m) => ({ ...m, isStreaming: false, isCurrentlyThinking: false })),
        })),
        activeSessionId: state.activeSessionId,
        memories: state.memories.map((m) => ({ ...m, embedding: undefined })),
        providerConfig: state.providerConfig,
        generationParams: state.generationParams,
        araThinkMode: state.araThinkMode,
      }),
    }
  )
);
