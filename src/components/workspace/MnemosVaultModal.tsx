"use client";

import React, { useState, useRef } from "react";
import { X, Database, Upload, Pin, Trash2, Plus, Search } from "lucide-react";
import { useAraStore } from "@/store/useAraStore";
import { chunkDocument, estimateTokens } from "@/lib/agents/mnemos";

export const MnemosVaultModal: React.FC = () => {
  const open = useAraStore((s) => s.memoryVaultOpen);
  const setOpen = useAraStore((s) => s.setMemoryVaultOpen);
  const memories = useAraStore((s) => s.memories);
  const addMemories = useAraStore((s) => s.addMemories);
  const deleteMemory = useAraStore((s) => s.deleteMemory);
  const togglePinMemory = useAraStore((s) => s.togglePinMemory);
  const pushDmaLog = useAraStore((s) => s.pushDmaLog);

  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const filtered = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.content.toLowerCase().includes(query.toLowerCase())
  );

  const handleManualAdd = () => {
    if (!content.trim()) return;
    addMemories([
      {
        id: `mem-${Date.now()}`,
        title: title.trim() || "Nota Mnemos",
        content: content.trim(),
        source: "manual",
        tags: ["manual", "mnemos"],
        pinned: true,
        createdAt: new Date().toISOString(),
        tokens: estimateTokens(content),
      },
    ]);
    pushDmaLog("mnemos", `Nova memória registrada: "${title.trim() || "Nota Mnemos"}"`);
    setTitle("");
    setContent("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const chunks = chunkDocument(file.name, text);
    addMemories(chunks);
    pushDmaLog("mnemos", `Ingestão de dados "${file.name}" (${chunks.length} blocos).`);
    e.target.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-[740px] max-w-full max-h-[86vh] ara-modal flex flex-col ara-font text-xs overflow-hidden">
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" style={{ color: "var(--ara-accent-2)" }} />
            <span className="font-bold tracking-widest" style={{ color: "var(--ara-accent-2)" }}>
              MNEMOS VAULT // MEMÓRIA DE CONVERSAS &amp; DADOS ({memories.length})
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 ara-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
          style={{
            borderBottom: "1px solid var(--ara-border-subtle)",
            backgroundColor: "var(--ara-elevated-bg)",
          }}
        >
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do conhecimento / preferência..."
              className="w-full ara-input px-2.5 py-1.5 text-xs"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              placeholder="Cole fatos, regras do projeto, trechos de código ou dados para o Ara OS lembrar..."
              className="w-full ara-input px-2.5 py-1.5 text-xs"
            />
            <button
              onClick={handleManualAdd}
              className="w-full py-1.5 ara-btn-primary font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> SALVAR NA MEMÓRIA MNEMOS
            </button>
          </div>

          <div
            className="flex flex-col justify-between p-3 border border-dashed"
            style={{
              borderRadius: "var(--ara-radius)",
              borderColor: "var(--ara-accent-2-border)",
              backgroundColor: "var(--ara-accent-2-soft)",
            }}
          >
            <div>
              <div className="font-bold mb-1" style={{ color: "var(--ara-accent-2)" }}>
                INGERIR ARQUIVOS &amp; DATASETS
              </div>
              <p className="text-[10.5px]" style={{ color: "var(--ara-text-muted)" }}>
                Suporta .txt, .md, .json, .csv, .py, .ts, .js e .html. O agente Mnemos divide em blocos semânticos e injeta automaticamente no raciocínio AraThink.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.json,.csv,.py,.ts,.tsx,.js,.html,.css"
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 py-2 ara-btn font-bold flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> CARREGAR ARQUIVO NO COFRE
            </button>
          </div>
        </div>

        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: "var(--ara-text-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar memórias por palavra-chave..."
            className="flex-1 bg-transparent text-xs focus:outline-none"
            style={{ color: "var(--ara-text)" }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="p-3 ara-card"
              style={{
                borderColor: m.pinned ? "var(--ara-accent-2-border)" : undefined,
                backgroundColor: m.pinned ? "var(--ara-accent-2-soft)" : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold">{m.title}</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span style={{ color: "var(--ara-text-muted)" }}>
                    {m.tokens} tok · {m.source}
                  </span>
                  <button
                    onClick={() => togglePinMemory(m.id)}
                    style={{ color: m.pinned ? "var(--ara-accent-2)" : "var(--ara-text-muted)" }}
                    title="Fixar memória prioritária"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMemory(m.id)}
                    style={{ color: "var(--ara-text-muted)" }}
                    title="Remover memória"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ara-text-muted)" }}>
                {m.content.slice(0, 320)}
                {m.content.length > 320 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
