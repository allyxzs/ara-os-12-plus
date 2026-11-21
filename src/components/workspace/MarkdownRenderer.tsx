"use client";

import React, { useState } from "react";
import { Copy, Check, Download, ExternalLink } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onOpenHtmlPreview?: (html: string, title: string) => void;
}

const EXT_MAP: Record<string, string> = {
  html: "html",
  css: "css",
  javascript: "js",
  js: "js",
  typescript: "ts",
  ts: "ts",
  tsx: "tsx",
  jsx: "jsx",
  python: "py",
  py: "py",
  rust: "rs",
  sql: "sql",
  json: "json",
  bash: "sh",
  sh: "sh",
  glsl: "glsl",
};

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={keyIdx++} className="font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 text-[0.86em] ara-font"
          style={{
            borderRadius: "4px",
            backgroundColor: "var(--ara-accent-2-soft)",
            color: "var(--ara-accent-2)",
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={keyIdx++} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={keyIdx++}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="underline font-semibold"
            style={{ color: "var(--ara-accent-2)" }}
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

const CodeBlock: React.FC<{
  language: string;
  code: string;
  onOpenHtmlPreview?: (html: string, title: string) => void;
}> = ({ language, code, onOpenHtmlPreview }) => {
  const [copied, setCopied] = useState(false);
  const lang = (language || "text").toLowerCase();
  const isHtmlPreviewable =
    lang === "html" && /(<!doctype|<html|<body|<style|<div)/i.test(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const ext = EXT_MAP[lang] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ara-code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="my-2.5 overflow-hidden border"
      style={{
        borderRadius: "var(--ara-radius)",
        borderColor: "var(--ara-border-subtle)",
        backgroundColor: "var(--ara-code-bg)",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 ara-font text-[10px]"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.04)",
          color: "#94a3b8",
        }}
      >
        <span className="uppercase tracking-widest font-bold" style={{ color: "var(--ara-accent-2)" }}>
          {lang}
        </span>
        <div className="flex items-center gap-1.5">
          {isHtmlPreviewable && onOpenHtmlPreview && (
            <button
              onClick={() => {
                const titleMatch = code.match(/<title>([^<]+)<\/title>/i);
                const fullHtml = /<html/i.test(code)
                  ? code
                  : `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/></head><body>${code}</body></html>`;
                onOpenHtmlPreview(fullHtml, titleMatch ? titleMatch[1] : "Ara Live Preview");
              }}
              className="px-2 py-0.5 rounded flex items-center gap-1 font-bold"
              style={{
                backgroundColor: "var(--ara-accent-2-soft)",
                color: "var(--ara-accent-2)",
                border: "1px solid var(--ara-accent-2-border)",
              }}
            >
              <ExternalLink className="w-3 h-3" /> PREVIEW
            </button>
          )}
          <button
            onClick={handleDownload}
            className="px-2 py-0.5 rounded flex items-center gap-1 hover:text-white transition-colors"
            title="Baixar arquivo"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={handleCopy}
            className="px-2 py-0.5 rounded flex items-center gap-1 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "COPIADO" : "COPIAR"}</span>
          </button>
        </div>
      </div>
      <pre
        className="p-3 overflow-x-auto text-[12px] leading-relaxed font-mono"
        style={{ color: "var(--ara-code-text)" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onOpenHtmlPreview,
}) => {
  if (!content) return null;

  const segments: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
  const lines = content.split("\n");
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let textBuf: string[] = [];

  for (const line of lines) {
    const fence = line.match(/^```([a-zA-Z0-9_+-]*)\s*$/);
    if (fence) {
      if (!inCode) {
        if (textBuf.length) {
          segments.push({ type: "text", content: textBuf.join("\n") });
          textBuf = [];
        }
        inCode = true;
        codeLang = fence[1] || "text";
        codeBuf = [];
      } else {
        segments.push({ type: "code", content: codeBuf.join("\n"), lang: codeLang });
        inCode = false;
        codeLang = "";
        codeBuf = [];
      }
    } else if (inCode) {
      codeBuf.push(line);
    } else {
      textBuf.push(line);
    }
  }

  if (inCode && codeBuf.length) {
    segments.push({ type: "code", content: codeBuf.join("\n"), lang: codeLang });
  } else if (textBuf.length) {
    segments.push({ type: "text", content: textBuf.join("\n") });
  }

  return (
    <div className="space-y-1.5 break-words">
      {segments.map((seg, sIdx) => {
        if (seg.type === "code") {
          return (
            <CodeBlock
              key={sIdx}
              language={seg.lang || "text"}
              code={seg.content}
              onOpenHtmlPreview={onOpenHtmlPreview}
            />
          );
        }

        const blockLines = seg.content.split("\n");
        return (
          <div key={sIdx} className="space-y-1">
            {blockLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={lIdx} className="text-[13.5px] font-bold pt-1.5" style={{ color: "var(--ara-accent-2)" }}>
                    {renderInline(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={lIdx} className="text-[15px] font-bold pt-2" style={{ color: "var(--ara-accent-1)" }}>
                    {renderInline(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={lIdx} className="text-[16.5px] font-bold pt-2">
                    {renderInline(trimmed.slice(2))}
                  </h1>
                );
              }
              if (trimmed === "---" || trimmed === "***") {
                return (
                  <hr
                    key={lIdx}
                    className="my-2"
                    style={{ borderColor: "var(--ara-border-subtle)" }}
                  />
                );
              }
              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={lIdx}
                    className="pl-3 py-1 my-1 border-l-2 italic text-[12.5px]"
                    style={{
                      borderColor: "var(--ara-accent-1)",
                      color: "var(--ara-text-muted)",
                    }}
                  >
                    {renderInline(trimmed.slice(2))}
                  </blockquote>
                );
              }
              if (/^[-*•]\s+/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex gap-2 pl-1 leading-relaxed">
                    <span style={{ color: "var(--ara-accent-1)" }}>•</span>
                    <span className="flex-1">{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</span>
                  </div>
                );
              }
              const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex gap-2 pl-1 leading-relaxed">
                    <span className="font-bold shrink-0" style={{ color: "var(--ara-accent-2)" }}>
                      {numMatch[1]}
                    </span>
                    <span className="flex-1">{renderInline(numMatch[2])}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
