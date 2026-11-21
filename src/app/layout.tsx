import type { Metadata } from "next";
import "./globals.css";
import { ThemeEngine } from "@/components/theme/ThemeEngine";

export const metadata: Metadata = {
  title: "ARA OS 12+ v3 // Transformers Neural Multi-Agent OS",
  description:
    "Sistema Operacional de IA Multi-Agente (10 agentes) movido por Hugging Face Transformers reais (WebGPU/WASM + PyTorch) com streaming token-a-token, AraThink <think>, Modo Claro/Escuro e Vórtice 3D opcional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" data-theme="dark" data-density="comfortable">
      <body className="antialiased">
        <ThemeEngine />
        {children}
      </body>
    </html>
  );
}
