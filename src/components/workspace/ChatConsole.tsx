"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Square,
  Brain,
  Paperclip,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  X,
  Download,
  Database,
  Maximize2,
  Minimize2,
  Cpu,
  RefreshCw,
  Sliders,
  Mic,
  MicOff,
  Volume2,
  Edit3,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useAraStore } from "@/store/useAraStore";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { chunkDocument } from "@/lib/agents/mnemos";
import { renderVintaProceduralImage } from "@/lib/agents/vinta-image";
import { prepareMultiAgentContext } from "@/lib/agents/orchestrator";
import { parseThinkStream } from "@/lib/agents/prompt-builder";
import {
  TRANSFORMER_MODELS,
  TransformerEngineStatus,
  ModelLoadProgress,
} from "@/lib/transformers/models";
import { transformersClient } from "@/lib/transformers/client";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { hexToRgba } from "@/lib/theme/palettes";

export const ChatConsole: React.FC = () => {
  const sessions = useAraStore((s) => s.sessions);
  const activeSessionId = useAraStore((s) => s.activeSessionId);
  const memories = useAraStore((s) => s.memories);
  const araThinkMode = useAraStore((s) => s.araThinkMode);
  const isThinking = useAraStore((s) => s.isThinking);
  const providerConfig = useAraStore((s) => s.providerConfig);
  const generationParams = useAraStore((s) => s.generationParams);
  const forcedAgents = useAraStore((s) => s.forcedAgents);
  const chatExpanded = useAraStore((s) => s.chatExpanded);
  const colorMode = useAraStore((s) => s.theme.colorMode);

  const setAraThinkMode = useAraStore((s) => s.setAraThinkMode);
  const setIsThinking = useAraStore((s) => s.setIsThinking);
  const setChatExpanded = useAraStore((s) => s.setChatExpanded);
  const appendMessage = useAraStore((s) => s.appendMessage);
  const updateMessage = useAraStore((s) => s.updateMessage);
  const deleteMessage = useAraStore((s) => s.deleteMessage);
  const truncateAfterMessage = useAraStore((s) => s.truncateAfterMessage);
  const createSession = useAraStore((s) => s.createSession);
  const selectSession = useAraStore((s) => s.selectSession);
  const deleteSession = useAraStore((s) => s.deleteSession);
  const clearActiveSession = useAraStore((s) => s.clearActiveSession);
  const addMemories = useAraStore((s) => s.addMemories);
  const updateMemoryEmbedding = useAraStore((s) => s.updateMemoryEmbedding);
  const addGeneratedImage = useAraStore((s) => s.addGeneratedImage);
  const pushDmaLog = useAraStore((s) => s.pushDmaLog);
  const openWebPreview = useAraStore((s) => s.openWebPreview);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const updateProviderConfig = useAraStore((s) => s.updateProviderConfig);
  const updateGenerationParams = useAraStore((s) => s.updateGenerationParams);

  const [input, setInput] = useState("");
  const [expandedTraces, setExpandedTraces] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showHyperparams, setShowHyperparams] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [engineStatus, setEngineStatus] = useState<TransformerEngineStatus>("idle");
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [downloadFiles, setDownloadFiles] = useState<Record<string, ModelLoadProgress>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const isLight = colorMode === "light";
  const isLocalTransformer = providerConfig.provider === "transformers-web";

  useEffect(() => {
    const unsub = transformersClient.subscribe(({ type, payload }) => {
      if (type === "status") {
        setEngineStatus("loading");
        setStatusMessage(payload.message || "Carregando pesos Transformer...");
        if (payload.device) setActiveDevice(payload.device);
      } else if (type === "progress") {
        setEngineStatus("loading");
        if (payload.file) {
          setDownloadFiles((prev) => ({
            ...prev,
            [payload.file]: payload,
          }));
        }
      } else if (type === "ready") {
        setEngineStatus("ready");
        setLoadedModelId(payload.modelId);
        setActiveDevice(payload.device || "wasm");
        setStatusMessage("");
        setDownloadFiles({});
        pushDmaLog(
          "cortex",
          `Transformer "${payload.modelId}" carregado em ${(payload.device || "wasm").toUpperCase()}.`
        );
      } else if (type === "unloaded") {
        setEngineStatus("idle");
        setLoadedModelId(null);
        setDownloadFiles({});
        pushDmaLog("cortex", "Modelo Transformer descarregado da memória.");
      } else if (type === "error") {
        setEngineStatus("error");
        setStatusMessage(payload.error || "Erro ao inicializar Transformer.");
        pushDmaLog("cortex", `Erro Transformers.js: ${payload.error}`);
      }
    });
    return unsub;
  }, [pushDmaLog]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, isThinking]);

  const progressEntries = Object.values(downloadFiles);
  const overallDownloadPct =
    progressEntries.length > 0
      ? Math.round(
          progressEntries.reduce((acc, f) => acc + (f.status === "done" ? 100 : f.progress || 0), 0) /
            progressEntries.length
        )
      : 0;

  const handleLoadModel = () => {
    setDownloadFiles({});
    setEngineStatus("loading");
    setStatusMessage(`Baixando/inicializando ${providerConfig.model}...`);
    transformersClient.loadModel(
      providerConfig.model || TRANSFORMER_MODELS[0].id,
      providerConfig.device || "auto",
      providerConfig.dtype || "q4f16"
    );
  };

  const handleUnloadModel = () => {
    transformersClient.unloadModel();
  };

  const handleStopGeneration = () => {
    if (isLocalTransformer) {
      transformersClient.interrupt();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    pushDmaLog("cortex", "Geração interrompida pelo usuário.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const chunks = chunkDocument(file.name, text);
    addMemories(chunks);
    pushDmaLog("mnemos", `Arquivo "${file.name}" indexado (${chunks.length} blocos no Cofre Mnemos).`);

    if (providerConfig.neuralMemoryEnabled) {
      try {
        const vectors = await transformersClient.embedTexts(chunks.map((c) => c.content));
        chunks.forEach((c, idx) => {
          if (vectors[idx]) updateMemoryEmbedding(c.id, vectors[idx]);
        });
        pushDmaLog("mnemos", `Embeddings neurais (all-MiniLM-L6-v2) gerados para "${file.name}".`);
      } catch {
        // fallback to lexical matching
      }
    }
    e.target.value = "";
  };

  const toggleVoiceInput = () => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      pushDmaLog("lumeta", "Reconhecimento de voz não suportado neste navegador.");
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "pt-BR";
    rec.interimResults = false;
    rec.onresult = (evt: any) => {
      const transcript = evt.results?.[0]?.[0]?.transcript || "";
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    setIsListening(true);
    rec.start();
  };

  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/```[\s\S]*?```/g, " bloco de código ").replace(/[*#`>_]/g, "");
    const utter = new SpeechSynthesisUtterance(clean.slice(0, 1400));
    utter.lang = "pt-BR";
    window.speechSynthesis.speak(utter);
  };

  const exportSessionMarkdown = () => {
    if (!activeSession) return;
    const md = activeSession.messages
      .map((m) => {
        const header = m.role === "user" ? "## Usuário" : `## Ara OS 12+ (${m.providerUsed || "Transformers"})`;
        const think = m.thinking
          ? `\n> **AraThink:**\n> ${m.thinking.replace(/\n/g, "\n> ")}\n`
          : "";
        return `${header} *(${m.timestamp})*\n${think}\n${m.content}`;
      })
      .join("\n\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ara-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runInference = async (
    promptText: string,
    historyBefore: Array<{ role: "user" | "assistant"; content: string }>
  ) => {
    const trimmed = promptText.trim();
    if (trimmed === "/clear") {
      clearActiveSession();
      return;
    }
    if (trimmed === "/export") {
      exportSessionMarkdown();
      return;
    }

    if (/^\/imagine\s+/i.test(trimmed)) {
      const imgPrompt = trimmed.replace(/^\/imagine\s+/i, "").trim();
      const rendered = renderVintaProceduralImage(
        imgPrompt,
        isLight ? "sugimori-watercolor" : "aether-cyber"
      );
      const imgItem = {
        id: `img-${Date.now()}`,
        prompt: imgPrompt,
        style: (isLight ? "sugimori-watercolor" : "aether-cyber") as const,
        dataUrl: rendered.dataUrl,
        engine: "vinta-procedural-neural-canvas",
        seed: rendered.seed,
        createdAt: new Date().toISOString(),
      };
      addGeneratedImage(imgItem);
      appendMessage({
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `Imagem sintetizada pelo **Vinta Studio** para: *${imgPrompt}*`,
        timestamp: new Date().toTimeString().slice(0, 8),
        activeAgents: ["vinta", "morvat"],
        generatedImage: imgItem,
        providerUsed: "vinta-studio",
      });
      pushDmaLog("vinta", `Imagem gerada via /imagine (seed #${rendered.seed}).`);
      return;
    }

    let queryEmbedding: number[] | undefined;
    if (providerConfig.neuralMemoryEnabled && memories.length > 0) {
      try {
        const missing = memories.filter((m) => !m.embedding);
        if (missing.length > 0) {
          const vecs = await transformersClient.embedTexts(missing.map((m) => `${m.title} ${m.content}`));
          missing.forEach((m, i) => {
            if (vecs[i]) updateMemoryEmbedding(m.id, vecs[i]);
          });
        }
        const [qVec] = await transformersClient.embedTexts([trimmed]);
        queryEmbedding = qVec;
      } catch {
        // fallback to lexical search
      }
    }

    const prepared = prepareMultiAgentContext({
      prompt: trimmed,
      history: historyBefore,
      araThinkMode,
      memories: useAraStore.getState().memories,
      queryEmbedding,
      forcedAgents,
      customSystemPrompt: generationParams.systemPrompt,
    });

    if (prepared.newAutoMemory) {
      addMemories([prepared.newAutoMemory]);
      pushDmaLog("mnemos", `Memória capturada automaticamente: "${prepared.newAutoMemory.title}"`);
    }
    prepared.dmaLogs.forEach((l) => pushDmaLog(l.agent, l.text));

    setIsThinking(true, prepared.activeAgents);

    const assistantMsgId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const modelLabel = providerConfig.model || TRANSFORMER_MODELS[0].id;

    appendMessage({
      id: assistantMsgId,
      role: "assistant",
      content: "",
      thinking: "",
      isStreaming: true,
      isCurrentlyThinking: araThinkMode !== "standard",
      timestamp: new Date().toTimeString().slice(0, 8),
      activeAgents: prepared.activeAgents,
      recalledMemories: prepared.recalledMemories,
      providerUsed: `${providerConfig.provider} · ${modelLabel.split("/").pop()}`,
    });

    try {
      if (providerConfig.provider === "transformers-web") {
        setEngineStatus(loadedModelId === modelLabel ? "generating" : "loading");

        const result = await transformersClient.generate(
          {
            modelId: modelLabel,
            device: providerConfig.device || "auto",
            dtype: providerConfig.dtype || "q4f16",
            messages: prepared.messages,
            params: generationParams,
          },
          (tok) => {
            setEngineStatus("generating");
            const parsed = parseThinkStream(tok.text);
            updateMessage(assistantMsgId, {
              content: parsed.answer,
              thinking: parsed.thinking,
              isCurrentlyThinking: parsed.isCurrentlyThinking,
              isStreaming: true,
              stats: {
                tokens: tok.tokens,
                tps: tok.tps,
                device: activeDevice || "webgpu",
                modelId: modelLabel,
              },
            });
          }
        );

        const parsedFinal = parseThinkStream(result.text);
        updateMessage(assistantMsgId, {
          content: parsedFinal.answer || result.text,
          thinking: parsedFinal.thinking,
          isCurrentlyThinking: false,
          isStreaming: false,
          stats: {
            tokens: result.tokens,
            tps: result.tps,
            ttftMs: result.ttftMs,
            totalMs: result.totalMs,
            device: result.device,
            modelId: result.modelId,
          },
        });
        setEngineStatus("ready");
        pushDmaLog(
          "cortex",
          `Transformer concluiu: ${result.tokens} tokens @ ${result.tps} tok/s (${result.device.toUpperCase()}).`
        );
      } else {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: prepared.messages,
            providerConfig,
            params: {
              temperature: generationParams.temperature,
              topP: generationParams.topP,
              maxNewTokens: generationParams.maxNewTokens,
              repetitionPenalty: generationParams.repetitionPenalty,
            },
          }),
        });

        if (!res.ok || !res.body) {
          const errJson = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(errJson.error || `Falha HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let accumulated = "";
        let tokenCount = 0;
        const startTs = performance.now();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";

          for (const line of lines) {
            const tr = line.trim();
            if (!tr.startsWith("data:")) continue;
            const payloadStr = tr.slice(5).trim();
            if (!payloadStr) continue;
            try {
              const evt = JSON.parse(payloadStr);
              if (evt.error) throw new Error(evt.error);
              if (evt.token) {
                accumulated += evt.token;
                tokenCount += 1;
                const elapsedSec = Math.max(0.01, (performance.now() - startTs) / 1000);
                const parsed = parseThinkStream(accumulated);
                updateMessage(assistantMsgId, {
                  content: parsed.answer,
                  thinking: parsed.thinking,
                  isCurrentlyThinking: parsed.isCurrentlyThinking,
                  isStreaming: true,
                  stats: {
                    tokens: tokenCount,
                    tps: Number((tokenCount / elapsedSec).toFixed(1)),
                    device: providerConfig.provider,
                    modelId: modelLabel,
                  },
                });
              }
            } catch (parseErr: any) {
              if (parseErr?.message && !parseErr.message.includes("JSON")) {
                throw parseErr;
              }
            }
          }
        }

        const parsedFinal = parseThinkStream(accumulated);
        const totalMs = Math.round(performance.now() - startTs);
        updateMessage(assistantMsgId, {
          content: parsedFinal.answer || accumulated,
          thinking: parsedFinal.thinking,
          isCurrentlyThinking: false,
          isStreaming: false,
          stats: {
            tokens: tokenCount,
            tps: Number((tokenCount / Math.max(0.01, totalMs / 1000)).toFixed(1)),
            totalMs,
            device: providerConfig.provider,
            modelId: modelLabel,
          },
        });
        abortControllerRef.current = null;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        updateMessage(assistantMsgId, { isStreaming: false, isCurrentlyThinking: false });
      } else {
        updateMessage(assistantMsgId, {
          isStreaming: false,
          isCurrentlyThinking: false,
          error: err?.message || String(err),
        });
        if (isLocalTransformer) setEngineStatus("error");
        pushDmaLog("cortex", `Falha na inferência: ${err?.message || err}`);
      }
    } finally {
      setIsThinking(false, prepared.activeAgents);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt ?? input).trim();
    if (!text || isThinking) return;

    const historyBefore = (activeSession?.messages || [])
      .filter((m) => !m.error && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    appendMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toTimeString().slice(0, 8),
    });
    if (!customPrompt) setInput("");

    await runInference(text, historyBefore);
  };

  const handleRegenerate = async (assistantMsgId: string) => {
    if (isThinking || !activeSession) return;
    const idx = activeSession.messages.findIndex((m) => m.id === assistantMsgId);
    if (idx <= 0) return;

    let userIdx = idx - 1;
    while (userIdx >= 0 && activeSession.messages[userIdx].role !== "user") {
      userIdx -= 1;
    }
    if (userIdx < 0) return;

    const targetPrompt = activeSession.messages[userIdx].content;
    const historyBefore = activeSession.messages
      .slice(0, userIdx)
      .filter((m) => !m.error && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    truncateAfterMessage(activeSession.messages[userIdx].id, false);
    await runInference(targetPrompt, historyBefore);
  };

  const handleSaveEdit = async (userMsgId: string) => {
    if (!editingText.trim() || isThinking || !activeSession) return;
    const idx = activeSession.messages.findIndex((m) => m.id === userMsgId);
    if (idx === -1) return;

    const newPrompt = editingText.trim();
    const historyBefore = activeSession.messages
      .slice(0, idx)
      .filter((m) => !m.error && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    updateMessage(userMsgId, { content: newPrompt });
    truncateAfterMessage(userMsgId, false);
    setEditingId(null);
    setEditingText("");
    await runInference(newPrompt, historyBefore);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      className={`pointer-events-auto fixed left-1/2 -translate-x-1/2 z-20 flex flex-col ara-modal overflow-hidden transition-all duration-200 ${
        chatExpanded
          ? "top-[94px] bottom-[16px] w-[1120px] max-w-[96vw]"
          : "top-[102px] bottom-[170px] w-[840px] max-w-[95vw]"
      }`}
    >
      {/* Primary Console Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 ara-font text-[10px]"
        style={{
          borderBottom: "1px solid var(--ara-border-subtle)",
          backgroundColor: "var(--ara-elevated-bg)",
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessions((v) => !v)}
            className="px-2 py-0.5 ara-btn text-[9.5px]"
          >
            SESSÕES ({sessions.length})
          </button>
          <span
            className="font-bold tracking-wider truncate max-w-[180px]"
            style={{ color: "var(--ara-accent-2)" }}
          >
            {activeSession?.title || "ARA TRANSFORMERS"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div
            className="flex items-center p-0.5"
            style={{
              backgroundColor: "var(--ara-input-bg)",
              border: "1px solid var(--ara-border-subtle)",
              borderRadius: "var(--ara-radius)",
            }}
          >
            {(["standard", "arathink", "arathink-ultra"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAraThinkMode(m)}
                className={`px-2 py-0.5 text-[9px] font-bold transition-all ${
                  araThinkMode === m
                    ? m === "standard"
                      ? "ara-btn-accent2"
                      : "ara-btn-accent3"
                    : "opacity-65 hover:opacity-100"
                }`}
                style={{
                  borderRadius: "calc(var(--ara-radius) - 2px)",
                  color: araThinkMode === m ? undefined : "var(--ara-text-muted)",
                }}
              >
                {m === "standard" ? "STD" : m === "arathink" ? "ARATHINK" : "ULTRA"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowHyperparams((v) => !v)}
            className={`p-1 ${showHyperparams ? "ara-btn-accent1" : "ara-btn"}`}
            title="Hiperparâmetros de geração (Temperatura, Top-P, Max Tokens)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exportSessionMarkdown}
            className="p-1 ara-btn"
            title="Exportar conversa em Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setChatExpanded(!chatExpanded)}
            className="p-1 ara-btn"
            title={chatExpanded ? "Restaurar tamanho" : "Expandir chat"}
          >
            {chatExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button onClick={createSession} className="p-1 ara-btn" title="Nova conversa">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => togglePanel("chatConsole")} className="p-1 ara-btn" title="Minimizar">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Hugging Face Transformers Model & Status Bar */}
      <div
        className="px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2 ara-font text-[9.5px]"
        style={{
          borderBottom: "1px solid var(--ara-border-subtle)",
          backgroundColor: "var(--ara-input-bg)",
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Cpu className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--ara-accent-1)" }} />
          <select
            value={providerConfig.provider}
            onChange={(e) => {
              const p = e.target.value as any;
              updateProviderConfig({
                provider: p,
                model:
                  p === "transformers-web"
                    ? TRANSFORMER_MODELS[0].id
                    : p === "transformers-python"
                    ? "Qwen/Qwen2.5-1.5B-Instruct"
                    : p === "ollama"
                    ? "qwen2.5:7b"
                    : p === "gemini"
                    ? "gemini-2.5-flash"
                    : p === "anthropic"
                    ? "claude-3-5-sonnet-latest"
                    : "gpt-4o-mini",
              });
            }}
            className="ara-input px-2 py-0.5 text-[9.5px] font-bold"
          >
            <option value="transformers-web">Transformers.js (WebGPU/WASM)</option>
            <option value="transformers-python">PyTorch Transformers (Local)</option>
            <option value="ollama">Ollama Local</option>
            <option value="openai">OpenAI / OpenRouter / Groq</option>
            <option value="gemini">Google Gemini API</option>
            <option value="anthropic">Anthropic Claude API</option>
          </select>

          {isLocalTransformer ? (
            <select
              value={providerConfig.model}
              onChange={(e) => {
                const chosen = TRANSFORMER_MODELS.find((m) => m.id === e.target.value);
                updateProviderConfig({
                  model: e.target.value,
                  dtype: chosen?.recommendedDtype || providerConfig.dtype,
                });
              }}
              className="ara-input px-2 py-0.5 text-[9.5px] max-w-[260px]"
            >
              {TRANSFORMER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.sizeLabel} · {m.specialty})
                </option>
              ))}
              {!TRANSFORMER_MODELS.some((m) => m.id === providerConfig.model) && (
                <option value={providerConfig.model}>{providerConfig.model}</option>
              )}
            </select>
          ) : (
            <span style={{ color: "var(--ara-text-muted)" }}>
              Modelo: <strong style={{ color: "var(--ara-text)" }}>{providerConfig.model}</strong>
            </span>
          )}
        </div>

        {isLocalTransformer && (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded font-bold text-[9px]"
              style={{
                backgroundColor:
                  engineStatus === "ready" || engineStatus === "generating"
                    ? "var(--ara-accent-2-soft)"
                    : engineStatus === "error"
                    ? "rgba(239,68,68,0.18)"
                    : "var(--ara-accent-1-soft)",
                color:
                  engineStatus === "ready" || engineStatus === "generating"
                    ? "var(--ara-accent-2)"
                    : engineStatus === "error"
                    ? "#f87171"
                    : "var(--ara-accent-1)",
              }}
            >
              {engineStatus === "ready" && loadedModelId === providerConfig.model
                ? `PRONTO · ${(activeDevice || "WASM").toUpperCase()}`
                : engineStatus === "generating"
                ? `INFERINDO · ${(activeDevice || "WASM").toUpperCase()}`
                : engineStatus === "loading"
                ? `CARREGANDO ${overallDownloadPct}%`
                : engineStatus === "error"
                ? "ERRO"
                : "AUTO-LOAD AO ENVIAR"}
            </span>

            {loadedModelId === providerConfig.model && engineStatus === "ready" ? (
              <button onClick={handleUnloadModel} className="px-2 py-0.5 ara-btn text-[9px]">
                DESCARREGAR
              </button>
            ) : (
              <button
                onClick={handleLoadModel}
                disabled={engineStatus === "loading" || isThinking}
                className="px-2 py-0.5 ara-btn-accent2 text-[9px] font-bold disabled:opacity-50"
              >
                PRÉ-CARREGAR
              </button>
            )}
          </div>
        )}
      </div>

      {/* Live Weight Download Progress Bar */}
      {isLocalTransformer && engineStatus === "loading" && (
        <div
          className="px-3.5 py-2 ara-font text-[9.5px] space-y-1"
          style={{
            borderBottom: "1px solid var(--ara-border-subtle)",
            backgroundColor: "var(--ara-accent-2-soft)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold" style={{ color: "var(--ara-accent-2)" }}>
              {statusMessage || `Baixando pesos ONNX do Hugging Face Hub (${providerConfig.model})...`}
            </span>
            <span className="font-bold shrink-0">{overallDownloadPct}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--ara-input-bg)" }}
          >
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${Math.max(4, overallDownloadPct)}%`,
                backgroundColor: "var(--ara-accent-2)",
              }}
            />
          </div>
          {progressEntries.length > 0 && (
            <div className="text-[8.5px] truncate" style={{ color: "var(--ara-text-muted)" }}>
              Cache do navegador (próxima carga será instantânea):{" "}
              {progressEntries
                .slice(-2)
                .map((f) => `${f.file.split("/").pop()} (${Math.round(f.progress || 0)}%)`)
                .join(" · ")}
            </div>
          )}
        </div>
      )}

      {/* Optional Hyperparameters Panel */}
      {showHyperparams && (
        <div
          className="px-3.5 py-2.5 ara-font text-[9.5px] space-y-2.5"
          style={{
            borderBottom: "1px solid var(--ara-border-subtle)",
            backgroundColor: "var(--ara-elevated-bg)",
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="flex justify-between mb-1">
                <span style={{ color: "var(--ara-text-muted)" }}>TEMPERATURA</span>
                <span className="font-bold" style={{ color: "var(--ara-accent-1)" }}>
                  {generationParams.temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.5}
                step={0.05}
                value={generationParams.temperature}
                onChange={(e) => updateGenerationParams({ temperature: parseFloat(e.target.value) })}
                className="w-full ara-range"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span style={{ color: "var(--ara-text-muted)" }}>TOP-P</span>
                <span className="font-bold" style={{ color: "var(--ara-accent-2)" }}>
                  {generationParams.topP.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={generationParams.topP}
                onChange={(e) => updateGenerationParams({ topP: parseFloat(e.target.value) })}
                className="w-full ara-range"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span style={{ color: "var(--ara-text-muted)" }}>MAX TOKENS</span>
                <span className="font-bold" style={{ color: "var(--ara-accent-3)" }}>
                  {generationParams.maxNewTokens}
                </span>
              </div>
              <input
                type="range"
                min={128}
                max={4096}
                step={128}
                value={generationParams.maxNewTokens}
                onChange={(e) => updateGenerationParams({ maxNewTokens: parseInt(e.target.value, 10) })}
                className="w-full ara-range"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span style={{ color: "var(--ara-text-muted)" }}>REP. PENALTY</span>
                <span className="font-bold" style={{ color: "var(--ara-accent-1)" }}>
                  {generationParams.repetitionPenalty.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={1.4}
                step={0.02}
                value={generationParams.repetitionPenalty}
                onChange={(e) =>
                  updateGenerationParams({ repetitionPenalty: parseFloat(e.target.value) })
                }
                className="w-full ara-range"
              />
            </div>
          </div>

          <input
            type="text"
            value={generationParams.systemPrompt}
            onChange={(e) => updateGenerationParams({ systemPrompt: e.target.value })}
            placeholder="Instrução de sistema personalizada (opcional — injetada junto com os 10 agentes)..."
            className="w-full ara-input px-2.5 py-1 text-[10px]"
          />
        </div>
      )}

      {/* Optional Sessions Drawer */}
      {showSessions && (
        <div
          className="px-3 py-2 flex items-center gap-2 overflow-x-auto ara-font text-[10px]"
          style={{
            borderBottom: "1px solid var(--ara-border-subtle)",
            backgroundColor: "var(--ara-input-bg)",
          }}
        >
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 shrink-0 cursor-pointer ${
                s.id === activeSessionId ? "ara-btn-accent2 font-bold" : "ara-btn"
              }`}
              onClick={() => {
                selectSession(s.id);
                setShowSessions(false);
              }}
            >
              <span className="truncate max-w-[140px]">{s.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                className="opacity-60 hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {(activeSession?.messages || []).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-4">
            <div
              className="px-3 py-1 ara-font text-[10px] font-bold tracking-widest flex items-center gap-1.5"
              style={{
                borderRadius: "999px",
                backgroundColor: "var(--ara-accent-1-soft)",
                color: "var(--ara-accent-1)",
                border: "1px solid var(--ara-accent-1-border)",
              }}
            >
              <Zap className="w-3 h-3" /> ARA OS 12+ v3 // HUGGING FACE TRANSFORMERS
            </div>
            <h2 className="text-lg font-bold tracking-wide">
              Chatbot Neural Real — Sem Respostas Automáticas
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: "var(--ara-text-muted)" }}>
              Cada resposta é gerada token por token pelo modelo Transformer real (
              <strong>{providerConfig.model.split("/").pop()}</strong>) rodando diretamente no seu navegador via{" "}
              <strong>WebGPU/WASM</strong> ou conectado ao servidor PyTorch / Ollama / APIs, orquestrado pelos 10 agentes{" "}
              <code>allyxzs/*</code>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1 ara-font text-[10.5px]">
              {[
                "Explique como funciona a atenção multi-cabeça em Transformers",
                "Crie um site landing page futurista em HTML completo com animações CSS",
                "Resolva passo a passo a integral de x^2 + 3x de 0 ate 5",
                "Escreva um algoritmo A* pathfinding otimizado em TypeScript",
              ].map((starter) => (
                <button
                  key={starter}
                  onClick={() => handleSend(starter)}
                  className="p-2.5 text-left ara-card hover:border-[var(--ara-accent-2)] transition-all leading-snug"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          (activeSession?.messages || []).map((msg) => {
            const traceOpen =
              expandedTraces[msg.id] ?? Boolean(msg.isCurrentlyThinking);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {msg.role === "assistant" && msg.activeAgents && msg.activeAgents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-1.5 ara-font text-[9px]">
                    {msg.activeAgents.map((aid) => {
                      const ag = AGENT_REGISTRY[aid];
                      if (!ag) return null;
                      return (
                        <span
                          key={aid}
                          className="px-1.5 py-0.5 border font-semibold"
                          style={{
                            borderRadius: "var(--ara-radius)",
                            borderColor: hexToRgba(ag.color, 0.5),
                            backgroundColor: hexToRgba(ag.color, isLight ? 0.12 : 0.16),
                            color: ag.color,
                          }}
                        >
                          {ag.name}
                        </span>
                      );
                    })}
                    {msg.recalledMemories && msg.recalledMemories.length > 0 && (
                      <span className="px-1.5 py-0.5 ara-btn-accent2 flex items-center gap-1">
                        <Database className="w-2.5 h-2.5" />
                        {msg.recalledMemories.length} memória(s)
                      </span>
                    )}
                  </div>
                )}

                {msg.role === "assistant" && (msg.thinking || msg.isCurrentlyThinking) && (
                  <div
                    className="w-full max-w-[94%] mb-2 ara-font text-[10.5px] overflow-hidden"
                    style={{
                      borderRadius: "var(--ara-radius)",
                      border: "1px solid var(--ara-accent-3-border)",
                      backgroundColor: "var(--ara-accent-3-soft)",
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedTraces((prev) => ({ ...prev, [msg.id]: !traceOpen }))
                      }
                      className="w-full flex items-center justify-between px-3 py-1.5 font-semibold"
                      style={{ color: "var(--ara-accent-3)" }}
                    >
                      <span className="flex items-center gap-1.5">
                        <Brain
                          className={`w-3.5 h-3.5 ${msg.isCurrentlyThinking ? "animate-pulse" : ""}`}
                        />
                        <span>
                          {msg.isCurrentlyThinking
                            ? "ARATHINK // RACIOCINANDO EM TEMPO REAL..."
                            : "ARATHINK // CADEIA DE PENSAMENTO NEURAL"}
                        </span>
                      </span>
                      {traceOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {traceOpen && (
                      <div
                        className="px-3 pb-2.5 pt-1.5 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto"
                        style={{
                          borderTop: "1px solid var(--ara-accent-3-border)",
                          color: "var(--ara-text)",
                        }}
                      >
                        {msg.thinking || "Iniciando cadeia de raciocínio..."}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="max-w-[94%] px-3.5 py-2.5 border"
                  style={{
                    borderRadius: "calc(var(--ara-radius) + 2px)",
                    backgroundColor:
                      msg.role === "user" ? "var(--ara-accent-1-soft)" : "var(--ara-elevated-bg)",
                    borderColor: msg.error
                      ? "rgba(239,68,68,0.55)"
                      : msg.role === "user"
                      ? "var(--ara-accent-1-border)"
                      : "var(--ara-border-subtle)",
                    color: "var(--ara-text)",
                  }}
                >
                  {editingId === msg.id ? (
                    <div className="space-y-2 min-w-[280px]">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={3}
                        className="w-full ara-input p-2 text-xs"
                      />
                      <div className="flex justify-end gap-1.5 ara-font text-[10px]">
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 ara-btn">
                          CANCELAR
                        </button>
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-2.5 py-1 ara-btn-primary font-bold"
                        >
                          REENVIAR
                        </button>
                      </div>
                    </div>
                  ) : msg.error ? (
                    <div className="flex items-start gap-2 text-xs text-red-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Falha na inferência neural</div>
                        <div className="mt-0.5 opacity-90">{msg.error}</div>
                      </div>
                    </div>
                  ) : msg.role === "assistant" ? (
                    <>
                      {msg.content ? (
                        <MarkdownRenderer
                          content={msg.content}
                          onOpenHtmlPreview={(html, title) => openWebPreview(html, title)}
                        />
                      ) : msg.isStreaming ? (
                        <span className="ara-font text-xs animate-pulse" style={{ color: "var(--ara-text-muted)" }}>
                          Gerando tokens no modelo Transformer...
                        </span>
                      ) : null}

                      {msg.isStreaming && (
                        <span
                          className="inline-block w-2 h-3.5 ml-1 align-middle animate-pulse"
                          style={{ backgroundColor: "var(--ara-accent-2)" }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  )}

                  {msg.generatedImage && (
                    <div
                      className="mt-3 overflow-hidden border"
                      style={{
                        borderRadius: "var(--ara-radius)",
                        borderColor: "var(--ara-accent-3-border)",
                        backgroundColor: "var(--ara-input-bg)",
                      }}
                    >
                      <img
                        src={msg.generatedImage.dataUrl}
                        alt={msg.generatedImage.prompt}
                        className="w-full max-w-[360px] h-auto object-cover"
                      />
                      <div className="p-2 flex items-center justify-between ara-font text-[9.5px]">
                        <span className="truncate max-w-[220px]" style={{ color: "var(--ara-text-muted)" }}>
                          VINTA SEED #{msg.generatedImage.seed}
                        </span>
                        <a
                          href={msg.generatedImage.dataUrl}
                          download={`ara-vinta-${msg.generatedImage.seed}.png`}
                          className="flex items-center gap-1 font-bold"
                          style={{ color: "var(--ara-accent-2)" }}
                        >
                          <Download className="w-3 h-3" />
                          BAIXAR PNG
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-2 mt-1 ara-font text-[9px]"
                  style={{ color: "var(--ara-text-muted)" }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.stats && msg.stats.tokens > 0 && (
                    <span style={{ color: "var(--ara-accent-2)" }}>
                      · {msg.stats.tokens} tok @ {msg.stats.tps} tok/s
                      {msg.stats.device ? ` (${msg.stats.device.toUpperCase()})` : ""}
                    </span>
                  )}

                  {!msg.isStreaming && msg.content && (
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-0.5 hover:opacity-100 opacity-70"
                        title="Copiar mensagem"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3" style={{ color: "var(--ara-accent-2)" }} />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {msg.role === "assistant" && (
                        <>
                          <button
                            onClick={() => handleRegenerate(msg.id)}
                            disabled={isThinking}
                            className="p-0.5 hover:opacity-100 opacity-70 disabled:opacity-30"
                            title="Regenerar resposta"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => speakMessage(msg.content)}
                            className="p-0.5 hover:opacity-100 opacity-70"
                            title="Ler resposta em voz alta"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      {msg.role === "user" && (
                        <button
                          onClick={() => {
                            setEditingId(msg.id);
                            setEditingText(msg.content);
                          }}
                          disabled={isThinking}
                          className="p-0.5 hover:opacity-100 opacity-70 disabled:opacity-30"
                          title="Editar e reenviar"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={isThinking}
                        className="p-0.5 hover:opacity-100 opacity-70 disabled:opacity-30"
                        title="Excluir mensagem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <div
        className="p-2.5 flex items-center gap-2"
        style={{
          borderTop: "1px solid var(--ara-border-subtle)",
          backgroundColor: "var(--ara-bar-bg)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.py,.html,.css"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 ara-btn"
          title="Enviar arquivo/dados para Memória Mnemos"
        >
          <Paperclip className="w-4 h-4" style={{ color: "var(--ara-accent-2)" }} />
        </button>

        <button
          onClick={toggleVoiceInput}
          className={`p-2 ${isListening ? "ara-btn-accent1 animate-pulse" : "ara-btn"}`}
          title="Ditar mensagem por voz (PT-BR)"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setInput((prev) => (prev.startsWith("/imagine") ? prev : `/imagine ${prev}`))}
          className="p-2 ara-btn"
          title="Gerar imagem via Vinta Studio (/imagine)"
        >
          <Sparkles className="w-4 h-4" style={{ color: "var(--ara-accent-3)" }} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Converse com o Transformer neural, peça códigos, sites, matemática ou /imagine..."
          className="flex-1 ara-input px-3 py-2 text-xs ara-font"
        />

        {isThinking ? (
          <button
            onClick={handleStopGeneration}
            className="px-3.5 py-2 ara-btn-accent1 ara-font text-xs font-bold flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5" />
            <span>PARAR</span>
          </button>
        ) : (
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-3.5 py-2 ara-btn-primary ara-font text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ENVIAR</span>
          </button>
        )}
      </div>
    </div>
  );
};
