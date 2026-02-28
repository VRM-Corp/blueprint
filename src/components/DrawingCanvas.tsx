"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#4a7fff" },
  { name: "Cyan", value: "#00d4ff" },
  { name: "Pink", value: "#ff6baa" },
  { name: "Yellow", value: "#ffd93d" },
];

type Props = {
  onSubmit: (dataUrl: string) => void;
  submitting?: boolean;
};

export default function DrawingCanvas({ onSubmit, submitting }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0].value);
  const [lineWidth, setLineWidth] = useState(3);
  const [hasContent, setHasContent] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const touch = "touches" in e ? e.touches[0] || e.changedTouches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const pos = getPos(e);
      lastPos.current = pos;
      setIsDrawing(true);
      setHasContent(true);

      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [color, lineWidth, getPos]
  );

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    },
    [isDrawing, color, lineWidth, getPos]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");
    onSubmit(dataUrl);
    clear();
  }, [onSubmit, clear]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-white/10"
        style={{
          aspectRatio: "1",
          background: "rgba(255,255,255,0.03)",
          touchAction: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              className="w-8 h-8 rounded-full border-2 transition-transform"
              style={{
                backgroundColor: c.value,
                borderColor: color === c.value ? "white" : "transparent",
                transform: color === c.value ? "scale(1.2)" : "scale(1)",
              }}
              onClick={() => setColor(c.value)}
              aria-label={c.name}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              className="flex items-center justify-center w-8 h-8 rounded-full border transition-colors"
              style={{
                borderColor:
                  lineWidth === w ? "white" : "rgba(255,255,255,0.2)",
                background:
                  lineWidth === w
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
              }}
              onClick={() => setLineWidth(w)}
              aria-label={`Line width ${w}`}
            >
              <div
                className="rounded-full bg-white"
                style={{ width: w * 2, height: w * 2 }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={clear}
          className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 text-sm font-medium tracking-wider uppercase transition-colors hover:bg-white/5 active:bg-white/10"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!hasContent || submitting}
          className="flex-1 py-3 rounded-xl text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-30"
          style={{
            background: hasContent ? "rgba(74, 127, 255, 0.8)" : "rgba(255,255,255,0.1)",
            color: "white",
          }}
        >
          {submitting ? "Sending..." : "Send Drawing"}
        </button>
      </div>
    </div>
  );
}
