import { TransformerDevice, TransformerDtype } from "@/lib/transformers/models";

export type ProviderType =
  | "transformers-web"
  | "transformers-python"
  | "ollama"
  | "openai"
  | "gemini"
  | "anthropic";

export interface ProviderConfig {
  provider: ProviderType;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  device?: TransformerDevice;
  dtype?: TransformerDtype;
  neuralMemoryEnabled?: boolean;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamCallbacks {
  onToken: (chunk: string) => void;
}

export async function streamExternalProvider(
  config: ProviderConfig,
  messages: LlmMessage[],
  params: { temperature: number; topP: number; maxNewTokens: number; repetitionPenalty: number },
  callbacks: StreamCallbacks
): Promise<string> {
  const temperature = params.temperature ?? 0.65;
  const maxTokens = params.maxNewTokens ?? 1024;

  if (config.provider === "transformers-python") {
    const base = (
      config.baseUrl ||
      process.env.TRANSFORMERS_PYTHON_URL ||
      "http://localhost:8000"
    ).replace(/\/$/, "");

    const res = await fetch(`${base}/v1/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model || "Qwen/Qwen2.5-1.5B-Instruct",
        messages,
        temperature,
        top_p: params.topP ?? 0.9,
        max_new_tokens: maxTokens,
        repetition_penalty: params.repetitionPenalty ?? 1.12,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(
        `Servidor PyTorch Transformers (${base}) indisponível (HTTP ${res.status}). Inicie com: python3 backend-python/server.py`
      );
    }

    return await readSseStream(res.body, (json) => json.token || json.delta || "", callbacks);
  }

  if (config.provider === "ollama") {
    const base = (config.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
    const model = config.model || process.env.OLLAMA_MODEL || "qwen2.5:7b";
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: {
          temperature,
          top_p: params.topP ?? 0.9,
          num_predict: maxTokens,
          repeat_penalty: params.repetitionPenalty ?? 1.12,
        },
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Ollama (${base}) retornou erro HTTP ${res.status}. Verifique se o serviço está ativo e o modelo "${model}" baixado.`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const chunk = parsed?.message?.content || "";
          if (chunk) {
            full += chunk;
            callbacks.onToken(chunk);
          }
        } catch {
          // ignore partial JSON line
        }
      }
    }
    return full;
  }

  if (config.provider === "openai") {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Configure sua OPENAI_API_KEY em Personalizar → IA / API ou no arquivo .env.local.");
    }
    const base = (config.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = config.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        top_p: params.topP ?? 0.9,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Provedor OpenAI-compatível retornou HTTP ${res.status}: ${errTxt.slice(0, 180)}`);
    }

    return await readSseStream(
      res.body,
      (json) => json?.choices?.[0]?.delta?.content || "",
      callbacks
    );
  }

  if (config.provider === "gemini") {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Configure sua GEMINI_API_KEY em Personalizar → IA / API ou no arquivo .env.local.");
    }
    const model = config.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const systemPrompt = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents,
          generationConfig: {
            temperature,
            topP: params.topP ?? 0.9,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!res.ok || !res.body) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Gemini API retornou HTTP ${res.status}: ${errTxt.slice(0, 180)}`);
    }

    return await readSseStream(
      res.body,
      (json) => json?.candidates?.[0]?.content?.parts?.[0]?.text || "",
      callbacks
    );
  }

  if (config.provider === "anthropic") {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Configure sua ANTHROPIC_API_KEY em Personalizar → IA / API ou no arquivo .env.local.");
    }
    const model = config.model || process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n");
    const filtered = messages.filter((m) => m.role !== "system");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: filtered,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`Anthropic API retornou HTTP ${res.status}: ${errTxt.slice(0, 180)}`);
    }

    return await readSseStream(
      res.body,
      (json) => (json?.type === "content_block_delta" ? json?.delta?.text || "" : ""),
      callbacks
    );
  }

  throw new Error(`Provedor "${config.provider}" deve ser executado localmente via Transformers.js no navegador.`);
}

async function readSseStream(
  body: ReadableStream<Uint8Array>,
  extractChunk: (parsed: any) => string,
  callbacks: StreamCallbacks
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const dataStr = trimmed.slice(5).trim();
      if (!dataStr || dataStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(dataStr);
        const chunk = extractChunk(parsed);
        if (chunk) {
          full += chunk;
          callbacks.onToken(chunk);
        }
      } catch {
        // ignore keep-alive frames
      }
    }
  }
  return full;
}
