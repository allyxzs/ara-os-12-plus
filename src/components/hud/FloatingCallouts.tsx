"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAraStore } from "@/store/useAraStore";

interface CalloutItem {
  id: string;
  title: string;
  subtitle: string;
  accentVar: string;
  posClass: string;
}

const INITIAL_CALLOUTS: CalloutItem[] = [
  {
    id: "noetra",
    title: "CHOICE / NOETRA",
    subtitle: "conf 0.96 · MNEMOS SYNC",
    accentVar: "var(--ara-accent-3)",
    posClass: "top-[38%] left-[11%]",
  },
  {
    id: "cortex",
    title: "RISK HOLD // CORTEX",
    subtitle: "gate < 0.85 · handoff active",
    accentVar: "var(--ara-accent-1)",
    posClass: "top-[28%] right-[28%]",
  },
  {
    id: "kernelis",
    title: "SIGNAL CORE // KERNELIS",
    subtitle: "veritas proof · ready",
    accentVar: "var(--ara-accent-2)",
    posClass: "bottom-[26%] right-[28%]",
  },
];

export const FloatingCallouts: React.FC = () => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const isThinking = useAraStore((s) => s.isThinking);
  const araThinkMode = useAraStore((s) => s.araThinkMode);
  const vortexEnabled = useAraStore((s) => s.vortex.enabled);

  if (!vortexEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 hidden lg:block">
      {INITIAL_CALLOUTS.filter((c) => !dismissed.includes(c.id)).map((c) => (
        <div
          key={c.id}
          className={`pointer-events-auto absolute ${c.posClass} px-3 py-2 ara-panel ara-font transition-all`}
          style={{
            borderColor: c.accentVar,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: c.accentVar }}>
              {c.title}
            </span>
            <button
              onClick={() => setDismissed((d) => [...d, c.id])}
              className="opacity-60 hover:opacity-100"
              style={{ color: "var(--ara-text-muted)" }}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="text-[9.5px] mt-0.5" style={{ color: "var(--ara-text-muted)" }}>
            {c.id === "noetra" && isThinking
              ? `ARATHINK ${araThinkMode.toUpperCase()} · ACTIVE`
              : c.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};
