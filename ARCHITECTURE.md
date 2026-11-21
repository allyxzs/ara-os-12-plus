# Arquitetura Técnica — ARA OS 12+ v3 (Transformers Edition)

## Módulos Transformers & Chatbot (v3)

- `src/lib/transformers/models.ts` — Catálogo de modelos ONNX do Hugging Face Hub, modelo de embeddings `Xenova/all-MiniLM-L6-v2` e tipos de hiperparâmetros.
- `src/workers/transformers.worker.ts` — Web Worker dedicado executando `@huggingface/transformers` v3 (`AutoTokenizer`, `AutoModelForCausalLM`, `TextStreamer`, `InterruptableStoppingCriteria`, `pipeline`) com detecção automática WebGPU → WASM e cálculo de embeddings neurais.
- `src/lib/transformers/client.ts` — Controlador singleton no cliente para carregamento, streaming token-a-token, interrupção instantânea, descarga de VRAM e embeddings.
- `src/lib/agents/prompt-builder.ts` — Engenharia de prompt multi-agente (10 agentes `allyxzs/*`), injeção de memória Mnemos e verificação numérica Veritas, além do parser de streaming `<think>...</think>`.
- `src/components/workspace/MarkdownRenderer.tsx` — Renderizador Markdown rico com blocos de código, cópia/download e preview ao vivo automático de HTML.
- `src/components/workspace/ChatConsole.tsx` — Console completo com barra de modelo/progresso, streaming ao vivo, TPS, parada instantânea, regeneração, edição, voz PT-BR, TTS e hiperparâmetros.
- `src/app/api/chat/route.ts` — Streaming SSE real para provedores externos (`transformers-python`, `ollama`, `openai`, `gemini`, `anthropic`).
- `backend-python/server.py` — Servidor FastAPI + PyTorch `transformers` (`TextIteratorStreamer`) pronto para CUDA/CPU.
