"use client";

import React from "react";
import { MessageSquare, Sliders, Eye } from "lucide-react";
import { VortexCanvas } from "@/components/vortex/VortexCanvas";
import { TopTelemetryBar } from "@/components/hud/TopTelemetryBar";
import { AgentEcosystemBar } from "@/components/hud/AgentEcosystemBar";
import { CurvaturePanel } from "@/components/hud/CurvaturePanel";
import { TorsionTensorPanel } from "@/components/hud/TorsionTensorPanel";
import { AgentSwarmPanel } from "@/components/hud/AgentSwarmPanel";
import { KernelDmaPanel } from "@/components/hud/KernelDmaPanel";
import { ParticleFftPanel } from "@/components/hud/ParticleFftPanel";
import { FloatingCallouts } from "@/components/hud/FloatingCallouts";
import { ChatConsole } from "@/components/workspace/ChatConsole";
import { CustomizationDrawer } from "@/components/workspace/CustomizationDrawer";
import { CommandPaletteModal } from "@/components/workspace/CommandPaletteModal";
import { MnemosVaultModal } from "@/components/workspace/MnemosVaultModal";
import { VintaStudioModal } from "@/components/workspace/VintaStudioModal";
import { WebPreviewModal } from "@/components/workspace/WebPreviewModal";
import { AgentInspectorModal } from "@/components/workspace/AgentInspectorModal";
import { useAraStore } from "@/store/useAraStore";

export default function AraOsHomePage() {
  const panels = useAraStore((s) => s.panels);
  const vortexEnabled = useAraStore((s) => s.vortex.enabled);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const toggleVortexEnabled = useAraStore((s) => s.toggleVortexEnabled);
  const setCustomizerOpen = useAraStore((s) => s.setCustomizerOpen);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: "var(--ara-bg)", color: "var(--ara-text)" }}
    >
      {/* 3D WebGL Vortex (unmounts completely when disabled) + Ambient Backdrop */}
      <VortexCanvas />

      {/* Clean Center Hub when Vortex is OFF and Chat is minimized */}
      {!vortexEnabled && !panels.chatConsole && (
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center p-4">
          <div className="pointer-events-auto ara-panel ara-font p-6 max-w-md w-full text-center space-y-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold tracking-widest"
              style={{
                borderRadius: "999px",
                backgroundColor: "var(--ara-accent-1-soft)",
                color: "var(--ara-accent-1)",
                border: "1px solid var(--ara-accent-1-border)",
              }}
            >
              ARA OS 12+ // MODO LIMPO (0% GPU)
            </div>
            <h1 className="text-lg font-bold tracking-wider">Workspace Multi-Agente Pronto</h1>
            <p className="text-xs leading-relaxed" style={{ color: "var(--ara-text-muted)" }}>
              O vórtice 3D está desativado para foco máximo e economia total de GPU. Abra o console de IA ou personalize sua paleta global.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => togglePanel("chatConsole")}
                className="px-3.5 py-2 ara-btn-primary text-[10.5px] font-bold flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> ABRIR CHAT &amp; ARATHINK
              </button>
              <button
                onClick={() => setCustomizerOpen(true)}
                className="px-3 py-2 ara-btn text-[10.5px] font-bold flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" /> CORES &amp; TEMA
              </button>
              <button
                onClick={toggleVortexEnabled}
                className="px-3 py-2 ara-btn-accent2 text-[10.5px] font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> REATIVAR VÓRTICE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D-Anchored HUD Callouts */}
      {panels.callouts && <FloatingCallouts />}

      {/* Top HUD Bars */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 flex flex-col">
        {panels.topBar && <TopTelemetryBar />}
        {panels.agentBar && <AgentEcosystemBar />}
      </div>

      {/* Right Telemetry Stack */}
      <div className="pointer-events-none fixed top-[96px] right-3 z-20 hidden md:flex flex-col gap-3">
        {panels.curvature && <CurvaturePanel />}
        {panels.torsion && <TorsionTensorPanel />}
      </div>

      {/* Bottom Modular HUD Dock */}
      <div className="pointer-events-none fixed bottom-3 left-3 right-3 z-20 flex flex-wrap items-end justify-between gap-3">
        <div className="hidden lg:block">{panels.swarm && <AgentSwarmPanel />}</div>
        <div className="flex-1 flex justify-center min-w-[280px]">
          {panels.dmaStream && <KernelDmaPanel />}
        </div>
        <div className="hidden md:block">{panels.particleFft && <ParticleFftPanel />}</div>
      </div>

      {/* Interactive Multi-Agent Chat & AraThink Console */}
      {panels.chatConsole && <ChatConsole />}

      {/* Drawers & Modals */}
      <CustomizationDrawer />
      <CommandPaletteModal />
      <MnemosVaultModal />
      <VintaStudioModal />
      <WebPreviewModal />
      <AgentInspectorModal />
    </main>
  );
}
