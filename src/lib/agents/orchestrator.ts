import { AgentId } from "./registry";
import { AraThinkMode } from "./arathink";
import { MemoryEntry, extractAutoMemory, retrieveRelevantMemories } from "./mnemos";
import { solveMathPrompt, MathSolution } from "./math-engine";
import { buildMultiAgentSystemPrompt, routeAgents } from "./prompt-builder";
import { LlmMessage } from "./llm-providers";

export interface PreparedInferenceContext {
  activeAgents: AgentId[];
  recalledMemories: Array<{ id: string; title: string; score: number }>;
  newAutoMemory: MemoryEntry | null;
  mathVerification: MathSolution;
  messages: LlmMessage[];
  dmaLogs: Array<{ agent: AgentId; text: string }>;
}

export function prepareMultiAgentContext(params: {
  prompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  araThinkMode: AraThinkMode;
  memories: MemoryEntry[];
  queryEmbedding?: number[];
  forcedAgents?: AgentId[];
  customSystemPrompt?: string;
}): PreparedInferenceContext {
  const {
    prompt,
    history,
    araThinkMode,
    memories,
    queryEmbedding,
    forcedAgents,
    customSystemPrompt,
  } = params;

  const activeAgents = routeAgents(prompt, araThinkMode, forcedAgents);
  const recalled = retrieveRelevantMemories(prompt, memories, 4, queryEmbedding);
  const newAutoMemory = extractAutoMemory(prompt);
  const mathVerification = solveMathPrompt(prompt);

  const dmaLogs: Array<{ agent: AgentId; text: string }> = [
    { agent: "archon", text: `Roteamento DAG → [${activeAgents.join(", ")}]` },
    {
      agent: "mnemos",
      text: `Busca ${queryEmbedding ? "vetorial neural" : "semântica"}: ${recalled.length} memória(s) injetada(s).`,
    },
  ];

  if (mathVerification.detected) {
    dmaLogs.push({
      agent: "veritas",
      text: `Ferramenta matemática pré-validou (${mathVerification.type}) → ${mathVerification.result}`,
    });
  }

  const systemPrompt = buildMultiAgentSystemPrompt({
    activeAgents,
    araThinkMode,
    recalledMemories: recalled,
    mathVerification,
    customSystemPrompt,
  });

  const messages: LlmMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: prompt },
  ];

  return {
    activeAgents,
    recalledMemories: recalled.map((r) => ({
      id: r.entry.id,
      title: r.entry.title,
      score: Number(r.score.toFixed(2)),
    })),
    newAutoMemory,
    mathVerification,
    messages,
    dmaLogs,
  };
}
