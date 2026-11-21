import { AGENT_LIST, AGENT_REGISTRY, AgentId } from "./registry";
import { AraThinkMode } from "./arathink";
import { MemoryEntry } from "./mnemos";
import { MathSolution } from "./math-engine";

export interface ParsedThinkOutput {
  thinking: string;
  answer: string;
  isCurrentlyThinking: boolean;
}

export function routeAgents(
  prompt: string,
  araThinkMode: AraThinkMode,
  forced?: AgentId[]
): AgentId[] {
  if (forced && forced.length > 0) {
    return Array.from(new Set(["archon", ...forced, "cortex"])) as AgentId[];
  }
  const lower = prompt.toLowerCase();
  const scores = new Map<AgentId, number>();

  AGENT_LIST.forEach((a) => {
    let score = 0;
    a.keywords.forEach((kw) => {
      if (lower.includes(kw)) score += 2;
    });
    if (score > 0) scores.set(a.id, score);
  });

  const selected = new Set<AgentId>(["archon", "cortex", "mnemos"]);
  if (araThinkMode !== "standard") {
    selected.add("noetra");
    selected.add("janus");
    selected.add("veritas");
  }

  Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([id]) => selected.add(id));

  if (selected.size < 4) {
    selected.add("noetra");
    selected.add("morvat");
  }

  return Array.from(selected);
}

export function buildMultiAgentSystemPrompt(options: {
  activeAgents: AgentId[];
  araThinkMode: AraThinkMode;
  recalledMemories: Array<{ entry: MemoryEntry; score: number }>;
  mathVerification?: MathSolution;
  customSystemPrompt?: string;
}): string {
  const { activeAgents, araThinkMode, recalledMemories, mathVerification, customSystemPrompt } = options;

  const agentRoles = activeAgents
    .map((id) => `- ${AGENT_REGISTRY[id].name} (${AGENT_REGISTRY[id].repoSlug}): ${AGENT_REGISTRY[id].role}`)
    .join("\n");

  const thinkDirective =
    araThinkMode === "arathink-ultra"
      ? "MODO ARATHINK ULTRA ATIVADO: Antes de responder, execute um raciocínio profundo, estruturado e rigoroso dentro de tags <think>...</think> (decomposição, hipóteses, verificação lógica e casos de borda). Só depois de fechar </think>, escreva a resposta final clara, completa e bem formatada em Markdown."
      : araThinkMode === "arathink"
      ? "MODO ARATHINK ATIVADO: Pense passo a passo brevemente dentro de tags <think>...</think> antes de entregar a resposta final bem estruturada em Markdown após </think>."
      : "Responda de forma direta, inteligente, natural e precisa em Markdown (sem tags <think>).";

  const memorySection =
    recalledMemories.length > 0
      ? "\n\n[MEMÓRIA SEMÂNTICA MNEMOS]\n" +
        recalledMemories
          .map((m) => `- ${m.entry.title}: ${m.entry.content.slice(0, 360)}`)
          .join("\n")
      : "";

  const mathSection =
    mathVerification && mathVerification.detected
      ? `\n\n[FERRAMENTA VERITAS — CÁLCULO NUMÉRICO VERIFICADO]\nTipo: ${mathVerification.type}\nResultado numérico exato de referência: ${mathVerification.result}\nUse este valor verificado para garantir 100% de precisão ao explicar a resolução passo a passo ao usuário.`
      : "";

  const customBlock = customSystemPrompt?.trim()
    ? `\n\n[INSTRUÇÕES PERSONALIZADAS DO USUÁRIO]\n${customSystemPrompt.trim()}`
    : "";

  return [
    "Você é o ARA OS 12+, um sistema operacional de IA avançado movido por arquitetura Transformer neural e um ecossistema de 10 agentes especializados.",
    "Responda sempre no idioma do usuário (preferencialmente Português do Brasil quando o usuário escrever em português).",
    "Nunca dê respostas genéricas ou automáticas: raciocine de verdade sobre o pedido do usuário.",
    "Quando o usuário pedir código, algoritmos ou um site completo, forneça código limpo, completo e executável dentro de blocos Markdown ```linguagem ... ``` (para sites completos, gere um único bloco ```html com <!DOCTYPE html>, CSS e JS inline para que o preview ao vivo funcione perfeitamente).",
    "\n[AGENTES ATIVOS NESTA SESSÃO]\n" + agentRoles,
    "\n" + thinkDirective,
    memorySection,
    mathSection,
    customBlock,
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseThinkStream(rawText: string): ParsedThinkOutput {
  if (!rawText) {
    return { thinking: "", answer: "", isCurrentlyThinking: false };
  }

  const openIdx = rawText.indexOf("<think>");
  if (openIdx === -1) {
    const closeOnly = rawText.indexOf("</think>");
    if (closeOnly !== -1) {
      return {
        thinking: rawText.slice(0, closeOnly).trim(),
        answer: rawText.slice(closeOnly + 8).trimStart(),
        isCurrentlyThinking: false,
      };
    }
    return { thinking: "", answer: rawText, isCurrentlyThinking: false };
  }

  const closeIdx = rawText.indexOf("</think>", openIdx + 7);
  if (closeIdx === -1) {
    return {
      thinking: rawText.slice(openIdx + 7).trimStart(),
      answer: rawText.slice(0, openIdx).trim(),
      isCurrentlyThinking: true,
    };
  }

  const before = rawText.slice(0, openIdx).trim();
  const thinking = rawText.slice(openIdx + 7, closeIdx).trim();
  const after = rawText.slice(closeIdx + 8).trimStart();

  return {
    thinking,
    answer: [before, after].filter(Boolean).join("\n\n"),
    isCurrentlyThinking: false,
  };
}
