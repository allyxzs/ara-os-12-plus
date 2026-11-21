"use client";

import React, { useState } from "react";
import { X, Monitor, Smartphone, Download } from "lucide-react";
import { useAraStore } from "@/store/useAraStore";

export const WebPreviewModal: React.FC = () => {
  const html = useAraStore((s) => s.previewHtml);
  const title = useAraStore((s) => s.previewTitle);
  const openWebPreview = useAraStore((s) => s.openWebPreview);
  const [mobile, setMobile] = useState(false);

  if (!html) return null;

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "ara-site"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && openWebPreview(null)}
    >
      <div className="w-[1040px] max-w-full h-[86vh] ara-modal flex flex-col overflow-hidden ara-font text-xs">
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
        >
          <span className="font-bold tracking-wider" style={{ color: "var(--ara-accent-2)" }}>
            LUMETA LIVE SANDBOX // {title}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobile(false)}
              className={`p-1.5 ${!mobile ? "ara-btn-accent2" : "ara-btn"}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobile(true)}
              className={`p-1.5 ${mobile ? "ara-btn-accent2" : "ara-btn"}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={downloadHtml}
              className="px-2.5 py-1 ara-btn-accent1 font-bold flex items-center gap-1 text-[10px]"
            >
              <Download className="w-3 h-3" /> BAIXAR HTML
            </button>
            <button onClick={() => openWebPreview(null)} className="p-1 ara-btn">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          className="flex-1 flex justify-center overflow-auto p-3"
          style={{ backgroundColor: "var(--ara-input-bg)" }}
        >
          <iframe
            title={title}
            srcDoc={html}
            sandbox="allow-scripts"
            className="bg-black rounded border transition-all h-full"
            style={{ width: mobile ? "390px" : "100%", borderColor: "var(--ara-border-subtle)" }}
          />
        </div>
      </div>
    </div>
  );
};
