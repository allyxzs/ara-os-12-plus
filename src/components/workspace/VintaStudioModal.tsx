"use client";

import React, { useState } from "react";
import { X, Sparkles, Download } from "lucide-react";
import { useAraStore } from "@/store/useAraStore";
import { renderVintaProceduralImage, VintaStyle } from "@/lib/agents/vinta-image";

const STYLES: Array<{ id: VintaStyle; label: string }> = [
  { id: "aether-cyber", label: "Aether Cyber Neon" },
  { id: "quantum-nebula", label: "Nebulosa Quântica" },
  { id: "sugimori-watercolor", label: "Aquarela Clássica" },
  { id: "blueprint-cad", label: "Blueprint Técnico CAD" },
  { id: "obsidian-gold", label: "Obsidiana & Ouro" },
  { id: "glitch-matrix", label: "Glitch Matrix Verde" },
];

export const VintaStudioModal: React.FC = () => {
  const open = useAraStore((s) => s.vintaStudioOpen);
  const setOpen = useAraStore((s) => s.setVintaStudioOpen);
  const images = useAraStore((s) => s.images);
  const addGeneratedImage = useAraStore((s) => s.addGeneratedImage);
  const imageApiProvider = useAraStore((s) => s.imageApiProvider);
  const imageApiKey = useAraStore((s) => s.imageApiKey);
  const pushDmaLog = useAraStore((s) => s.pushDmaLog);

  const [prompt, setPrompt] = useState("Vórtice tensorial de energia pura com anéis harmônicos e partículas neon");
  const [style, setStyle] = useState<VintaStyle>("aether-cyber");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    pushDmaLog("vinta", `Sintetizando imagem [${style}] → "${prompt.slice(0, 42)}..."`);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, provider: imageApiProvider, apiKey: imageApiKey }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        addGeneratedImage({
          id: `img-${Date.now()}`,
          prompt,
          style,
          dataUrl: data.imageUrl,
          engine: data.engine || "openai-dalle3",
          seed: Date.now() % 999999,
          createdAt: new Date().toISOString(),
        });
      } else {
        const rendered = renderVintaProceduralImage(prompt, style, data.seed);
        addGeneratedImage({
          id: `img-${Date.now()}`,
          prompt,
          style,
          dataUrl: rendered.dataUrl,
          engine: "vinta-procedural-neural-canvas",
          seed: rendered.seed,
          createdAt: new Date().toISOString(),
        });
      }
      pushDmaLog("vinta", "Renderização 1024×1024 concluída e salva na galeria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-[840px] max-w-full max-h-[88vh] ara-modal flex flex-col ara-font text-xs overflow-hidden">
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: "var(--ara-accent-3)" }} />
            <span className="font-bold tracking-widest" style={{ color: "var(--ara-accent-3)" }}>
              VINTA IMAGE STUDIO // ALLYXZS/VINTA
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 ara-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="p-4 space-y-3"
          style={{
            borderBottom: "1px solid var(--ara-border-subtle)",
            backgroundColor: "var(--ara-elevated-bg)",
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="Descreva a imagem que o agente Vinta deve sintetizar..."
            className="w-full ara-input p-2.5 text-xs"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStyle(st.id)}
                  className={`px-2.5 py-1 text-[10px] ${
                    style === st.id ? "ara-btn-accent3 font-bold" : "ara-btn"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 ara-btn-primary font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? "RENDERIZANDO..." : "GERAR IMAGEM 1024PX"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {images.length === 0 ? (
            <div className="col-span-full text-center py-12" style={{ color: "var(--ara-text-muted)" }}>
              Nenhuma imagem na galeria ainda. Clique em GERAR IMAGEM 1024PX ou use /imagine no chat.
            </div>
          ) : (
            images.map((img) => (
              <div key={img.id} className="ara-card overflow-hidden">
                <img src={img.dataUrl} alt={img.prompt} className="w-full aspect-square object-cover" />
                <div className="p-2.5 space-y-1.5">
                  <div className="text-[10px] line-clamp-2">{img.prompt}</div>
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span style={{ color: "var(--ara-accent-3)" }}>{img.style}</span>
                    <a
                      href={img.dataUrl}
                      download={`ara-vinta-${img.seed}.png`}
                      className="flex items-center gap-1 font-bold"
                      style={{ color: "var(--ara-accent-2)" }}
                    >
                      <Download className="w-3 h-3" /> PNG
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
