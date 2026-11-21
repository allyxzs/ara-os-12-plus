export type ColorMode = "dark" | "light";
export type BackdropStyle = "solid" | "radial-aurora" | "tech-grid" | "dot-matrix" | "horizon-mesh";
export type FontStyle = "mono" | "sans" | "geometric";
export type UiDensity = "compact" | "comfortable";

export interface ThemeConfig {
  colorMode: ColorMode;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  borderTint: number; // 0 to 1
  surfaceTint: number; // 0 to 0.45
  panelOpacity: number; // 0.35 to 0.98
  panelBlur: number; // 0 to 24
  borderRadius: number; // 0 to 20
  glowIntensity: number; // 0 to 1.5
  fontScale: number; // 0.85 to 1.2
  fontStyle: FontStyle;
  density: UiDensity;
  backdropStyle: BackdropStyle;
  backdropIntensity: number; // 0 to 1
  activePresetId: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  mode: ColorMode;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  hue: number;
  backdropStyle: BackdropStyle;
  borderTint: number;
  surfaceTint: number;
}

export const THEME_PRESETS: ThemePreset[] = [
  // DARK PRESETS
  {
    id: "aether-black",
    name: "Aether Black",
    mode: "dark",
    bgColor: "#000000",
    surfaceColor: "#07080f",
    textColor: "#f4f4f8",
    mutedTextColor: "#94a3b8",
    accentPrimary: "#ff2a85",
    accentSecondary: "#00f0ff",
    accentTertiary: "#9b5de5",
    hue: 330,
    backdropStyle: "radial-aurora",
    borderTint: 0.28,
    surfaceTint: 0.06,
  },
  {
    id: "cyber-cyan",
    name: "Cyber Cyan",
    mode: "dark",
    bgColor: "#02060d",
    surfaceColor: "#06101f",
    textColor: "#ecfeff",
    mutedTextColor: "#7dd3fc",
    accentPrimary: "#00f0ff",
    accentSecondary: "#6366f1",
    accentTertiary: "#c084fc",
    hue: 190,
    backdropStyle: "tech-grid",
    borderTint: 0.38,
    surfaceTint: 0.10,
  },
  {
    id: "emerald-kernel",
    name: "Emerald Kernel",
    mode: "dark",
    bgColor: "#000906",
    surfaceColor: "#04140e",
    textColor: "#ecfdf5",
    mutedTextColor: "#6ee7b7",
    accentPrimary: "#00f59b",
    accentSecondary: "#00d4ff",
    accentTertiary: "#a3e635",
    hue: 155,
    backdropStyle: "dot-matrix",
    borderTint: 0.35,
    surfaceTint: 0.10,
  },
  {
    id: "solar-obsidian",
    name: "Solar Obsidian",
    mode: "dark",
    bgColor: "#070502",
    surfaceColor: "#141008",
    textColor: "#fffbeb",
    mutedTextColor: "#d6b888",
    accentPrimary: "#ffb703",
    accentSecondary: "#fb5607",
    accentTertiary: "#ff2a85",
    hue: 42,
    backdropStyle: "horizon-mesh",
    borderTint: 0.36,
    surfaceTint: 0.10,
  },
  {
    id: "ultraviolet-void",
    name: "Ultraviolet Void",
    mode: "dark",
    bgColor: "#05020e",
    surfaceColor: "#0e0821",
    textColor: "#f5f3ff",
    mutedTextColor: "#c4b5fd",
    accentPrimary: "#a855f7",
    accentSecondary: "#f472b6",
    accentTertiary: "#38bdf8",
    hue: 275,
    backdropStyle: "radial-aurora",
    borderTint: 0.40,
    surfaceTint: 0.12,
  },
  {
    id: "crimson-ops",
    name: "Crimson Ops",
    mode: "dark",
    bgColor: "#090204",
    surfaceColor: "#17070c",
    textColor: "#fff1f2",
    mutedTextColor: "#fda4af",
    accentPrimary: "#ff3358",
    accentSecondary: "#ffb703",
    accentTertiary: "#fb7185",
    hue: 350,
    backdropStyle: "tech-grid",
    borderTint: 0.42,
    surfaceTint: 0.11,
  },

  // LIGHT PRESETS
  {
    id: "aether-daylight",
    name: "Aether Daylight",
    mode: "light",
    bgColor: "#f4f6fb",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
    accentPrimary: "#e11d74",
    accentSecondary: "#0284c7",
    accentTertiary: "#7c3aed",
    hue: 332,
    backdropStyle: "radial-aurora",
    borderTint: 0.24,
    surfaceTint: 0.04,
  },
  {
    id: "nordic-ice",
    name: "Nordic Ice",
    mode: "light",
    bgColor: "#eef6fc",
    surfaceColor: "#ffffff",
    textColor: "#0c1e33",
    mutedTextColor: "#3b5875",
    accentPrimary: "#0284c7",
    accentSecondary: "#4f46e5",
    accentTertiary: "#0891b2",
    hue: 202,
    backdropStyle: "tech-grid",
    borderTint: 0.30,
    surfaceTint: 0.07,
  },
  {
    id: "sakura-studio",
    name: "Sakura Studio",
    mode: "light",
    bgColor: "#fdf4f8",
    surfaceColor: "#ffffff",
    textColor: "#23101c",
    mutedTextColor: "#754c66",
    accentPrimary: "#db2777",
    accentSecondary: "#9333ea",
    accentTertiary: "#f43f5e",
    hue: 330,
    backdropStyle: "radial-aurora",
    borderTint: 0.32,
    surfaceTint: 0.08,
  },
  {
    id: "mint-lab",
    name: "Mint Lab",
    mode: "light",
    bgColor: "#effaf5",
    surfaceColor: "#ffffff",
    textColor: "#06241b",
    mutedTextColor: "#2f6b58",
    accentPrimary: "#059669",
    accentSecondary: "#0284c7",
    accentTertiary: "#0d9488",
    hue: 158,
    backdropStyle: "dot-matrix",
    borderTint: 0.30,
    surfaceTint: 0.07,
  },
  {
    id: "solar-ivory",
    name: "Solar Ivory",
    mode: "light",
    bgColor: "#fbf7ef",
    surfaceColor: "#fffdf9",
    textColor: "#1f160a",
    mutedTextColor: "#6d5840",
    accentPrimary: "#d97706",
    accentSecondary: "#dc2626",
    accentTertiary: "#9333ea",
    hue: 35,
    backdropStyle: "horizon-mesh",
    borderTint: 0.30,
    surfaceTint: 0.07,
  },
  {
    id: "porcelain-mono",
    name: "Porcelain Minimal",
    mode: "light",
    bgColor: "#f5f5f7",
    surfaceColor: "#ffffff",
    textColor: "#111827",
    mutedTextColor: "#6b7280",
    accentPrimary: "#18181b",
    accentSecondary: "#2563eb",
    accentTertiary: "#6d28d9",
    hue: 220,
    backdropStyle: "solid",
    borderTint: 0.16,
    surfaceTint: 0.02,
  },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = (hex || "#000000").replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 255, g: 42, b: 133 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  const r = Math.round(a.r * (1 - w) + b.r * w);
  const g = Math.round(a.g * (1 - w) + b.g * w);
  const bl = Math.round(a.b * (1 - w) + b.b * w);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function getContrastText(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#09090b" : "#ffffff";
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) =>
    Math.round(255 * (ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function generateRandomHarmony(mode: ColorMode): Partial<ThemeConfig> & { hue: number } {
  const baseHue = Math.floor(Math.random() * 360);
  const secHue = (baseHue + 145) % 360;
  const terHue = (baseHue + 260) % 360;

  if (mode === "light") {
    return {
      colorMode: "light",
      bgColor: hslToHex(baseHue, 34, 96),
      surfaceColor: "#ffffff",
      textColor: hslToHex(baseHue, 32, 12),
      mutedTextColor: hslToHex(baseHue, 18, 38),
      accentPrimary: hslToHex(baseHue, 78, 44),
      accentSecondary: hslToHex(secHue, 76, 42),
      accentTertiary: hslToHex(terHue, 72, 46),
      borderTint: 0.30,
      surfaceTint: 0.06,
      activePresetId: "custom-harmony",
      hue: baseHue,
    };
  }

  return {
    colorMode: "dark",
    bgColor: hslToHex(baseHue, 42, 3),
    surfaceColor: hslToHex(baseHue, 36, 7),
    textColor: hslToHex(baseHue, 25, 96),
    mutedTextColor: hslToHex(baseHue, 22, 68),
    accentPrimary: hslToHex(baseHue, 92, 58),
    accentSecondary: hslToHex(secHue, 92, 56),
    accentTertiary: hslToHex(terHue, 85, 64),
    borderTint: 0.38,
    surfaceTint: 0.10,
    activePresetId: "custom-harmony",
    hue: baseHue,
  };
}

export function computeThemeVariables(theme: ThemeConfig): Record<string, string> {
  const isLight = theme.colorMode === "light";
  const tintedSurfaceHex = mixHex(theme.surfaceColor, theme.accentPrimary, theme.surfaceTint);
  const elevatedHex = isLight
    ? mixHex("#ffffff", theme.accentPrimary, Math.min(0.14, theme.surfaceTint * 0.7))
    : mixHex(theme.surfaceColor, "#ffffff", 0.055);
  const inputBgHex = isLight
    ? mixHex("#f8fafc", theme.accentPrimary, Math.min(0.10, theme.surfaceTint * 0.5))
    : mixHex(theme.bgColor, theme.surfaceColor, 0.75);

  const baseBorder = isLight ? "#cbd5e1" : "#27272a";
  const borderHex = mixHex(baseBorder, theme.accentPrimary, theme.borderTint);
  const borderAlpha = isLight ? 0.65 + theme.borderTint * 0.25 : 0.42 + theme.borderTint * 0.42;

  const fontMap: Record<FontStyle, string> = {
    mono: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace",
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    geometric: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif",
  };

  const shadowStr = isLight
    ? `0 10px ${Math.round(28 + theme.glowIntensity * 16)}px ${hexToRgba(theme.accentPrimary, 0.09 + theme.glowIntensity * 0.08)}, 0 2px 8px rgba(15, 23, 42, 0.06)`
    : `0 0 ${Math.round(18 * theme.glowIntensity)}px ${hexToRgba(theme.accentPrimary, 0.12 * theme.glowIntensity)}, 0 12px 30px rgba(0, 0, 0, 0.72)`;

  return {
    "--ara-bg": theme.bgColor,
    "--ara-surface-hex": tintedSurfaceHex,
    "--ara-panel-bg": hexToRgba(tintedSurfaceHex, theme.panelOpacity),
    "--ara-bar-bg": hexToRgba(tintedSurfaceHex, Math.min(0.97, theme.panelOpacity + 0.08)),
    "--ara-elevated-bg": hexToRgba(elevatedHex, isLight ? 0.94 : 0.88),
    "--ara-input-bg": hexToRgba(inputBgHex, isLight ? 0.96 : 0.90),
    "--ara-modal-bg": hexToRgba(tintedSurfaceHex, isLight ? 0.98 : 0.96),
    "--ara-text": theme.textColor,
    "--ara-text-muted": theme.mutedTextColor,
    "--ara-border": hexToRgba(borderHex, borderAlpha),
    "--ara-border-subtle": isLight ? "rgba(15, 23, 42, 0.10)" : "rgba(255, 255, 255, 0.09)",
    "--ara-accent-1": theme.accentPrimary,
    "--ara-accent-1-soft": hexToRgba(theme.accentPrimary, isLight ? 0.12 : 0.18),
    "--ara-accent-1-border": hexToRgba(theme.accentPrimary, isLight ? 0.45 : 0.55),
    "--ara-accent-1-contrast": getContrastText(theme.accentPrimary),
    "--ara-accent-2": theme.accentSecondary,
    "--ara-accent-2-soft": hexToRgba(theme.accentSecondary, isLight ? 0.12 : 0.16),
    "--ara-accent-2-border": hexToRgba(theme.accentSecondary, isLight ? 0.45 : 0.52),
    "--ara-accent-3": theme.accentTertiary,
    "--ara-accent-3-soft": hexToRgba(theme.accentTertiary, isLight ? 0.12 : 0.18),
    "--ara-accent-3-border": hexToRgba(theme.accentTertiary, isLight ? 0.45 : 0.52),
    "--ara-blur": `${theme.panelBlur}px`,
    "--ara-radius": `${theme.borderRadius}px`,
    "--ara-shadow": shadowStr,
    "--ara-font-scale": `${theme.fontScale}`,
    "--ara-font-ui": fontMap[theme.fontStyle],
    "--ara-backdrop-opacity": `${theme.backdropIntensity}`,
    "--ara-grid-line": isLight
      ? hexToRgba(theme.accentPrimary, 0.14 * theme.backdropIntensity)
      : hexToRgba(theme.accentSecondary, 0.16 * theme.backdropIntensity),
    "--ara-hover-bg": isLight ? "rgba(15, 23, 42, 0.06)" : "rgba(255, 255, 255, 0.08)",
    "--ara-code-bg": isLight ? "#0f172a" : "#030408",
    "--ara-code-text": "#e2e8f0",
  };
}
