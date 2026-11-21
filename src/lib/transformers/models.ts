export type TransformerDtype = "q4f16" | "q4" | "q8" | "fp16";
export type TransformerDevice = "auto" | "webgpu" | "wasm";

export interface TransformerModelSpec {
  id: string;
  label: string;
  sizeLabel: string;
  params: string;
  specialty: string;
  recommendedDtype: TransformerDtype;
  nativeThinkTags?: boolean;
  description: string;
}

export interface GenerationParams {
  temperature: number;
  topP: number;
  maxNewTokens: number;
  repetitionPenalty: number;
  systemPrompt: string;
}

export interface ModelLoadProgress {
  file: string;
  status: string;
  progress: number;
  loaded?: number;
  total?: number;
}

export type TransformerEngineStatus =
  | "idle"
  | "loading"
  | "ready"
  | "generating"
  | "error";

export const TRANSFORMER_MODELS: TransformerModelSpec[] = [
  {
    id: "onnx-community/Qwen2.5-0.5B-Instruct",
    label: "Qwen 2.5 0.5B Instruct",
    sizeLabel: "~380 MB",
    params: "0.5B",
    specialty: "Rápido · PT-BR & Geral",
    recommendedDtype: "q4f16",
    description:
      "Modelo Transformer ultra-rápido da família Qwen2.5. Carrega em segundos no navegador com ótimo suporte a Português, código e raciocínio.",
  },
  {
    id: "onnx-community/Qwen2.5-1.5B-Instruct",
    label: "Qwen 2.5 1.5B Instruct",
    sizeLabel: "~1.0 GB",
    params: "1.5B",
    specialty: "Alta Inteligência · Equilibrado",
    recommendedDtype: "q4f16",
    description:
      "Qualidade superior em conversação avançada, explicações técnicas, matemática e criação estruturada em Português.",
  },
  {
    id: "onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX",
    label: "DeepSeek-R1 Distill Qwen 1.5B",
    sizeLabel: "~1.1 GB",
    params: "1.5B",
    specialty: "AraThink Nativo (<think>)",
    recommendedDtype: "q4f16",
    nativeThinkTags: true,
    description:
      "Modelo de raciocínio profundo destilado do DeepSeek-R1. Gera cadeia de pensamento real <think>...</think> antes da resposta final.",
  },
  {
    id: "onnx-community/Qwen2.5-Coder-1.5B-Instruct",
    label: "Qwen 2.5 Coder 1.5B Instruct",
    sizeLabel: "~1.0 GB",
    params: "1.5B",
    specialty: "Kernelis & Lumeta · Código/Sites",
    recommendedDtype: "q4f16",
    description:
      "Especializado em algoritmos, TypeScript, Python, Rust, SQL e geração completa de sites HTML/CSS/JS com Preview Ao Vivo.",
  },
  {
    id: "HuggingFaceTB/SmolLM2-360M-Instruct",
    label: "SmolLM2 360M Instruct",
    sizeLabel: "~240 MB",
    params: "360M",
    specialty: "Ultra-Leve · CPU/WASM",
    recommendedDtype: "q4",
    description:
      "Ideal para dispositivos sem WebGPU ou com pouca RAM. Executa suavemente via WebAssembly (WASM).",
  },
  {
    id: "HuggingFaceTB/SmolLM2-1.7B-Instruct",
    label: "SmolLM2 1.7B Instruct",
    sizeLabel: "~1.1 GB",
    params: "1.7B",
    specialty: "Conversação & Criatividade",
    recommendedDtype: "q4f16",
    description:
      "Transformer da Hugging Face TB com forte fluência conversacional e síntese criativa.",
  },
];

export const MNEMOS_EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  temperature: 0.65,
  topP: 0.9,
  maxNewTokens: 1024,
  repetitionPenalty: 1.12,
  systemPrompt: "",
};
