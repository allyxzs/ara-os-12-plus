"use client";

import React from "react";
import { X, ExternalLink, Lock, Unlock } from "lucide-react";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { useAraStore } from "@/store/useAraStore";

export const AgentInspectorModal: React.FC = () => {
  const inspected = useAraStore((s) => s.inspectedAgent);
  const setInspected = useAraStore((s) => s.setInspectedAgent);
  const forcedAgents = useAraStore((s) => s.forcedAgents);
  const toggleForcedAgent = useAraStore((s) => s.toggleForcedAgent);

  if (!inspected) return null;
  const agent = AGENT_REGISTRY[inspected];
  const isForced = forcedAgents.includes(agent.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && setInspected(null)}
    >
      <div
        className="w-[460px] max-w-full ara-modal p-5 ara-font text-xs"
        style={{ borderColor: agent.color }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
              <span className="text-sm font-bold tracking-wider">{agent.repoSlug}</span>
            </div>
            <div className="text-[10.5px] mt-0.5 font-semibold" style={{ color: agent.color }}>
              {agent.role}
            </div>
          </div>
          <button onClick={() => setInspected(null)} className="p-1 ara-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="leading-relaxed text-[11.5px] mb-4" style={{ color: "var(--ara-text-muted)" }}>
          {agent.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
          <div className="p-2.5 ara-card">
            <div style={{ color: "var(--ara-text-muted)" }}>CAMADA</div>
            <div className="uppercase font-bold mt-0.5">{agent.layer}</div>
          </div>
          <div className="p-2.5 ara-card">
            <div style={{ color: "var(--ara-text-muted)" }}>CONFIANÇA BASE</div>
            <div className="font-bold mt-0.5" style={{ color: agent.color }}>
              {(agent.baseConfidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[10px] mb-1.5" style={{ color: "var(--ara-text-muted)" }}>
            CONEXÕES NO ENXAME
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.links.map((lid) => (
              <span key={lid} className="px-2 py-0.5 ara-card text-[10px]">
                {AGENT_REGISTRY[lid].name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={agent.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 ara-btn-primary flex items-center justify-center gap-1.5 font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> ABRIR NO GITHUB
          </a>
          <button
            onClick={() => toggleForcedAgent(agent.id)}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 font-bold ${
              isForced ? "ara-btn-accent2" : "ara-btn"
            }`}
          >
            {isForced ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {isForced ? "FIXADO NO CHAT" : "FIXAR AGENTE"}
          </button>
        </div>
      </div>
    </div>
  );
};
