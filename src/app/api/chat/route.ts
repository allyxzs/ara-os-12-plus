import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamExternalProvider } from "@/lib/agents/llm-providers";

const StreamChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  providerConfig: z.object({
    provider: z.enum([
      "transformers-web",
      "transformers-python",
      "ollama",
      "openai",
      "gemini",
      "anthropic",
    ]),
    model: z.string().default(""),
    baseUrl: z.string().optional(),
    apiKey: z.string().optional(),
  }),
  params: z
    .object({
      temperature: z.number().default(0.65),
      topP: z.number().default(0.9),
      maxNewTokens: z.number().default(1024),
      repetitionPenalty: z.number().default(1.12),
    })
    .default({ temperature: 0.65, topP: 0.9, maxNewTokens: 1024, repetitionPenalty: 1.12 }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = StreamChatSchema.parse(body);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamExternalProvider(
            parsed.providerConfig,
            parsed.messages,
            parsed.params,
            {
              onToken: (chunk) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`)
                );
              },
            }
          );
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err?.message || String(err) })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Payload inválido em /api/chat", details: err?.message || String(err) },
      { status: 400 }
    );
  }
}
