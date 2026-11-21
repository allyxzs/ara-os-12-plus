# ARA OS 12+ v3 // Transformers Neural Multi-Agent OS

Sistema operacional de IA multi-agente (10 repositórios `allyxzs/*`) com **Chatbot Neural 100% movido por Hugging Face Transformers** (`@huggingface/transformers` v3 via **WebGPU / WebAssembly** em Web Worker dedicado + servidor opcional **PyTorch Transformers**), **ZERO respostas automáticas/hardcoded**, **Modo Claro/Escuro**, **Motor Global de Cores** e **Vórtice 3D WebGL opcional**.

---

## Novidades da Atualização v3 (Transformers & Chatbot Máximo)

- **100% Livre de Respostas Automáticas:** removido completamente o antigo fallback estático. Toda resposta é inferida token por token por um modelo **Transformer** real.
- **Hugging Face Transformers.js v3 no Navegador (`WebGPU` + fallback automático `WASM`):** executa modelos reais de pesos abertos em um Web Worker sem travar a interface 3D, com barra de progresso em tempo real e cache persistente no navegador:
  - `onnx-community/Qwen2.5-0.5B-Instruct` (~380 MB — ultra-rápido, ótimo em Português)
  - `onnx-community/Qwen2.5-1.5B-Instruct` (~1.0 GB — equilibrado, alta inteligência geral)
  - `onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX` (~1.1 GB — **AraThink nativo `<think>`**)
  - `onnx-community/Qwen2.5-Coder-1.5B-Instruct` (~1.0 GB — especialista em algoritmos, código e sites)
  - `HuggingFaceTB/SmolLM2-360M-Instruct` (~240 MB — ultra-leve para CPU/WASM)
  - `HuggingFaceTB/SmolLM2-1.7B-Instruct` (~1.1 GB — conversação e criatividade)
  - Suporte a **qualquer ID de repositório ONNX customizado** do Hugging Face Hub.
- **AraThink Real (`<think>...</think>`):** parseia ao vivo a cadeia de pensamento gerada pelo modelo Transformer enquanto os tokens chegam.
- **Embeddings Neurais no Mnemos:** busca vetorial por similaridade de cosseno usando `Xenova/all-MiniLM-L6-v2` (ativável em *Personalizar → IA / API*).
- **Recursos Avançados de Chat:**
  - Streaming real token-a-token com telemetria (**tokens**, **tok/s**, **TTFT**, **WebGPU/WASM**) e botão **PARAR** (`InterruptableStoppingCriteria`)
  - Renderizador Markdown completo com blocos de código, **Copiar**, **Baixar arquivo** e botão automático **PREVIEW AO VIVO** para sites HTML gerados pelo Transformer
  - **Regenerar**, **Editar & Reenviar**, **Excluir**, **Exportar `.md`**, **Entrada por Voz (PT-BR)**, **Leitura em Voz Alta (TTS)** e painel de hiperparâmetros (**Temperatura**, **Top-P**, **Max Tokens**, **Repetition Penalty**, **System Prompt**)
- **Servidor Opcional PyTorch Transformers (`backend-python/server.py`):** rode modelos PyTorch Hugging Face completos com CUDA/CPU via FastAPI SSE no Kali Linux.
- **Ponte Multi-Provedor:** também suporta **Ollama Local**, **OpenAI / OpenRouter / Groq**, **Google Gemini** e **Anthropic Claude** com streaming SSE real.

---

## Como Executar

### 1. Projeto Full-Stack Next.js 15 + Transformers.js (Recomendado)
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`. Na primeira mensagem (ou clicando em **PRÉ-CARREGAR**), o modelo Transformer escolhido é baixado do Hugging Face Hub para o cache local do navegador e passa a responder localmente.

### 2. Servidor Opcional PyTorch Hugging Face Transformers (Python)
```bash
cd backend-python
pip install -r requirements.txt
python3 server.py
```
Depois, no Ara OS 12+, selecione **PyTorch Transformers (Local)** no seletor de motor do chat.

### 3. Preview Instantâneo 1-Arquivo
Sirva `standalone/ara-os-12-plus.html` com `python3 -m http.server 8080` e abra no navegador para rodar `@huggingface/transformers` v3 diretamente via CDN sem `npm install`.
