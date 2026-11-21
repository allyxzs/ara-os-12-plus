export type AgentId =
  | "archon"
  | "cortex"
  | "mnemos"
  | "noetra"
  | "veritas"
  | "kernelis"
  | "vinta"
  | "lumeta"
  | "janus"
  | "morvat";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  repoSlug: string;
  repoUrl: string;
  role: string;
  domain: string;
  description: string;
  color: string;
  baseConfidence: number;
  keywords: string[];
  layer: "orchestration" | "cognition" | "verification" | "execution" | "creative" | "memory";
  graphPos: { x: number; y: number };
  links: AgentId[];
}

export const AGENT_REGISTRY: Record<AgentId, AgentDefinition> = {
  archon: {
    id: "archon",
    name: "Archon",
    repoSlug: "ALLYXZS/ARCHON-AGENT",
    repoUrl: "https://github.com/allyxzs/archon-agent",
    role: "Meta-Orquestrador Supremo & Planejador DAG",
    domain: "Orquestração Multi-Agente",
    description:
      "Coordena o enxame de 10 agentes, decompõe tarefas complexas em subgrafos executáveis e arbitra prioridades entre módulos.",
    color: "#ff2a85",
    baseConfidence: 0.97,
    keywords: ["orquestrar", "plano", "arquitetura", "sistema", "agente", "pipeline", "roadmap"],
    layer: "orchestration",
    graphPos: { x: 0.5, y: 0.22 },
    links: ["cortex", "noetra", "mnemos", "kernelis", "lumeta", "vinta"],
  },
  cortex: {
    id: "cortex",
    name: "Cortex",
    repoSlug: "ALLYXZS/CORTEX",
    repoUrl: "https://github.com/allyxzs/cortex",
    role: "Núcleo Executivo Neural & Risk Gate",
    domain: "Inferência & Controle de Risco",
    description:
      "Executa a síntese neural central, gerencia o Risk Hold Gate (confiança < 0.85) e consolida as saídas do ecossistema.",
    color: "#ec4899",
    baseConfidence: 0.95,
    keywords: ["analisar", "resumir", "decidir", "estratégia", "risco", "núcleo", "ia"],
    layer: "cognition",
    graphPos: { x: 0.5, y: 0.52 },
    links: ["archon", "mnemos", "veritas", "noetra", "janus", "morvat"],
  },
  mnemos: {
    id: "mnemos",
    name: "Mnemos",
    repoSlug: "ALLYXZS/MNEMOS",
    repoUrl: "https://github.com/allyxzs/mnemos",
    role: "Memória Semântica & Cofre de Dados",
    domain: "Persistência & Recuperação Vetorial",
    description:
      "Indexa conversas, arquivos ingeridos, fatos do usuário e grafos de contexto com recuperação semântica em tempo real.",
    color: "#9b5de5",
    baseConfidence: 0.98,
    keywords: ["lembrar", "memória", "arquivo", "dados", "contexto", "histórico", "salvar", "dataset"],
    layer: "memory",
    graphPos: { x: 0.78, y: 0.45 },
    links: ["cortex", "archon", "noetra", "veritas"],
  },
  noetra: {
    id: "noetra",
    name: "Noetra",
    repoSlug: "ALLYXZS/NOETRA-AGENT",
    repoUrl: "https://github.com/allyxzs/noetra-agent",
    role: "Motor AraThink & Raciocínio Profundo",
    domain: "Chain-of-Thought & Tree-of-Thoughts",
    description:
      "Conduz ciclos estendidos de raciocínio lógico, exploração de hipóteses multi-ramo e abstração conceitual no modo AraThink.",
    color: "#a855f7",
    baseConfidence: 0.96,
    keywords: ["arathink", "pensar", "raciocínio", "profundo", "por que", "hipótese", "teoria", "filosofia"],
    layer: "cognition",
    graphPos: { x: 0.25, y: 0.34 },
    links: ["archon", "cortex", "janus", "veritas", "morvat"],
  },
  veritas: {
    id: "veritas",
    name: "Veritas",
    repoSlug: "ALLYXZS/VERITAS",
    repoUrl: "https://github.com/allyxzs/veritas",
    role: "Verificação Formal & Motor Matemático",
    domain: "Prova Lógica, Cálculo & Álgebra",
    description:
      "Valida teoremas, resolve integrais, derivadas, matrizes, sistemas lineares e audita precisão factual antes da entrega.",
    color: "#00f59b",
    baseConfidence: 0.97,
    keywords: [
      "matemática", "integral", "derivada", "equação", "matriz", "calcular", "prova", "teorema",
      "soma", "limite", "probabilidade", "estatística", "log", "sen", "cos", "fórmula", "verify"
    ],
    layer: "verification",
    graphPos: { x: 0.74, y: 0.78 },
    links: ["cortex", "noetra", "janus", "kernelis", "mnemos"],
  },
  kernelis: {
    id: "kernelis",
    name: "Kernelis",
    repoSlug: "ALLYXZS/KERNELIS-AGENT",
    repoUrl: "https://github.com/allyxzs/kernelis-agent",
    role: "Engenharia de Algoritmos & Sistemas",
    domain: "Código, Compiladores & Estruturas",
    description:
      "Gera algoritmos otimizados, backends, APIs, estruturas de dados, shaders GLSL e código pronto para produção.",
    color: "#ffb703",
    baseConfidence: 0.96,
    keywords: [
      "código", "algoritmo", "python", "typescript", "javascript", "rust", "c++", "sql",
      "api", "backend", "função", "classe", "ordenar", "grafo", "compilar", "debug", "programar"
    ],
    layer: "execution",
    graphPos: { x: 0.22, y: 0.76 },
    links: ["archon", "cortex", "lumeta", "veritas", "vinta"],
  },
  vinta: {
    id: "vinta",
    name: "Vinta",
    repoSlug: "ALLYXZS/VINTA",
    repoUrl: "https://github.com/allyxzs/vinta",
    role: "Síntese Visual, Shaders GLSL & Imagens",
    domain: "Geração de Imagens & WebGL",
    description:
      "Gera imagens de alta resolução (via APIs externas ou motor procedural WebGL/Canvas), texturas de partículas e direção de arte.",
    color: "#00f0ff",
    baseConfidence: 0.93,
    keywords: [
      "imagem", "gerar imagem", "desenhar", "arte", "ilustração", "render", "shader", "glsl",
      "visual", "vórtice", "cor", "logo", "poster", "/imagine"
    ],
    layer: "creative",
    graphPos: { x: 0.85, y: 0.20 },
    links: ["archon", "lumeta", "morvat", "kernelis"],
  },
  lumeta: {
    id: "lumeta",
    name: "Lumeta",
    repoSlug: "ALLYXZS/LUMETA-AGENT",
    repoUrl: "https://github.com/allyxzs/lumeta-agent",
    role: "Arquiteto de Interfaces & Criador de Sites",
    domain: "Web Design, UI/UX & Preview Vivo",
    description:
      "Projeta sites responsivos, landing pages, dashboards interativos, componentes React/Tailwind e layouts customizáveis.",
    color: "#38bdf8",
    baseConfidence: 0.94,
    keywords: [
      "site", "website", "landing page", "html", "css", "ui", "ux", "interface", "dashboard",
      "botão", "layout", "página", "frontend", "react", "tailwind", "portfólio"
    ],
    layer: "execution",
    graphPos: { x: 0.14, y: 0.54 },
    links: ["archon", "kernelis", "vinta", "cortex"],
  },
  janus: {
    id: "janus",
    name: "Janus",
    repoSlug: "ALLYXZS/JANUS-AGENT",
    repoUrl: "https://github.com/allyxzs/janus-agent",
    role: "Crítica Dialética & Red/Blue Team",
    domain: "Revisão Adversa & Edge Cases",
    description:
      "Avalia soluções sob perspectivas opostas, detecta falhas de segurança, vulnerabilidades lógicas e gargalos de performance.",
    color: "#fb7185",
    baseConfidence: 0.92,
    keywords: ["criticar", "comparar", "prós", "contras", "segurança", "auditar", "testar", "falha", "tradeoff"],
    layer: "verification",
    graphPos: { x: 0.48, y: 0.84 },
    links: ["cortex", "noetra", "veritas", "morvat"],
  },
  morvat: {
    id: "morvat",
    name: "Morvat",
    repoSlug: "ALLYXZS/MORVAT",
    repoUrl: "https://github.com/allyxzs/morvat",
    role: "Dinâmica Tensorial, Caos & Criatividade",
    domain: "Entropia, Curvatura & Divergência",
    description:
      "Controla o campo tensorial do vórtice, injeta exploração criativa divergente e simula sistemas dinâmicos não-lineares.",
    color: "#f472b6",
    baseConfidence: 0.94,
    keywords: ["criativo", "ideia", "caos", "tensor", "física", "simulação", "inovar", "história", "conceito"],
    layer: "creative",
    graphPos: { x: 0.36, y: 0.14 },
    links: ["cortex", "noetra", "vinta", "janus"],
  },
};

export const AGENT_LIST: AgentDefinition[] = [
  AGENT_REGISTRY.morvat,
  AGENT_REGISTRY.cortex,
  AGENT_REGISTRY.vinta,
  AGENT_REGISTRY.veritas,
  AGENT_REGISTRY.mnemos,
  AGENT_REGISTRY.lumeta,
  AGENT_REGISTRY.noetra,
  AGENT_REGISTRY.janus,
  AGENT_REGISTRY.kernelis,
  AGENT_REGISTRY.archon,
];
