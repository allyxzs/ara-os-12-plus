export type VintaStyle =
  | "aether-cyber"
  | "quantum-nebula"
  | "sugimori-watercolor"
  | "blueprint-cad"
  | "obsidian-gold"
  | "glitch-matrix";

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  style: VintaStyle;
  dataUrl: string;
  engine: string;
  seed: number;
  createdAt: string;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashPrompt(prompt: string): number {
  let h = 2166136261;
  for (let i = 0; i < prompt.length; i++) {
    h ^= prompt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) || 1337;
}

const STYLE_PALETTES: Record<VintaStyle, { bg: string[]; colors: string[] }> = {
  "aether-cyber": {
    bg: ["#030308", "#0c0418"],
    colors: ["#ff2a85", "#00f0ff", "#9b5de5", "#ffffff"],
  },
  "quantum-nebula": {
    bg: ["#02040d", "#09021c"],
    colors: ["#38bdf8", "#a855f7", "#f472b6", "#e0f2fe"],
  },
  "sugimori-watercolor": {
    bg: ["#f8f4ea", "#ece4d3"],
    colors: ["#e63946", "#2a9d8f", "#f4a261", "#264653"],
  },
  "blueprint-cad": {
    bg: ["#051326", "#0a2540"],
    colors: ["#38bdf8", "#7dd3fc", "#ffffff", "#00f0ff"],
  },
  "obsidian-gold": {
    bg: ["#040404", "#120e08"],
    colors: ["#ffb703", "#fb8500", "#fef3c7", "#ff2a85"],
  },
  "glitch-matrix": {
    bg: ["#000805", "#021a10"],
    colors: ["#00f59b", "#00f0ff", "#ff2a85", "#d1fae5"],
  },
};

export function renderVintaProceduralImage(
  prompt: string,
  style: VintaStyle = "aether-cyber",
  customSeed?: number,
  size = 1024
): { dataUrl: string; seed: number } {
  const seed = customSeed ?? hashPrompt(prompt + style);
  const rand = mulberry32(seed);
  const palette = STYLE_PALETTES[style];

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const bgGrad = ctx.createRadialGradient(
    size * (0.3 + rand() * 0.4),
    size * (0.3 + rand() * 0.4),
    size * 0.05,
    size * 0.5,
    size * 0.5,
    size * 0.85
  );
  bgGrad.addColorStop(0, palette.bg[1]);
  bgGrad.addColorStop(1, palette.bg[0]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Atmospheric volumetric glow orbs
  const lightMode = style === "sugimori-watercolor";
  ctx.globalCompositeOperation = lightMode ? "multiply" : "screen";
  for (let i = 0; i < 9; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = size * (0.14 + rand() * 0.28);
    const col = palette.colors[Math.floor(rand() * palette.colors.length)];
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col + (lightMode ? "55" : "66"));
    g.addColorStop(1, col + "00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Harmonic parametric attractor ribbons (prompt-seeded topology)
  const cx = size / 2;
  const cy = size / 2;
  const k1 = 2 + Math.floor(rand() * 6);
  const k2 = 3 + Math.floor(rand() * 7);
  const phase = rand() * Math.PI * 2;
  const layers = 7;

  ctx.globalCompositeOperation = lightMode ? "source-over" : "lighter";
  for (let l = 0; l < layers; l++) {
    const col = palette.colors[l % palette.colors.length];
    ctx.strokeStyle = col + (lightMode ? "77" : "55");
    ctx.lineWidth = lightMode ? 2.5 : 1.4 + rand() * 2;
    ctx.beginPath();
    const scale = size * (0.16 + l * 0.045);
    const steps = 680;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const r =
        scale *
        (0.7 + 0.35 * Math.cos(k1 * t + phase + l * 0.4) + 0.2 * Math.sin(k2 * t - l * 0.3));
      const x = cx + Math.cos(t) * r + Math.sin(t * k2) * 18;
      const y = cy + Math.sin(t) * r + Math.cos(t * k1) * 18;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Dense micro-particle field (Vinta GPGPU signature)
  const count = 4200;
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = Math.pow(rand(), 0.72) * size * 0.44;
    const swirl = dist * 0.006 * (k1 - 3);
    const px = cx + Math.cos(angle + swirl) * dist;
    const py = cy + Math.sin(angle + swirl) * dist;
    const pr = 0.6 + rand() * 2.2;
    const col = palette.colors[Math.floor(rand() * palette.colors.length)];
    ctx.fillStyle = col + (rand() > 0.5 ? "cc" : "66");
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blueprint / HUD technical overlay
  if (style === "blueprint-cad" || style === "aether-cyber" || style === "glitch-matrix") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = palette.colors[1] + "28";
    ctx.lineWidth = 1;
    const step = 64;
    for (let x = 0; x < size; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y < size; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  // Subtle watermark metadata
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = lightMode ? "rgba(20,20,30,0.65)" : "rgba(255,255,255,0.68)";
  ctx.font = "600 18px monospace";
  ctx.fillText(`ARA OS 12+ // VINTA STUDIO [${style.toUpperCase()}]`, 28, size - 48);
  ctx.fillStyle = lightMode ? "rgba(20,20,30,0.45)" : "rgba(0,240,255,0.72)";
  ctx.font = "14px monospace";
  ctx.fillText(`SEED ${seed} · "${prompt.slice(0, 62)}"`, 28, size - 24);

  return { dataUrl: canvas.toDataURL("image/png"), seed };
}
