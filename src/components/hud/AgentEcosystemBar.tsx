"use client";

import React from "react";
import { AGENT_LIST } from "@/lib/agents/registry";
import { useAraStore } from "@/store/useAraStore";
import { hexToRgba } from "@/lib/theme/palettes";

export const AgentEcosystemBar: React.FC = () => {
  const activeAgents = useAraStore((s) => s.activeAgents);
  const forcedAgents = useAraStore((s) => s.forcedAgents);
  const confidences = useAraStore((s) => s.agentConfidences);
  const isThinking = useAraStore((s) => s.isThinking);
  const vortexEnabled = useAraStore((s) => s.vortex.enabled);
  const colorMode = useAraStore((s) => s.theme.colorMode);
  const setInspectedAgent = useAraStore((s) => s.setInspectedAgent);
  const toggleForcedAgent = useAraStore((s) => s.toggleForcedAgent);

  const isLight = colorMode === "light";

  return (
    <div className="pointer-events-auto w-full ara-bar ara-font px-3 py-1.5 flex items-center justify-between gap-2 text-[9.5px] z-20 overflow-x-auto">
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className="text-[8.5px] uppercase tracking-widest leading-tight mr-1"
          style={{ color: "var(--ara-text-muted)" }}
        >
          AGENT
          <br />
          ECOSYSTEM:
        </span>

        {AGENT_LIST.map((agent) => {
          const isActive = activeAgents.includes(agent.id);
          const isForced = forcedAgents.includes(agent.id);
          const conf = confidences[agent.id] ?? agent.baseConfidence;

          return (
            <button
              key={agent.id}
              onClick={() => setInspectedAgent(agent.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleForcedAgent(agent.id);
              }}
              title={`${agent.name} — ${agent.role}
Clique: Inspecionar repo | Botão direito: Fixar no roteamento`}
              className="flex items-center gap-1.5 px-2 py-0.5 border transition-all whitespace-nowrap"
              style={{
                borderRadius: "var(--ara-radius)",
                borderColor: isForced
                  ? "var(--ara-accent-2)"
                  : isActive
                  ? hexToRgba(agent.color, isLight ? 0.55 : 0.65)
                  : "var(--ara-border-subtle)",
                backgroundColor: isForced
                  ? "var(--ara-accent-2-soft)"
                  : isActive
                  ? hexToRgba(agent.color, isLight ? 0.11 : 0.16)
                  : "var(--ara-elevated-bg)",
                color: "var(--ara-text)",
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isActive && isThinking ? "animate-ping" : ""}`}
                style={{ backgroundColor: agent.color }}
              />
              <span className="tracking-wider">{agent.repoSlug}</span>
              <span className="font-bold" style={{ color: agent.color }}>
                {conf.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="hidden 2xl:block text-[9px] whitespace-nowrap pl-3"
        style={{ color: "var(--ara-text-muted)" }}
      >
        {vortexEnabled
          ? "Arraste: Girar 3D · Botão Direito/Shift: Mover Tela · Scroll: Zoom"
          : "Vórtice 3D desativado (0% GPU) · Ctrl+K para comandos rápidos"}
      </div>
    </div>
  );
};
