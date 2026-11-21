"use client";

import React from "react";
import { DraggablePanel } from "./DraggablePanel";
import { AGENT_LIST, AGENT_REGISTRY } from "@/lib/agents/registry";
import { useAraStore } from "@/store/useAraStore";

export const AgentSwarmPanel: React.FC = () => {
  const togglePanel = useAraStore((s) => s.togglePanel);
  const activeAgents = useAraStore((s) => s.activeAgents);
  const memories = useAraStore((s) => s.memories);
  const theme = useAraStore((s) => s.theme);
  const setInspectedAgent = useAraStore((s) => s.setInspectedAgent);
  const isThinking = useAraStore((s) => s.isThinking);

  const totalTokens = memories.reduce((sum, m) => sum + (m.tokens || 30), 21400);
  const isLight = theme.colorMode === "light";

  return (
    <DraggablePanel
      title="ARA SWARM // 10 REPOS"
      subtitle={`CTX ${(totalTokens / 1000).toFixed(1)}K`}
      subtitleColor="var(--ara-accent-2)"
      onClose={() => togglePanel("swarm")}
      className="w-[310px]"
    >
      <div
        className="relative w-full h-[116px] overflow-hidden"
        style={{
          borderRadius: "var(--ara-radius)",
          backgroundColor: isLight ? "rgba(15, 23, 42, 0.04)" : "rgba(0, 0, 0, 0.45)",
          border: "1px solid var(--ara-border-subtle)",
        }}
      >
        <svg viewBox="0 0 300 116" className="w-full h-full">
          {AGENT_LIST.map((agent) =>
            agent.links.map((targetId) => {
              const target = AGENT_REGISTRY[targetId];
              if (!target || agent.id > targetId) return null;
              const active = activeAgents.includes(agent.id) && activeAgents.includes(targetId);
              return (
                <line
                  key={`${agent.id}-${targetId}`}
                  x1={agent.graphPos.x * 280 + 10}
                  y1={agent.graphPos.y * 98 + 9}
                  x2={target.graphPos.x * 280 + 10}
                  y2={target.graphPos.y * 98 + 9}
                  stroke={
                    active
                      ? theme.accentPrimary
                      : isLight
                      ? "rgba(15, 23, 42, 0.16)"
                      : "rgba(255,255,255,0.16)"
                  }
                  strokeWidth={active ? 1.5 : 0.75}
                  strokeDasharray={active && isThinking ? "3 2" : undefined}
                />
              );
            })
          )}

          <circle
            cx={150}
            cy={60}
            r={16}
            fill="none"
            stroke={theme.accentPrimary}
            strokeOpacity={0.55}
            strokeWidth={1.3}
          />

          {AGENT_LIST.map((agent) => {
            const x = agent.graphPos.x * 280 + 10;
            const y = agent.graphPos.y * 98 + 9;
            const active = activeAgents.includes(agent.id);
            return (
              <g
                key={agent.id}
                onClick={() => setInspectedAgent(agent.id)}
                className="cursor-pointer"
              >
                <rect
                  x={x - 24}
                  y={y - 7}
                  width={48}
                  height={14}
                  rx={3}
                  fill={isLight ? (active ? "#ffffff" : "#f1f5f9") : active ? "#120918" : "#07080d"}
                  stroke={
                    active
                      ? agent.color
                      : isLight
                      ? "rgba(15, 23, 42, 0.24)"
                      : "rgba(255,255,255,0.22)"
                  }
                  strokeWidth={active ? 1.3 : 0.8}
                />
                <text
                  x={x}
                  y={y + 2.5}
                  textAnchor="middle"
                  fill={isLight ? "#0f172a" : active ? "#ffffff" : "#94a3b8"}
                  fontSize="6.8"
                  fontFamily="monospace"
                  fontWeight={active ? "700" : "500"}
                >
                  {agent.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </DraggablePanel>
  );
};
