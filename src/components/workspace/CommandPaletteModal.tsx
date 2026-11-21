"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sun,
  Moon,
  Eye,
  EyeOff,
  MessageSquare,
  Sliders,
  Sparkles,
  Database,
  Shuffle,
  RotateCcw,
  X,
} from "lucide-react";
import { useAraStore } from "@/store/useAraStore";
import { THEME_PRESETS } from "@/lib/theme/palettes";

export const CommandPaletteModal: React.FC = () => {
  const open = useAraStore((s) => s.commandPaletteOpen);
  const setOpen = useAraStore((s) => s.setCommandPaletteOpen);
  const theme = useAraStore((s) => s.theme);
  const vortex = useAraStore((s) => s.vortex);

  const toggleColorMode = useAraStore((s) => s.toggleColorMode);
  const toggleVortexEnabled = useAraStore((s) => s.toggleVortexEnabled);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const setCustomizerOpen = useAraStore((s) => s.setCustomizerOpen);
  const setVintaStudioOpen = useAraStore((s) => s.setVintaStudioOpen);
  const setMemoryVaultOpen = useAraStore((s) => s.setMemoryVaultOpen);
  const applyThemePreset = useAraStore((s) => s.applyThemePreset);
  const applyViewPreset = useAraStore((s) => s.applyViewPreset);
  const randomizeHarmony = useAraStore((s) => s.randomizeHarmony);
  const resetUiDefaults = useAraStore((s) => s.resetUiDefaults);

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, setOpen]);

  if (!open) return null;

  const actions = [
    {
      id: "toggle-mode",
      label: theme.colorMode === "dark" ? "Ativar Modo Claro (Light Mode)" : "Ativar Modo Escuro (Dark Mode)",
      group: "APARÊNCIA",
      icon: theme.colorMode === "dark" ? Sun : Moon,
      run: () => toggleColorMode(),
    },
    {
      id: "toggle-vortex",
      label: vortex.enabled ? "Remover Vórtice 3D (Modo Limpo 0% GPU)" : "Ativar Vórtice 3D WebGL",
      group: "VÓRTICE",
      icon: vortex.enabled ? EyeOff : Eye,
      run: () => toggleVortexEnabled(),
    },
    {
      id: "focus-clean",
      label: "Preset Foco Limpo (Sem Vórtice + Chat Expandido)",
      group: "LAYOUT",
      icon: MessageSquare,
      run: () => applyViewPreset("focus-clean"),
    },
    {
      id: "random-harmony",
      label: "Gerar Nova Harmonia de Cores na Interface Toda",
      group: "APARÊNCIA",
      icon: Shuffle,
      run: () => randomizeHarmony(),
    },
    {
      id: "open-chat",
      label: "Abrir / Ocultar Console Chat & AraThink",
      group: "WORKSPACE",
      icon: MessageSquare,
      run: () => togglePanel("chatConsole"),
    },
    {
      id: "open-customizer",
      label: "Abrir Painel de Personalização Completa",
      group: "APARÊNCIA",
      icon: Sliders,
      run: () => setCustomizerOpen(true),
    },
    {
      id: "open-vinta",
      label: "Abrir Vinta Image Studio (Gerador de Imagens)",
      group: "WORKSPACE",
      icon: Sparkles,
      run: () => setVintaStudioOpen(true),
    },
    {
      id: "open-mnemos",
      label: "Abrir Cofre de Memória Mnemos Vault",
      group: "WORKSPACE",
      icon: Database,
      run: () => setMemoryVaultOpen(true),
    },
    ...THEME_PRESETS.map((p) => ({
      id: `preset-${p.id}`,
      label: `Aplicar Tema: ${p.name} (${p.mode === "light" ? "Claro" : "Escuro"})`,
      group: "TEMAS",
      icon: p.mode === "light" ? Sun : Moon,
      run: () => applyThemePreset(p),
    })),
    {
      id: "reset-all",
      label: "Restaurar Padrão Original Ara OS 12+",
      group: "SISTEMA",
      icon: RotateCcw,
      run: () => resetUiDefaults(),
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.group.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-[560px] max-w-full ara-modal overflow-hidden ara-font text-xs">
        <div
          className="px-3.5 py-2.5 flex items-center gap-2.5"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--ara-accent-2)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando (ex: claro, escuro, vórtice, tema, chat)..."
            className="flex-1 bg-transparent focus:outline-none text-xs"
            style={{ color: "var(--ara-text)" }}
          />
          <button onClick={() => setOpen(false)} className="p-1 ara-btn">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => {
                  a.run();
                  setOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left ara-btn border-transparent hover:border-[var(--ara-accent-1-border)]"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--ara-accent-1)" }} />
                  <span>{a.label}</span>
                </span>
                <span className="text-[9px] uppercase" style={{ color: "var(--ara-text-muted)" }}>
                  {a.group}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-8 text-center" style={{ color: "var(--ara-text-muted)" }}>
              Nenhum comando encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
