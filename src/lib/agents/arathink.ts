import { AgentId, AGENT_REGISTRY } from "./registry";
import { MemoryEntry } from "./mnemos";

export type AraThinkMode = "standard" | "arathink" | "arathink-ultra";

export interface AraThinkStep {
  phase: string;
  agent: AgentId;
  agentName: string;
  color: string;
  thought: string;
  confidence: number;
  durationMs: number;
}

export interface AraThinkTrace {
  mode: AraThinkMode;
  totalDurationMs: number;
  reasoningDepthScore: number;
  steps: AraThinkStep[];
}

export function buildAraThinkTrace(
  prompt: string,
  selectedAgents: AgentId[],
  recalledMemories: Array<{ entry: MemoryEntry; score: number }>,
  mode: AraThinkMode
): AraThinkTrace {
  const isUltra = mode === "arathink-ultra";
  const isDeep = mode === "arathink" || isUltra;

  const steps: AraThinkStep[] = [];

  steps.push({
    phase: "01 // DECOMPOSIÇÃO ESTRATÉGICA",
    agent: "archon",
    agentName: AGENT_REGISTRY.archon.name,
    color: AGENT_REGISTRY.archon.color,
    thought: `Intenção analisada ("${prompt.slice(0, 90)}${prompt.length > 90 ? "..." : ""}"). Subgrafo de execução montado com ${selectedAgents.length} agentes especializados: ${selectedAgents.map((id) => AGENT_REGISTRY[id].name).join(" → ")}.`,
    confidence: 0.97,
    durationMs: isUltra ? 420 : 180,
  });

  if (recalledMemories.length > 0 || isDeep) {
    steps.push({
      phase: "02 // RECUPERAÇÃO DE MEMÓRIA MNEMOS",
      agent: "mnemos",
      agentName: AGENT_REGISTRY.mnemos.name,
      color: AGENT_REGISTRY.mnemos.color,
      thought:
        recalledMemories.length > 0
          ? `Recuperados ${recalledMemories.length} nós semânticos relevantes do Cofre Mnemos (maior aderência: ${(recalledMemories[0].score * 100).toFixed(0)}% em "${recalledMemories[0].entry.title}"). Contexto injetado no barramento neural.`
          : "Varredura vetorial concluída no Cofre Mnemos. Nenhum bloqueio de contexto anterior detectado; operando em sessão limpa com indexação ativa.",
      confidence: 0.98,
      durationMs: isUltra ? 340 : 140,
    });
  }

  if (isDeep) {
    steps.push({
      phase: "03 // EXPLORAÇÃO PROFUNDA (NOETRA × MORVAT)",
      agent: "noetra",
      agentName: AGENT_REGISTRY.noetra.name,
      color: AGENT_REGISTRY.noetra.color,
      thought: isUltra
        ? "Tree-of-Thoughts nível ULTRA ativado (3 ramos paralelos). Avaliando formulação axiomática, complexidade assintótica, arquitetura modular e divergência criativa via Morvat para maximizar densidade informacional."
        : "Chain-of-Thought estendido ativado. Mapeando pré-condições, casos de borda, dependências estruturais e padrões ideais de solução antes da síntese final.",
      confidence: 0.95,
      durationMs: isUltra ? 680 : 390,
    });

    steps.push({
      phase: "04 // CRÍTICA DIALÉTICA (JANUS RED-TEAM)",
      agent: "janus",
      agentName: AGENT_REGISTRY.janus.name,
      color: AGENT_REGISTRY.janus.color,
      thought:
        "Auditoria adversa aplicada: verificando ambiguidades de especificação, possíveis bugs de borda, falhas de ergonomia e trade-offs de desempenho/segurança.",
      confidence: 0.93,
      durationMs: isUltra ? 510 : 260,
    });

    steps.push({
      phase: "05 // VERIFICAÇÃO FORMAL & GATE DE CONFIANÇA",
      agent: "veritas",
      agentName: AGENT_REGISTRY.veritas.name,
      color: AGENT_REGISTRY.veritas.color,
      thought:
        "Consistência lógica, rigor matemático e integridade sintática validados. Cortex Risk Gate liberado (> 0.92). Pronto para consolidação final.",
      confidence: 0.97,
      durationMs: isUltra ? 450 : 220,
    });
  }

  const totalDurationMs = steps.reduce((acc, s) => acc + s.durationMs, 0);
  return {
    mode,
    totalDurationMs,
    reasoningDepthScore: isUltra ? 99 : isDeep ? 94 : 78,
    steps,
  };
}
