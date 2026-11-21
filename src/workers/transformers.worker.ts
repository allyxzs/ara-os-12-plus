/// <reference lib="webworker" />

import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
  pipeline,
  env,
} from "@huggingface/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

let tokenizer: any = null;
let model: any = null;
let loadedModelId: string | null = null;
let activeDevice: "webgpu" | "wasm" = "wasm";
let stoppingCriteria = new InterruptableStoppingCriteria();
let embedder: any = null;

async function detectDevice(preferred: "auto" | "webgpu" | "wasm"): Promise<"webgpu" | "wasm"> {
  if (preferred === "wasm") return "wasm";
  try {
    const nav = self.navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } };
    if (nav?.gpu) {
      const adapter = await nav.gpu.requestAdapter();
      if (adapter) return "webgpu";
    }
  } catch {
    // Fallback to WASM
  }
  return "wasm";
}

async function loadModel(modelId: string, preferredDevice: "auto" | "webgpu" | "wasm", preferredDtype: string) {
  if (loadedModelId === modelId && tokenizer && model) {
    self.postMessage({
      type: "ready",
      modelId,
      device: activeDevice,
    });
    return;
  }

  if (model && typeof model.dispose === "function") {
    try {
      await model.dispose();
    } catch {
      // ignore dispose errors
    }
  }
  model = null;
  tokenizer = null;
  loadedModelId = null;

  const device = await detectDevice(preferredDevice);
  activeDevice = device;

  const effectiveDtype =
    device === "wasm" && (preferredDtype === "q4f16" || preferredDtype === "fp16")
      ? "q4"
      : preferredDtype || (device === "webgpu" ? "q4f16" : "q4");

  self.postMessage({
    type: "status",
    status: "loading",
    message: `Inicializando Transformer ${modelId} (${device.toUpperCase()} · ${effectiveDtype})...`,
    device,
  });

  const progress_callback = (info: any) => {
    self.postMessage({
      type: "progress",
      file: info.file || "",
      status: info.status || "progress",
      progress: typeof info.progress === "number" ? info.progress : 0,
      loaded: info.loaded,
      total: info.total,
    });
  };

  tokenizer = await AutoTokenizer.from_pretrained(modelId, { progress_callback });

  try {
    model = await AutoModelForCausalLM.from_pretrained(modelId, {
      dtype: effectiveDtype as any,
      device,
      progress_callback,
    });
  } catch (err) {
    if (device === "webgpu") {
      activeDevice = "wasm";
      self.postMessage({
        type: "status",
        status: "loading",
        message: "WebGPU indisponível para este modelo — alternando automaticamente para WASM (q4)...",
        device: "wasm",
      });
      model = await AutoModelForCausalLM.from_pretrained(modelId, {
        dtype: "q4" as any,
        device: "wasm",
        progress_callback,
      });
    } else {
      throw err;
    }
  }

  loadedModelId = modelId;
  self.postMessage({
    type: "ready",
    modelId,
    device: activeDevice,
  });
}

async function generateReply(payload: {
  requestId: string;
  modelId: string;
  device: "auto" | "webgpu" | "wasm";
  dtype: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  params: {
    temperature: number;
    topP: number;
    maxNewTokens: number;
    repetitionPenalty: number;
  };
}) {
  const { requestId, modelId, device, dtype, messages, params } = payload;

  if (!model || !tokenizer || loadedModelId !== modelId) {
    await loadModel(modelId, device, dtype);
  }

  stoppingCriteria = new InterruptableStoppingCriteria();

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  let startTime: number | null = null;
  let firstTokenTime: number | null = null;
  let numTokens = 0;
  let accumulated = "";

  const token_callback_function = () => {
    const now = performance.now();
    if (startTime === null) {
      startTime = now;
      firstTokenTime = now;
    }
    numTokens += 1;
  };

  const callback_function = (chunk: string) => {
    accumulated += chunk;
    const now = performance.now();
    const elapsedSec = startTime ? Math.max(0.001, (now - startTime) / 1000) : 0.001;
    const tps = numTokens / elapsedSec;
    self.postMessage({
      type: "token",
      requestId,
      chunk,
      text: accumulated,
      tokens: numTokens,
      tps: Number(tps.toFixed(1)),
    });
  };

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  const genStart = performance.now();

  await model.generate({
    ...inputs,
    max_new_tokens: params.maxNewTokens || 1024,
    do_sample: (params.temperature ?? 0.65) > 0.05,
    temperature: Math.max(0.05, params.temperature ?? 0.65),
    top_p: params.topP ?? 0.9,
    repetition_penalty: params.repetitionPenalty ?? 1.12,
    streamer,
    stopping_criteria: stoppingCriteria,
  });

  const totalMs = Math.round(performance.now() - genStart);
  const ttftMs = firstTokenTime ? Math.round(firstTokenTime - genStart) : totalMs;
  const tps = startTime
    ? Number((numTokens / Math.max(0.001, (performance.now() - startTime) / 1000)).toFixed(1))
    : 0;

  self.postMessage({
    type: "complete",
    requestId,
    text: accumulated,
    tokens: numTokens,
    tps,
    ttftMs,
    totalMs,
    device: activeDevice,
    modelId: loadedModelId,
  });
}

async function computeEmbeddings(requestId: string, texts: string[], embeddingModel: string) {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", embeddingModel, {
      dtype: "q8" as any,
    });
  }
  const vectors: number[][] = [];
  for (const t of texts) {
    const out = await embedder(t.slice(0, 600), { pooling: "mean", normalize: true });
    vectors.push(Array.from(out.data as Float32Array));
  }
  self.postMessage({
    type: "embeddings",
    requestId,
    vectors,
  });
}

self.addEventListener("message", async (event: MessageEvent) => {
  const data = event.data;
  try {
    if (data.type === "load") {
      await loadModel(data.modelId, data.device || "auto", data.dtype || "q4f16");
    } else if (data.type === "generate") {
      await generateReply(data);
    } else if (data.type === "interrupt") {
      stoppingCriteria.interrupt();
    } else if (data.type === "unload") {
      if (model && typeof model.dispose === "function") {
        await model.dispose();
      }
      model = null;
      tokenizer = null;
      loadedModelId = null;
      self.postMessage({ type: "unloaded" });
    } else if (data.type === "embed") {
      await computeEmbeddings(data.requestId, data.texts, data.embeddingModel);
    }
  } catch (err: any) {
    self.postMessage({
      type: "error",
      requestId: data.requestId,
      error: err?.message || String(err),
    });
  }
});
