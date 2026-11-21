"use client";

import React, { useEffect, useRef } from "react";
import { DraggablePanel } from "./DraggablePanel";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { useAraStore } from "@/store/useAraStore";

export const KernelDmaPanel: React.FC = () => {
  const togglePanel = useAraStore((s) => s.togglePanel);
  const dmaLogs = useAraStore((s) => s.dmaLogs);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmaLogs.length]);

  return (
    <DraggablePanel
      title="KERNEL DMA STREAM // GLSL & REPO LOG"
      subtitle="60.0 HZ"
      subtitleColor="var(--ara-text-muted)"
      onClose={() => togglePanel("dmaStream")}
      className="w-[390px] max-w-[92vw]"
    >
      <div className="h-[116px] overflow-y-auto space-y-1 pr-1 text-[10px] leading-relaxed">
        {dmaLogs.map((log) => {
          const agent = AGENT_REGISTRY[log.agent];
          return (
            <div key={log.id} className="flex gap-1.5 items-start">
              <span className="shrink-0" style={{ color: "var(--ara-text-muted)" }}>
                [{log.time}]
              </span>
              <span className="font-bold shrink-0" style={{ color: agent?.color || "var(--ara-accent-1)" }}>
                {log.agent}
              </span>
              <span className="break-words" style={{ color: "var(--ara-text)" }}>
                {log.text}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </DraggablePanel>
  );
};
