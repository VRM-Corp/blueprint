"use client";

import { useCallback, useRef } from "react";

type Pos = { x: number; y: number; rotation: number };

const MIN_DIST = 12;

function spreadPosition(existing: Map<string, Pos>): { x: number; y: number } {
  const positions = Array.from(existing.values());
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = 3 + Math.random() * 70;
    const y = 5 + Math.random() * 70;
    const tooClose = positions.some(
      (p) => Math.abs(p.x - x) < MIN_DIST && Math.abs(p.y - y) < MIN_DIST
    );
    if (!tooClose) return { x, y };
  }
  return { x: 3 + Math.random() * 70, y: 5 + Math.random() * 70 };
}

export function useBubblePositions() {
  const positionsRef = useRef<Map<string, Pos>>(new Map());

  const ensurePosition = useCallback((id: string): Pos => {
    const existing = positionsRef.current.get(id);
    if (existing) return existing;
    const { x, y } = spreadPosition(positionsRef.current);
    const pos: Pos = { x, y, rotation: (Math.random() - 0.5) * 8 };
    positionsRef.current.set(id, pos);
    return pos;
  }, []);

  const handleDragEnd = useCallback((id: string, px: number, py: number) => {
    const xPct = (px / window.innerWidth) * 100;
    const yPct = (py / window.innerHeight) * 100;
    const prev = positionsRef.current.get(id);
    positionsRef.current.set(id, {
      x: xPct,
      y: yPct,
      rotation: prev?.rotation ?? 0,
    });
  }, []);

  const removePosition = useCallback((id: string) => {
    positionsRef.current.delete(id);
  }, []);

  return { ensurePosition, handleDragEnd, removePosition };
}
