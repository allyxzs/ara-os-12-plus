import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, style = "aether-cyber", apiKey, provider = "vinta-local" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt de imagem obrigatório." }, { status: 400 });
    }

    // Optional external OpenAI image API bridge
    const key = apiKey || process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;
    if (provider === "openai" && key) {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${prompt} — aesthetic style: ${style}`,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const b64 = data?.data?.[0]?.b64_json;
        if (b64) {
          return NextResponse.json({
            engine: "openai-dalle3",
            imageUrl: `data:image/png;base64,${b64}`,
            prompt,
            style,
          });
        }
      }
    }

    // Return deterministic Vinta Procedural Seed Recipe so client WebGL/Canvas renders instant 1024x1024 PNG
    let hash = 2166136261;
    for (let i = 0; i < prompt.length; i++) {
      hash ^= prompt.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    return NextResponse.json({
      engine: "vinta-procedural-neural-canvas",
      seed: Math.abs(hash),
      prompt,
      style,
    });
  } catch (err) {
    return NextResponse.json({ error: "Erro no Vinta Studio", details: String(err) }, { status: 500 });
  }
}
