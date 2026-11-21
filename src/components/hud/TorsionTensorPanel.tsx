"use client";

import React, { useEffect, useState } from "react";
import { DraggablePanel } from "./DraggablePanel";
import { useAraStore } from "@/store/useAraStore";
import { hexToRgba, getContrastText } from "@/lib/theme/palettes";

export const TorsionTensorPanel: React.FC = () => {
  const togglePanel = useAraStore((s) => s.togglePanel);
  const isThinking = useAraStore((s) => s.isThinking);
  const vortex = useAraStore((s) => s.vortex);
  const theme = useAraStore((s) => s.theme);
  const [matrix, setMatrix] = useState<number[]>([0.74, 0.74, 0.21, 0.26, 0.68, 0.68, 0.41, 0.19, 0.87]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatrix((prev) =>
        prev.map((val, idx) => {
          const jitter = (Math.random() - 0.5) * (isThinking ? 0.18 : 0.05);
          const base = 0.2 + ((idx * 17) % 7) * 0.09 + (vortex.audioFftEnabled ? vortex.audioEnergy * 0.2 : 0);
          return Math.min(0.99, Math.max(0.05, Number((val * 0.65 + base * 0.35 + jitter).toFixed(2))));
        })
      );
    }, 650);
    return () => clearInterval(interval);
  }, [isThinking, vortex.audioFftEnabled, vortex.audioEnergy]);

  const isLight = theme.colorMode === "light";
  const highContrast = getContrastText(theme.accentPrimary);

  return (
    <DraggablePanel
      title="B / TORSION TENSOR"
      subtitle="JACOBIAN 3×3"
      subtitleColor="var(--ara-accent-3)"
      onClose={() => togglePanel("torsion")}
      className="w-[248px]"
    >
      <div className="text-[9px] tracking-widest mb-2" style={{ color: "var(--ara-text-muted)" }}>
        LOCAL DEFORMATION TENSOR
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {matrix.map((val, i) => {
          const bgAlpha = isLight ? 0.12 + val * 0.68 : 0.14 + val * 0.54;
          const useAccentText = isLight ? val > 0.62 : val > 0.52;
          return (
            <div
              key={i}
              className="h-8 flex items-center justify-center text-[10.5px] font-bold border transition-all duration-300"
              style={{
                borderRadius: "var(--ara-radius)",
                backgroundColor: hexToRgba(theme.accentPrimary, bgAlpha),
                borderColor: hexToRgba(theme.accentPrimary, 0.22 + val * 0.48),
                color: useAccentText ? highContrast : "var(--ara-text)",
              }}
            >
              +{val.toFixed(2)}
            </div>
          );
        })}
      </div>
    </DraggablePanel>
  );
};
