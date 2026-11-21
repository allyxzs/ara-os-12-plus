import { NextResponse } from "next/server";
import { AGENT_LIST } from "@/lib/agents/registry";

export async function GET() {
  const telemetry = AGENT_LIST.map((agent) => ({
    ...agent,
    status: "ONLINE",
    liveConfidence: Number(
      Math.min(0.99, Math.max(0.86, agent.baseConfidence + (Math.random() * 0.03 - 0.015))).toFixed(2)
    ),
    latencyMs: Math.floor(14 + Math.random() * 28),
  }));

  return NextResponse.json({
    system: "ARA OS 12+ // AETHER v6.0",
    timestamp: new Date().toISOString(),
    agents: telemetry,
  });
}
