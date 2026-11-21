"use client";

import React, { useState } from "react";
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Cpu,
  Palette,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Bookmark,
  Shuffle,
  Trash2,
} from "lucide-react";
import { useAraStore, VortexShape, PanelVisibility } from "@/store/useAraStore";
import { THEME_PRESETS, BackdropStyle, FontStyle } from "@/lib/theme/palettes";

const SHAPES: Array<{ id: VortexShape; label: string }> = [
  { id: "tensor-toroid", label: "Toróide Tensorial" },
  { id: "black-hole", label: "Buraco Negro" },
  { id: "quantum-helix", label: "Hélice Quântica" },
  { id: "harmonic-sphere", label: "Esfera Harmônica" },
  { id: "lorenz-chaos", label: "Atrator de Lorenz" },
  { id: "spiral-galaxy", label: "Galáxia Espiral" },
];

const BACKDROPS: Array<{ id: BackdropStyle; label: string }> = [
  { id: "solid", label: "Sólido Limpo" },
  { id: "radial-aurora", label: "Aurora Radial" },
  { id: "tech-grid", label: "Grade Tech" },
  { id: "dot-matrix", label: "Matriz Pontos" },
  { id: "horizon-mesh", label: "Malha Cônica" },
];

export const CustomizationDrawer: React.FC = () => {
  const open = useAraStore((s) => s.customizerOpen);
  const setOpen = useAraStore((s) => s.setCustomizerOpen);
  const vortex = useAraStore((s) => s.vortex);
  const theme = useAraStore((s) => s.theme);
  const panels = useAraStore((s) => s.panels);
  const savedProfiles = useAraStore((s) => s.savedProfiles);
  const providerConfig = useAraStore((s) => s.providerConfig);
  const imageApiProvider = useAraStore((s) => s.imageApiProvider);
  const imageApiKey = useAraStore((s) => s.imageApiKey);

  const updateVortex = useAraStore((s) => s.updateVortex);
  const toggleVortexEnabled = useAraStore((s) => s.toggleVortexEnabled);
  const updateTheme = useAraStore((s) => s.updateTheme);
  const setColorMode = useAraStore((s) => s.setColorMode);
  const applyThemePreset = useAraStore((s) => s.applyThemePreset);
  const randomizeHarmony = useAraStore((s) => s.randomizeHarmony);
  const togglePanel = useAraStore((s) => s.togglePanel);
  const triggerPanelReset = useAraStore((s) => s.triggerPanelReset);
  const updateProviderConfig = useAraStore((s) => s.updateProviderConfig);
  const setImageProvider = useAraStore((s) => s.setImageProvider);
  const saveCurrentProfile = useAraStore((s) => s.saveCurrentProfile);
  const loadSavedProfile = useAraStore((s) => s.loadSavedProfile);
  const deleteSavedProfile = useAraStore((s) => s.deleteSavedProfile);
  const exportUiConfigJson = useAraStore((s) => s.exportUiConfigJson);
  const importUiConfigJson = useAraStore((s) => s.importUiConfigJson);
  const resetUiDefaults = useAraStore((s) => s.resetUiDefaults);
  const pushDmaLog = useAraStore((s) => s.pushDmaLog);

  const [tab, setTab] = useState<"theme" | "vortex" | "panels" | "profiles" | "provider">("theme");
  const [profileName, setProfileName] = useState("");
  const [importText, setImportText] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  if (!open) return null;

  const darkPresets = THEME_PRESETS.filter((p) => p.mode === "dark");
  const lightPresets = THEME_PRESETS.filter((p) => p.mode === "light");

  const panelItems: Array<{ key: keyof PanelVisibility; label: string }> = [
    { key: "agentBar", label: "Barra Ecossistema (10 Agentes)" },
    { key: "curvature", label: "A / Curvature Harmonic (3, 7)" },
    { key: "torsion", label: "B / Torsion Tensor Jacobian 3×3" },
    { key: "swarm", label: "Ara Swarm // Grafo 10 Repos" },
    { key: "dmaStream", label: "Kernel DMA Stream // Log" },
    { key: "particleFft", label: "Textura de Partículas & Áudio FFT" },
    { key: "callouts", label: "Callouts 3D Flutuantes (HUD)" },
    { key: "chatConsole", label: "Console Chat & AraThink" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-[460px] max-w-[96vw] h-full ara-modal rounded-none border-y-0 border-r-0 flex flex-col ara-font text-xs">
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          <div>
            <div className="font-bold tracking-[0.16em]" style={{ color: "var(--ara-accent-1)" }}>
              PERSONALIZAÇÃO TOTAL // ARA OS 12+
            </div>
            <div className="text-[10px]" style={{ color: "var(--ara-text-muted)" }}>
              MODO CLARO/ESCURO · CORES GLOBAIS · VÓRTICE ON/OFF
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 ara-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Tabs */}
        <div
          className="grid grid-cols-5 text-[9.5px]"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          {[
            { id: "theme", label: "CORES", icon: Palette },
            { id: "vortex", label: "VÓRTICE", icon: Sparkles },
            { id: "panels", label: "PAINÉIS", icon: Layers },
            { id: "profiles", label: "PERFIS", icon: Bookmark },
            { id: "provider", label: "IA / API", icon: Cpu },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className="py-2.5 flex flex-col sm:flex-row items-center justify-center gap-1 border-b-2 transition-all font-bold"
              style={{
                borderBottomColor: tab === id ? "var(--ara-accent-1)" : "transparent",
                backgroundColor: tab === id ? "var(--ara-accent-1-soft)" : "transparent",
                color: tab === id ? "var(--ara-accent-1)" : "var(--ara-text-muted)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === "theme" && (
            <>
              {/* Light / Dark Master Switch */}
              <div>
                <div className="text-[10px] mb-2 font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  MODO DA INTERFACE (GLOBAL)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setColorMode("dark")}
                    className={`py-2.5 px-3 flex items-center justify-center gap-2 font-bold ${
                      theme.colorMode === "dark" ? "ara-btn-primary" : "ara-btn"
                    }`}
                  >
                    <Moon className="w-4 h-4" /> MODO ESCURO
                  </button>
                  <button
                    onClick={() => setColorMode("light")}
                    className={`py-2.5 px-3 flex items-center justify-center gap-2 font-bold ${
                      theme.colorMode === "light" ? "ara-btn-primary" : "ara-btn"
                    }`}
                  >
                    <Sun className="w-4 h-4" /> MODO CLARO
                  </button>
                </div>
              </div>

              {/* Random Harmony Button */}
              <button
                onClick={randomizeHarmony}
                className="w-full py-2 px-3 ara-btn-accent2 font-bold flex items-center justify-center gap-2"
              >
                <Shuffle className="w-3.5 h-3.5" />
                GERAR HARMONIA DE CORES ({theme.colorMode === "light" ? "CLARA" : "ESCURA"})
              </button>

              {/* Curated Dark Presets */}
              <div>
                <div className="text-[10px] mb-1.5 font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  TEMAS ESCUROS (APLICA EM TODA A INTERFACE)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {darkPresets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyThemePreset(p)}
                      className={`flex items-center justify-between p-2 text-[10px] ${
                        theme.activePresetId === p.id ? "ara-btn-accent1 font-bold" : "ara-btn"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.bgColor, border: "1px solid rgba(255,255,255,0.3)" }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentPrimary }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentSecondary }} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Light Presets */}
              <div>
                <div className="text-[10px] mb-1.5 font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  TEMAS CLAROS (APLICA EM TODA A INTERFACE)
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {lightPresets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyThemePreset(p)}
                      className={`flex items-center justify-between p-2 text-[10px] ${
                        theme.activePresetId === p.id ? "ara-btn-accent1 font-bold" : "ara-btn"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.bgColor, border: "1px solid rgba(0,0,0,0.2)" }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentPrimary }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentSecondary }} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 Global Color Pickers */}
              <div>
                <div className="text-[10px] mb-2 font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  CORES PERSONALIZADAS (APLICADAS NA INTERFACE TODA)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "FUNDO", key: "bgColor" },
                    { label: "PAINÉIS", key: "surfaceColor" },
                    { label: "TEXTO", key: "textColor" },
                    { label: "DESTAQUE 1", key: "accentPrimary" },
                    { label: "DESTAQUE 2", key: "accentSecondary" },
                    { label: "DESTAQUE 3", key: "accentTertiary" },
                  ].map((c) => (
                    <label key={c.key} className="ara-card p-2 flex flex-col gap-1 cursor-pointer">
                      <span className="text-[9px] font-bold" style={{ color: "var(--ara-text-muted)" }}>
                        {c.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={(theme as any)[c.key]}
                          onChange={(e) =>
                            updateTheme({ [c.key]: e.target.value, activePresetId: "custom" })
                          }
                          className="w-7 h-6 rounded bg-transparent cursor-pointer border-0 p-0"
                        />
                        <span className="text-[9px] uppercase">{(theme as any)[c.key]}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ambient Backdrop Selector */}
              <div>
                <div className="text-[10px] mb-1.5 font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  FUNDO AMBIENTE (IDEAL COM VÓRTICE DESATIVADO)
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {BACKDROPS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateTheme({ backdropStyle: b.id })}
                      className={`p-1.5 text-[9.5px] ${
                        theme.backdropStyle === b.id ? "ara-btn-accent2 font-bold" : "ara-btn"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-grain Visual Sliders */}
              {[
                { label: "TINGIMENTO DAS BORDAS", key: "borderTint", min: 0, max: 1, step: 0.05 },
                { label: "TINGIMENTO DAS SUPERFÍCIES", key: "surfaceTint", min: 0, max: 0.45, step: 0.02 },
                { label: "INTENSIDADE FUNDO AMBIENTE", key: "backdropIntensity", min: 0, max: 1, step: 0.05 },
                { label: "OPACIDADE DOS PAINÉIS", key: "panelOpacity", min: 0.35, max: 0.98, step: 0.02 },
                { label: "DESFOQUE GLASS (BLUR PX)", key: "panelBlur", min: 0, max: 24, step: 1 },
                { label: "ARREDONDAMENTO (PX)", key: "borderRadius", min: 0, max: 20, step: 1 },
                { label: "BRILHO / SOMBRA", key: "glowIntensity", min: 0, max: 1.5, step: 0.1 },
                { label: "ESCALA DE FONTE", key: "fontScale", min: 0.85, max: 1.2, step: 0.05 },
              ].map((ctrl) => (
                <div key={ctrl.key}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: "var(--ara-text-muted)" }}>{ctrl.label}</span>
                    <span className="font-bold" style={{ color: "var(--ara-accent-1)" }}>
                      {(theme as any)[ctrl.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={(theme as any)[ctrl.key]}
                    onChange={(e) => updateTheme({ [ctrl.key]: parseFloat(e.target.value) })}
                    className="w-full ara-range"
                  />
                </div>
              ))}

              {/* Typography & Density */}
              <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: "1px solid var(--ara-border-subtle)" }}>
                <div>
                  <div className="text-[9.5px] mb-1.5" style={{ color: "var(--ara-text-muted)" }}>
                    TIPOGRAFIA UI
                  </div>
                  <div className="flex gap-1">
                    {(["mono", "sans", "geometric"] as FontStyle[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => updateTheme({ fontStyle: f })}
                        className={`flex-1 py-1 text-[9px] uppercase ${
                          theme.fontStyle === f ? "ara-btn-accent1 font-bold" : "ara-btn"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[9.5px] mb-1.5" style={{ color: "var(--ara-text-muted)" }}>
                    DENSIDADE
                  </div>
                  <div className="flex gap-1">
                    {(["compact", "comfortable"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateTheme({ density: d })}
                        className={`flex-1 py-1 text-[9px] uppercase ${
                          theme.density === d ? "ara-btn-accent2 font-bold" : "ara-btn"
                        }`}
                      >
                        {d === "compact" ? "COMPACTA" : "AMPLA"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "vortex" && (
            <>
              {/* Master Vortex Enable / Remove Switch */}
              <div
                className="p-3.5 ara-card flex items-center justify-between gap-3"
                style={{ borderColor: vortex.enabled ? "var(--ara-accent-2-border)" : "var(--ara-accent-1-border)" }}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    {vortex.enabled ? (
                      <Eye className="w-4 h-4" style={{ color: "var(--ara-accent-2)" }} />
                    ) : (
                      <EyeOff className="w-4 h-4" style={{ color: "var(--ara-accent-1)" }} />
                    )}
                    <span>VÓRTICE 3D WEBGL</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--ara-text-muted)" }}>
                    {vortex.enabled
                      ? "Ativo na GPU. Desative para interface 100% limpa e 0% de uso WebGL."
                      : "Removido da tela (0% GPU). Usando fundo ambiente configurável."}
                  </div>
                </div>
                <button
                  onClick={toggleVortexEnabled}
                  className={`px-3 py-1.5 font-bold text-[10px] shrink-0 ${
                    vortex.enabled ? "ara-btn-accent1" : "ara-btn-primary"
                  }`}
                >
                  {vortex.enabled ? "REMOVER" : "ATIVAR"}
                </button>
              </div>

              <div className={!vortex.enabled ? "opacity-45 pointer-events-none space-y-4" : "space-y-4"}>
                <div>
                  <label className="text-[10px] block mb-2" style={{ color: "var(--ara-text-muted)" }}>
                    GEOMETRIA DO VÓRTICE 3D
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHAPES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          updateVortex({ shape: s.id });
                          pushDmaLog("morvat", `Formato do vórtice alterado → ${s.label}.`);
                        }}
                        className={`p-2 text-left text-[10px] ${
                          vortex.shape === s.id ? "ara-btn-accent1 font-bold" : "ara-btn"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { label: "OPACIDADE DO VÓRTICE", key: "opacity", min: 0.15, max: 1.0, step: 0.05, suffix: "" },
                  { label: "PARTÍCULAS GPU", key: "particleCount", min: 15000, max: 120000, step: 5000, suffix: "" },
                  { label: "VELOCIDADE ORBITAL", key: "speed", min: 0.1, max: 3.0, step: 0.1, suffix: "x" },
                  { label: "TURBULÊNCIA CURL", key: "turbulence", min: 0.0, max: 2.0, step: 0.05, suffix: "" },
                  { label: "TWIST / TORÇÃO", key: "twistDeg", min: 0, max: 180, step: 1, suffix: "°" },
                  { label: "NÚCLEO CONTRASTADO", key: "whiteCoreMix", min: 0, max: 1, step: 0.05, suffix: "" },
                  { label: "NITIDEZ / GRÃO", key: "sharpness", min: 0.5, max: 2.4, step: 0.05, suffix: "x" },
                  { label: "TAMANHO PARTÍCULA", key: "particleSize", min: 0.3, max: 1.8, step: 0.05, suffix: "x" },
                  { label: "TONALIDADE (HUE)", key: "hue", min: 0, max: 360, step: 1, suffix: "°" },
                ].map((ctrl) => (
                  <div key={ctrl.key}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: "var(--ara-text-muted)" }}>{ctrl.label}</span>
                      <span className="font-bold" style={{ color: "var(--ara-accent-2)" }}>
                        {(vortex as any)[ctrl.key]}
                        {ctrl.suffix}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={(vortex as any)[ctrl.key]}
                      onChange={(e) => updateVortex({ [ctrl.key]: parseFloat(e.target.value) })}
                      className="w-full ara-range"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "panels" && (
            <div className="space-y-3">
              <button
                onClick={triggerPanelReset}
                className="w-full py-2 ara-btn-accent2 font-bold text-[10px]"
              >
                RESETAR POSIÇÕES DOS PAINÉIS ARRASTADOS
              </button>

              <div className="space-y-2">
                {panelItems.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2.5 ara-card cursor-pointer"
                  >
                    <span className="text-[10.5px]">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={panels[item.key]}
                      onChange={() => togglePanel(item.key)}
                      className="w-4 h-4"
                      style={{ accentColor: "var(--ara-accent-1)" }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === "profiles" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  SALVAR TEMA &amp; LAYOUT ATUAL
                </div>
                <div className="flex gap-2">
                  <input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ex: Modo Claro Minimal Sem Vórtice"
                    className="flex-1 ara-input px-2.5 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      saveCurrentProfile(profileName);
                      setProfileName("");
                    }}
                    className="px-3 py-1.5 ara-btn-primary font-bold text-[10px]"
                  >
                    SALVAR
                  </button>
                </div>
              </div>

              {savedProfiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold" style={{ color: "var(--ara-text-muted)" }}>
                    MEUS PERFIS SALVOS ({savedProfiles.length})
                  </div>
                  {savedProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 ara-card flex items-center justify-between gap-2"
                    >
                      <button
                        onClick={() => loadSavedProfile(p.id)}
                        className="flex-1 text-left flex items-center gap-2"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: p.theme.accentPrimary }}
                        />
                        <div>
                          <div className="font-bold text-[10.5px]">{p.name}</div>
                          <div className="text-[9px]" style={{ color: "var(--ara-text-muted)" }}>
                            {p.theme.colorMode.toUpperCase()} · Vórtice {p.vortex.enabled ? "ON" : "OFF"}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSavedProfile(p.id)}
                        className="p-1.5 ara-btn"
                        title="Excluir perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="pt-3 space-y-2"
                style={{ borderTop: "1px solid var(--ara-border-subtle)" }}
              >
                <div className="text-[10px] font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  EXPORTAR / IMPORTAR CONFIGURAÇÃO JSON
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const json = exportUiConfigJson();
                      navigator.clipboard.writeText(json);
                      setStatusMsg("JSON da interface copiado para a área de transferência!");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 ara-btn-accent2 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> COPIAR JSON
                  </button>
                  <button
                    onClick={() => {
                      if (importUiConfigJson(importText)) {
                        setStatusMsg("Configuração aplicada com sucesso!");
                      } else {
                        setStatusMsg("JSON inválido.");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 ara-btn-accent3 font-bold"
                  >
                    <Upload className="w-3.5 h-3.5" /> APLICAR JSON
                  </button>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Cole aqui um JSON exportado para restaurar cores, modo e painéis..."
                  rows={4}
                  className="w-full ara-input p-2 text-[10px]"
                />
                {statusMsg && (
                  <div className="text-[10px] font-bold" style={{ color: "var(--ara-accent-2)" }}>
                    {statusMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "provider" && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] block mb-1 font-bold" style={{ color: "var(--ara-text-muted)" }}>
                  MOTOR DE IA (TRANSFORMERS &amp; PROVEDORES)
                </label>
                <select
                  value={providerConfig.provider}
                  onChange={(e) => updateProviderConfig({ provider: e.target.value as any })}
                  className="w-full ara-input p-2 text-xs"
                >
                  <option value="transformers-web">Hugging Face Transformers.js (No Navegador · WebGPU/WASM)</option>
                  <option value="transformers-python">PyTorch Hugging Face Transformers (backend-python/server.py)</option>
                  <option value="ollama">Ollama Local (http://localhost:11434)</option>
                  <option value="openai">OpenAI / OpenRouter / Groq / LM Studio</option>
                  <option value="gemini">Google Gemini API</option>
                  <option value="anthropic">Anthropic Claude API</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] block mb-1" style={{ color: "var(--ara-text-muted)" }}>
                  ID DO MODELO (HUGGING FACE REPO OU NOME DO MODELO)
                </label>
                <input
                  type="text"
                  value={providerConfig.model || ""}
                  onChange={(e) => updateProviderConfig({ model: e.target.value })}
                  placeholder="ex: onnx-community/Qwen2.5-1.5B-Instruct"
                  className="w-full ara-input p-2 text-xs"
                />
              </div>

              {providerConfig.provider === "transformers-web" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] block mb-1" style={{ color: "var(--ara-text-muted)" }}>
                        ACELERAÇÃO
                      </label>
                      <select
                        value={providerConfig.device || "auto"}
                        onChange={(e) => updateProviderConfig({ device: e.target.value as any })}
                        className="w-full ara-input p-2 text-xs"
                      >
                        <option value="auto">Auto (WebGPU → WASM)</option>
                        <option value="webgpu">WebGPU (GPU)</option>
                        <option value="wasm">WebAssembly (CPU)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1" style={{ color: "var(--ara-text-muted)" }}>
                        QUANTIZAÇÃO (DTYPE)
                      </label>
                      <select
                        value={providerConfig.dtype || "q4f16"}
                        onChange={(e) => updateProviderConfig({ dtype: e.target.value as any })}
                        className="w-full ara-input p-2 text-xs"
                      >
                        <option value="q4f16">q4f16 (WebGPU Rápido)</option>
                        <option value="q4">q4 (Compatível CPU/GPU)</option>
                        <option value="q8">q8 (Alta Precisão)</option>
                        <option value="fp16">fp16 (Máxima Precisão)</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-2.5 ara-card cursor-pointer">
                    <div>
                      <div className="text-[10.5px] font-bold">EMBEDDINGS NEURAIS NO MNEMOS</div>
                      <div className="text-[9.5px]" style={{ color: "var(--ara-text-muted)" }}>
                        Usa Transformer Xenova/all-MiniLM-L6-v2 (~23MB) para busca vetorial real
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(providerConfig.neuralMemoryEnabled)}
                      onChange={(e) => updateProviderConfig({ neuralMemoryEnabled: e.target.checked })}
                      className="w-4 h-4"
                      style={{ accentColor: "var(--ara-accent-1)" }}
                    />
                  </label>
                </>
              )}

              {(providerConfig.provider === "transformers-python" ||
                providerConfig.provider === "ollama" ||
                providerConfig.provider === "openai") && (
                <div>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--ara-text-muted)" }}>
                    BASE URL DO SERVIDOR
                  </label>
                  <input
                    type="text"
                    value={providerConfig.baseUrl || ""}
                    onChange={(e) => updateProviderConfig({ baseUrl: e.target.value })}
                    placeholder={
                      providerConfig.provider === "transformers-python"
                        ? "http://localhost:8000"
                        : providerConfig.provider === "ollama"
                        ? "http://localhost:11434"
                        : "https://api.openai.com/v1"
                    }
                    className="w-full ara-input p-2 text-xs"
                  />
                </div>
              )}

              {(providerConfig.provider === "openai" ||
                providerConfig.provider === "gemini" ||
                providerConfig.provider === "anthropic") && (
                <div>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--ara-text-muted)" }}>
                    API KEY
                  </label>
                  <input
                    type="password"
                    value={providerConfig.apiKey || ""}
                    onChange={(e) => updateProviderConfig({ apiKey: e.target.value })}
                    placeholder="Cole sua chave de API..."
                    className="w-full ara-input p-2 text-xs"
                  />
                </div>
              )}

              <div
                className="pt-3 space-y-2"
                style={{ borderTop: "1px solid var(--ara-border-subtle)" }}
              >
                <label className="text-[10px] block" style={{ color: "var(--ara-text-muted)" }}>
                  MOTOR DE IMAGENS (VINTA)
                </label>
                <select
                  value={imageApiProvider}
                  onChange={(e) => setImageProvider(e.target.value as any)}
                  className="w-full ara-input p-2 text-xs"
                >
                  <option value="vinta-local">Vinta Procedural Neural Shader (Local Offline)</option>
                  <option value="openai">OpenAI DALL-E 3 API</option>
                </select>
                {imageApiProvider === "openai" && (
                  <input
                    type="password"
                    value={imageApiKey}
                    onChange={(e) => setImageProvider("openai", e.target.value)}
                    placeholder="OpenAI API Key para DALL-E 3"
                    className="w-full ara-input p-2 text-xs"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--ara-border-subtle)" }}
        >
          <button
            onClick={resetUiDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 ara-btn text-[10px]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESTAURAR PADRÃO
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 ara-btn-primary font-bold text-[10px]"
          >
            CONCLUIR
          </button>
        </div>
      </div>
    </div>
  );
};
