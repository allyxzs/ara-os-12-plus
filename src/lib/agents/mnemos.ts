export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  source: "conversation" | "upload" | "manual" | "agent-insight";
  filename?: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  tokens: number;
  embedding?: number[];
}

const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "a", "o", "as", "os", "e", "em", "um", "uma",
  "para", "com", "por", "que", "se", "na", "no", "nas", "nos", "ao", "é", "the",
  "and", "for", "with", "that", "this", "from", "are", "was", "were", "you", "your",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 3.8));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 1e-12 ? dot / denom : 0;
}

export function retrieveRelevantMemories(
  query: string,
  memories: MemoryEntry[],
  topK = 4,
  queryEmbedding?: number[]
): Array<{ entry: MemoryEntry; score: number }> {
  if (!memories.length) return [];

  const qTokens = new Set(tokenize(query));

  const scored = memories.map((entry) => {
    let semanticScore = 0;

    if (queryEmbedding && entry.embedding && entry.embedding.length === queryEmbedding.length) {
      semanticScore = Math.max(0, cosineSimilarity(queryEmbedding, entry.embedding));
    }

    let lexicalScore = 0;
    if (qTokens.size > 0) {
      const docTokens = tokenize(`${entry.title} ${entry.content} ${entry.tags.join(" ")}`);
      const docSet = new Set(docTokens);
      let overlap = 0;
      qTokens.forEach((t) => {
        if (docSet.has(t)) overlap += 1;
      });
      lexicalScore = overlap / Math.max(1, Math.sqrt(qTokens.size * Math.max(1, docSet.size)));
    }

    const pinBoost = entry.pinned ? 0.22 : 0;
    const combined =
      semanticScore > 0
        ? semanticScore * 0.72 + lexicalScore * 0.28 + pinBoost
        : lexicalScore + pinBoost;

    return { entry, score: Math.min(0.99, combined) };
  });

  return scored
    .filter((s) => s.score > 0.14)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function chunkDocument(
  filename: string,
  rawText: string,
  chunkSize = 900
): MemoryEntry[] {
  const clean = rawText.trim();
  if (!clean) return [];
  const chunks: MemoryEntry[] = [];
  const ext = filename.split(".").pop()?.toLowerCase() || "txt";

  for (let i = 0; i < clean.length; i += chunkSize) {
    const slice = clean.slice(i, i + chunkSize);
    const idx = Math.floor(i / chunkSize) + 1;
    const total = Math.ceil(clean.length / chunkSize);
    chunks.push({
      id: `mem-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      title: total > 1 ? `${filename} (Bloco ${idx}/${total})` : filename,
      content: slice,
      source: "upload",
      filename,
      tags: ["upload", ext, "mnemos-vault"],
      pinned: idx === 1,
      createdAt: new Date().toISOString(),
      tokens: estimateTokens(slice),
    });
  }
  return chunks;
}

export function extractAutoMemory(userPrompt: string): MemoryEntry | null {
  const triggers = [
    /meu nome é\s+([^.,!\n]+)/i,
    /estou (?:criando|trabalhando|desenvolvendo)\s+([^.,!\n]+)/i,
    /lembre(?:-se)?\s+(?:que|de)\s+([^\n]+)/i,
    /guarde\s+(?:isso|esse dado|essa informação)[:\s]+([^\n]+)/i,
    /prefiro\s+([^.,!\n]+)/i,
  ];
  for (const regex of triggers) {
    const match = userPrompt.match(regex);
    if (match) {
      return {
        id: `mem-auto-${Date.now()}`,
        title: `Contexto Capturado: ${match[1].slice(0, 42)}`,
        content: userPrompt.slice(0, 420),
        source: "conversation",
        tags: ["auto-capture", "preferência", "mnemos"],
        pinned: true,
        createdAt: new Date().toISOString(),
        tokens: estimateTokens(userPrompt),
      };
    }
  }
  return null;
}
