"use client";

import React, { useEffect, useRef, useState } from "react";
import { DraggablePanel } from "./DraggablePanel";
import { useAraStore } from "@/store/useAraStore";

export const ParticleFftPanel: React.FC = () => {
  const vortex = useAraStore((s) => s.vortex);
  const updateVortex = useAraStore((s) => s.updateVortex);
  const toggleVortexEnabled = useAraStore((s) => s.toggleVortexEnabled);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const pushDmaLog = useAraStore((s) => s.pushDmaLog);

  const [bars, setBars] = useState<number[]>(Array(16).fill(0.15));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let raf = 0;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let t = 0;

    const startAudio = async () => {
      if (vortex.audioFftEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const ctx = new AudioContext();
          audioCtxRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);
          dataArray = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
          pushDmaLog("vinta", "Microfone WebAudio FFT conectado ao shader de partículas.");
        } catch {
          pushDmaLog("vinta", "Áudio FFT rodando em modo oscilador neural sintético.");
        }
      }

      const tick = () => {
        raf = requestAnimationFrame(tick);
        t += 0.08;
        if (vortex.audioFftEnabled) {
          if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);
            const next = Array.from({ length: 16 }, (_, i) => Math.max(0.08, dataArray![i] / 255));
            const avg = next.reduce((a, b) => a + b, 0) / next.length;
            setBars(next);
            updateVortex({ audioEnergy: avg });
          } else {
            const next = Array.from({ length: 16 }, (_, i) =>
              Math.max(0.1, 0.45 + 0.4 * Math.sin(t + i * 0.55) * Math.cos(t * 0.4 - i * 0.2))
            );
            const avg = next.reduce((a, b) => a + b, 0) / next.length;
            setBars(next);
            updateVortex({ audioEnergy: avg });
          }
        } else {
          setBars((prev) => prev.map((_, i) => 0.12 + 0.05 * Math.sin(t * 0.5 + i)));
        }
      };
      tick();
    };

    startAudio();

    return () => {
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, [vortex.audioFftEnabled]);

  return (
    <DraggablePanel
      title="TEXTURA DE PARTÍCULAS & ÁUDIO FFT"
      onClose={() => togglePanel("particleFft")}
      className="w-[336px]"
    >
      <div className="flex items-center justify-between mb-2 -mt-1">
        <button
          onClick={toggleVortexEnabled}
          className={`px-2 py-0.5 text-[9px] font-bold transition-all ${
            vortex.enabled ? "ara-btn-accent1" : "ara-btn opacity-75"
          }`}
        >
          VÓRTICE 3D: {vortex.enabled ? "ATIVO" : "DESATIVADO"}
        </button>

        <button
          onClick={() => updateVortex({ audioFftEnabled: !vortex.audioFftEnabled })}
          className={`px-2 py-0.5 text-[9px] font-bold transition-all ${
            vortex.audioFftEnabled ? "ara-btn-accent2" : "ara-btn"
          }`}
        >
          ▶ AUDIO FFT: {vortex.audioFftEnabled ? "ON" : "OFF"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[9.5px]">
        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: "var(--ara-text-muted)" }}>NITIDEZ / GRÃO</span>
            <span className="font-bold" style={{ color: "var(--ara-accent-2)" }}>
              {vortex.sharpness.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.4}
            step={0.05}
            value={vortex.sharpness}
            onChange={(e) => updateVortex({ sharpness: parseFloat(e.target.value) })}
            className="w-full ara-range"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: "var(--ara-text-muted)" }}>TAMANHO PARTÍCULA</span>
            <span className="font-bold" style={{ color: "var(--ara-accent-3)" }}>
              {vortex.particleSize.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={1.8}
            step={0.05}
            value={vortex.particleSize}
            onChange={(e) => updateVortex({ particleSize: parseFloat(e.target.value) })}
            className="w-full ara-range"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: "var(--ara-text-muted)" }}>TONALIDADE (HUE)</span>
            <span className="font-bold" style={{ color: "var(--ara-accent-1)" }}>
              {Math.round(vortex.hue)}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={vortex.hue}
            onChange={(e) => updateVortex({ hue: parseFloat(e.target.value) })}
            className="w-full ara-range"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span style={{ color: "var(--ara-text-muted)" }}>FFT SPECTRUM</span>
            <span className="font-bold" style={{ color: "var(--ara-accent-2)" }}>
              {vortex.audioFftEnabled ? "LIVE" : "READY"}
            </span>
          </div>
          <div className="h-5 flex items-end gap-[3px] pt-1">
            {bars.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-75"
                style={{
                  height: `${Math.max(16, Math.round(v * 100))}%`,
                  backgroundColor:
                    i % 3 === 0
                      ? "var(--ara-accent-1)"
                      : i % 3 === 1
                      ? "var(--ara-accent-2)"
                      : "var(--ara-accent-3)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </DraggablePanel>
  );
};
