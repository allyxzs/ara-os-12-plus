"use client";

import React, { useEffect, useRef, useState } from "react";
import { DraggablePanel } from "./DraggablePanel";
import { useAraStore } from "@/store/useAraStore";

export const CurvaturePanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const vortex = useAraStore((s) => s.vortex);
  const theme = useAraStore((s) => s.theme);
  const isThinking = useAraStore((s) => s.isThinking);
  const [curvMax, setCurvMax] = useState(2.396);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      t += 0.018 * vortex.speed * (isThinking ? 2.2 : 1);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.34;

      ctx.strokeStyle =
        theme.colorMode === "light" ? "rgba(15, 23, 42, 0.14)" : "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = theme.accentPrimary;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = theme.accentPrimary;
      ctx.shadowBlur = theme.colorMode === "light" ? 4 : 10;
      ctx.beginPath();

      const steps = 240;
      const mod = 0.32 + vortex.turbulence * 0.1 + (vortex.audioFftEnabled ? vortex.audioEnergy * 0.15 : 0);
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = baseR * (0.72 + mod * Math.cos(7 * theta + t) + 0.08 * Math.sin(3 * theta - t * 0.6));
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (Math.random() < 0.05) {
        setCurvMax(Number((2.15 + Math.sin(t) * 0.35 + vortex.turbulence * 0.18).toFixed(3)));
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [
    vortex.speed,
    vortex.turbulence,
    vortex.audioFftEnabled,
    vortex.audioEnergy,
    theme.accentPrimary,
    theme.colorMode,
    isThinking,
  ]);

  return (
    <DraggablePanel
      title="A / CURVATURE"
      subtitle="HARMONIC (3, 7)"
      subtitleColor="var(--ara-accent-2)"
      onClose={() => togglePanel("curvature")}
      className="w-[248px]"
    >
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} width={180} height={124} className="w-[180px] h-[124px]" />
        <div
          className="w-full flex items-center justify-between pt-2 mt-1 text-[10px]"
          style={{ borderTop: "1px solid var(--ara-border-subtle)" }}
        >
          <span style={{ color: "var(--ara-text-muted)" }}>CURV MAX</span>
          <span className="font-bold" style={{ color: "var(--ara-accent-2)" }}>
            {curvMax.toFixed(3)}
          </span>
        </div>
      </div>
    </DraggablePanel>
  );
};
