"use client";

import {
  GenerationParams,
  MNEMOS_EMBEDDING_MODEL,
  ModelLoadProgress,
  TransformerDevice,
  TransformerDtype,
} from "./models";

export interface StreamTokenEvent {
  chunk: string;
  text: string;
  tokens: number;
  tps: number;
}

export interface GenerationCompleteEvent {
  text: string;
  tokens: number;
  tps: number;
  ttftMs: number;
  totalMs: number;
  device: "webgpu" | "wasm";
  modelId: string;
}

type StatusListener = (evt: {
  type: "status" | "progress" | "ready" | "unloaded" | "error";
  payload: any;
}) => void;

class TransformersBrowserClient {
  private worker: Worker | null = null;
  private listeners = new Set<StatusListener>();
  private activeGen: {
    requestId: string;
    onToken: (evt: StreamTokenEvent) => void;
    resolve: (evt: GenerationCompleteEvent) => void;
    reject: (err: Error) => void;
  } | null = null;

  private pendingEmbeds = new Map<
    string,
    { resolve: (vectors: number[][]) => void; reject: (err: Error) => void }
  >();

  private ensureWorker(): Worker {
    if (typeof window === "undefined") {
      throw new Error("Transformers.js Web Worker só executa no navegador.");
    }
    if (!this.worker) {
      this.worker = new Worker(
        new URL("../../workers/transformers.worker.ts", import.meta.url),
        { type: "module" }
      );
      this.worker.addEventListener("message", this.handleMessage);
      this.worker.addEventListener("error", (err) => {
        this.emit("error", { error: err.message || "Falha no Web Worker Transformers" });
      });
    }
    return this.worker;
  }

  private emit(type: "status" | "progress" | "ready" | "unloaded" | "error", payload: any) {
    this.listeners.forEach((fn) => fn({ type, payload }));
  }

  private handleMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data) return;

    if (data.type === "status") {
      this.emit("status", data);
    } else if (data.type === "progress") {
      this.emit("progress", data as ModelLoadProgress);
    } else if (data.type === "ready") {
      this.emit("ready", data);
    } else if (data.type === "unloaded") {
      this.emit("unloaded", data);
    } else if (data.type === "token" && this.activeGen && data.requestId === this.activeGen.requestId) {
      this.activeGen.onToken({
        chunk: data.chunk,
        text: data.text,
        tokens: data.tokens,
        tps: data.tps,
      });
    } else if (data.type === "complete" && this.activeGen && data.requestId === this.activeGen.requestId) {
      const done = this.activeGen;
      this.activeGen = null;
      done.resolve({
        text: data.text,
        tokens: data.tokens,
        tps: data.tps,
        ttftMs: data.ttftMs,
        totalMs: data.totalMs,
        device: data.device,
        modelId: data.modelId,
      });
    } else if (data.type === "embeddings" && this.pendingEmbeds.has(data.requestId)) {
      const req = this.pendingEmbeds.get(data.requestId)!;
      this.pendingEmbeds.delete(data.requestId);
      req.resolve(data.vectors);
    } else if (data.type === "error") {
      this.emit("error", data);
      if (this.activeGen && (!data.requestId || data.requestId === this.activeGen.requestId)) {
        const fail = this.activeGen;
        this.activeGen = null;
        fail.reject(new Error(data.error || "Erro desconhecido no modelo Transformer."));
      }
      if (data.requestId && this.pendingEmbeds.has(data.requestId)) {
        const failEmb = this.pendingEmbeds.get(data.requestId)!;
        this.pendingEmbeds.delete(data.requestId);
        failEmb.reject(new Error(data.error || "Erro ao calcular embeddings."));
      }
    }
  };

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  loadModel(modelId: string, device: TransformerDevice = "auto", dtype: TransformerDtype = "q4f16") {
    const worker = this.ensureWorker();
    worker.postMessage({ type: "load", modelId, device, dtype });
  }

  unloadModel() {
    if (!this.worker) return;
    this.worker.postMessage({ type: "unload" });
  }

  interrupt() {
    if (!this.worker) return;
    this.worker.postMessage({ type: "interrupt" });
  }

  generate(
    options: {
      modelId: string;
      device: TransformerDevice;
      dtype: TransformerDtype;
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      params: GenerationParams;
    },
    onToken: (evt: StreamTokenEvent) => void
  ): Promise<GenerationCompleteEvent> {
    const worker = this.ensureWorker();
    const requestId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return new Promise((resolve, reject) => {
      this.activeGen = { requestId, onToken, resolve, reject };
      worker.postMessage({
        type: "generate",
        requestId,
        modelId: options.modelId,
        device: options.device,
        dtype: options.dtype,
        messages: options.messages,
        params: options.params,
      });
    });
  }

  embedTexts(texts: string[], embeddingModel = MNEMOS_EMBEDDING_MODEL): Promise<number[][]> {
    const worker = this.ensureWorker();
    const requestId = `emb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return new Promise((resolve, reject) => {
      this.pendingEmbeds.set(requestId, { resolve, reject });
      worker.postMessage({
        type: "embed",
        requestId,
        texts,
        embeddingModel,
      });
    });
  }
}

export const transformersClient = new TransformersBrowserClient();
