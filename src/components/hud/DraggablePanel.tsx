"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useAraStore } from "@/store/useAraStore";

interface DraggablePanelProps {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
  accentBorder?: string;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  title,
  subtitle,
  subtitleColor = "var(--ara-accent-2)",
  onClose,
  className = "",
  children,
  accentBorder,
}) => {
  const panelResetSignal = useAraStore((s) => s.panelResetSignal);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; ox: number; oy: number }>({
    active: false,
    startX: 0,
    startY: 0,
    ox: 0,
    oy: 0,
  });

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [panelResetSignal]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.active) return;
      setOffset({
        x: dragRef.current.ox + (ev.clientX - dragRef.current.startX),
        y: dragRef.current.oy + (ev.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current.active = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className={`pointer-events-auto ara-panel ara-font ${className}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        borderColor: accentBorder || undefined,
      }}
    >
      <div
        onMouseDown={onMouseDown}
        className="flex items-center justify-between px-3 py-1.5 cursor-move select-none"
        style={{ borderBottom: "1px solid var(--ara-border-subtle)" }}
      >
        <span
          className="text-[10px] tracking-[0.14em] font-semibold uppercase truncate"
          style={{ color: "var(--ara-text)" }}
        >
          {title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {subtitle && (
            <span className="text-[10px] tracking-wider font-semibold" style={{ color: subtitleColor }}>
              {subtitle}
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-0.5 rounded transition-colors opacity-65 hover:opacity-100"
              style={{ color: "var(--ara-text-muted)" }}
              title="Ocultar painel"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <div className="ara-panel-body">{children}</div>
    </div>
  );
};
