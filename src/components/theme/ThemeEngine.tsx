"use client";

import { useEffect } from "react";
import { useAraStore } from "@/store/useAraStore";
import { computeThemeVariables } from "@/lib/theme/palettes";

export const ThemeEngine: React.FC = () => {
  const theme = useAraStore((s) => s.theme);
  const setCommandPaletteOpen = useAraStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    const root = document.documentElement;
    const vars = computeThemeVariables(theme);
    Object.entries(vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });

    root.classList.toggle("dark", theme.colorMode === "dark");
    root.classList.toggle("light", theme.colorMode === "light");
    root.dataset.theme = theme.colorMode;
    root.dataset.density = theme.density;
    root.style.fontSize = `${Math.round(theme.fontScale * 16)}px`;
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen]);

  return null;
};
