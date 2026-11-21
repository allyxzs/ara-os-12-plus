"use client";

import React from "react";
import {
  Crosshair,
  Hand,
  Orbit,
  Sliders,
  MessageSquare,
  Database,
  Sparkles,
  Brain,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Command,
} from "lucide-react";
import { useAraStore } from "@/store/useAraStore";

export const TopTelemetryBar: React.FC = () => {
  const vortex = useAraStore((s) => s.vortex);
  const theme = useAraStore((s) => s.theme);
  const panels = useAraStore((s) => s.panels);
  const mouseMode = useAraStore((s) => s.mouseMode);
  const viewPreset = useAraStore((s) => s.viewPreset);
  const araThinkMode = useAraStore((s) => s.araThinkMode);
  const memories = useAraStore((s) => s.memories);

  const triggerCameraReset = useAraStore((s) => s.triggerCameraReset);
  const setMouseMode = useAraStore((s) => s.setMouseMode);
  const applyViewPreset = useAraStore((s) => s.applyViewPreset);
  const setCustomizerOpen = useAraStore((s) => s.setCustomizerOpen);
  const setMemoryVaultOpen = useAraStore((s) => s.setMemoryVaultOpen);
  const setVintaStudioOpen = useAraStore((s) => s.setVintaStudioOpen);
  const setCommandPaletteOpen = useAraStore((s) => s.setCommandPaletteOpen);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const toggleColorMode = useAraStore((s) => s.toggleColorMode);
  const toggleVortexEnabled = useAraStore((s) => s.toggleVortexEnabled);

  const hiddenCount = Object.entries(panels).filter(
    ([k, v]) => k !== "topBar" && k !== "chatConsole" && !v
  ).length;

  return (
    <header className="pointer-events-auto w-full ara-bar ara-font px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] z-30">
      {/* Left: Brand & Live Physics Metrics */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: "var(--ara-accent-1)",
              boxShadow: "0 0 10px var(--ara-accent-1)",
            }}
          />
          <span className="font-bold tracking-[0.18em] text-[11px]" style={{ color: "var(--ara-text)" }}>
            ARA OS 12+
          </span>
          <span style={{ color: "var(--ara-text-muted)" }}>// AETHER v6.5</span>
        </div>

        <div
          className="hidden 2xl:flex items-center gap-4 pl-4"
          style={{ borderLeft: "1px solid var(--ara-border-subtle)" }}
        >
          <div>
            <div className="text-[8px] tracking-widest" style={{ color: "var(--ara-text-muted)" }}>
              ASPECT RATIO
            </div>
            <div className="font-bold" style={{ color: "var(--ara-accent-2)" }}>
              {vortex.aspectRatio.toFixed(3)}
            </div>
          </div>
          <div>
            <div className="text-[8px] tracking-widest" style={{ color: "var(--ara-text-muted)" }}>
              APERTURE / MM
            </div>
            <div className="font-bold" style={{ color: "var(--ara-accent-3)" }}>
              {vortex.apertureMm.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-[8px] tracking-widest" style={{ color: "var(--ara-text-muted)" }}>
              TWIST / DEG
            </div>
            <div className="font-bold" style={{ color: "var(--ara-accent-1)" }}>
              {vortex.twistDeg.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-[8px] tracking-widest" style={{ color: "var(--ara-text-muted)" }}>
              GPU VÓRTICE
            </div>
            <div
              className="font-bold"
              style={{ color: vortex.enabled ? "var(--ara-accent-2)" : "var(--ara-text-muted)" }}
            >
              {vortex.enabled ? `${(vortex.particleCount / 1000).toFixed(0)}K ON` : "OFF (0%)"}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Workspace, Theme Mode, Vortex ON/OFF & HUD Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => togglePanel("chatConsole")}
          className={`flex items-center gap-1.5 px-2.5 py-1 transition-all ${
            panels.chatConsole ? "ara-btn-primary font-bold" : "ara-btn-accent2"
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          <span>CHAT & ARATHINK</span>
          {araThinkMode !== "standard" && <Brain className="w-3 h-3" />}
        </button>

        <button
          onClick={() => setVintaStudioOpen(true)}
          className="flex items-center gap-1 px-2 py-1 ara-btn-accent3 transition-all hover:brightness-110"
        >
          <Sparkles className="w-3 h-3" />
          <span>VINTA IMG</span>
        </button>

        <button
          onClick={() => setMemoryVaultOpen(true)}
          className="flex items-center gap-1 px-2 py-1 ara-btn transition-all"
        >
          <Database className="w-3 h-3" style={{ color: "var(--ara-accent-2)" }} />
          <span>MNEMOS ({memories.length})</span>
        </button>

        {/* Light / Dark Mode Instant Toggle */}
        <button
          onClick={toggleColorMode}
          className="flex items-center gap-1 px-2 py-1 ara-btn transition-all"
          title="Alternar Modo Claro / Escuro"
        >
          {theme.colorMode === "dark" ? (
            <>
              <Sun className="w-3 h-3" style={{ color: "var(--ara-accent-1)" }} />
              <span>CLARO</span>
            </>
          ) : (
            <>
              <Moon className="w-3 h-3" style={{ color: "var(--ara-accent-3)" }} />
              <span>ESCURO</span>
            </>
          )}
        </button>

        {/* Vortex 3D ON / OFF Instant Toggle */}
        <button
          onClick={toggleVortexEnabled}
          className={`flex items-center gap-1 px-2 py-1 transition-all ${
            vortex.enabled ? "ara-btn-accent2" : "ara-btn opacity-80"
          }`}
          title="Ativar ou remover completamente o vórtice 3D da tela"
        >
          {vortex.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>VÓRTICE: {vortex.enabled ? "ON" : "OFF"}</span>
        </button>

        {vortex.enabled && (
          <>
            <button
              onClick={triggerCameraReset}
              className="hidden sm:flex items-center gap-1 px-2 py-1 ara-btn transition-all"
              title="Centralizar câmera 3D"
            >
              <Crosshair className="w-3 h-3" style={{ color: "var(--ara-accent-2)" }} />
              <span className="hidden lg:inline">CENTRALIZAR</span>
            </button>

            <button
              onClick={() => setMouseMode(mouseMode === "orbit" ? "pan" : "orbit")}
              className="hidden md:flex items-center gap-1 px-2 py-1 ara-btn transition-all"
              title="Alternar modo do mouse no 3D"
            >
              {mouseMode === "orbit" ? (
                <Orbit className="w-3 h-3" style={{ color: "var(--ara-accent-1)" }} />
              ) : (
                <Hand className="w-3 h-3" style={{ color: "var(--ara-accent-1)" }} />
              )}
              <span className="hidden xl:inline">{mouseMode === "orbit" ? "GIRAR 3D" : "MOVER"}</span>
            </button>
          </>
        )}

        <div className="hidden lg:flex items-center gap-1">
          {vortex.enabled && (
            <button
              onClick={() => applyViewPreset("vortex-only")}
              className={`px-2 py-1 ${viewPreset === "vortex-only" ? "ara-btn-accent1 font-bold" : "ara-btn"}`}
            >
              ◎ SÓ VÓRTICE
            </button>
          )}
          <button
            onClick={() => applyViewPreset("focus-clean")}
            className={`px-2 py-1 ${viewPreset === "focus-clean" ? "ara-btn-accent1 font-bold" : "ara-btn"}`}
            title="Remove vórtice e foca no workspace limpo"
          >
            ◻ FOCO LIMPO
          </button>
          <button
            onClick={() => applyViewPreset("minimal")}
            className={`px-2 py-1 ${viewPreset === "minimal" ? "ara-btn-accent1 font-bold" : "ara-btn"}`}
          >
            ◐ MINIMAL
          </button>
          <button
            onClick={() => applyViewPreset("full")}
            className={`px-2 py-1 ${viewPreset === "full" ? "ara-btn-accent1 font-bold" : "ara-btn"}`}
          >
            ● TUDO
          </button>
        </div>

        {hiddenCount > 0 && (
          <button
            onClick={() => applyViewPreset("full")}
            className="px-2 py-1 ara-btn-accent1"
            title="Restaurar painéis ocultos"
          >
            {hiddenCount} OCULTO{hiddenCount > 1 ? "S" : ""}
          </button>
        )}

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-1 px-2 py-1 ara-btn"
          title="Paleta de Comandos (Ctrl+K)"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>

        <button
          onClick={() => setCustomizerOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 ara-btn-primary font-bold"
        >
          <Sliders className="w-3 h-3" />
          <span>PERSONALIZAR</span>
        </button>
      </div>
    </header>
  );
};
