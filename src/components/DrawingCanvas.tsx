"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/SubmitButton";

const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#111111" },
  { name: "Blue", value: "#4a7fff" },
  { name: "Cyan", value: "#00d4ff" },
  { name: "Pink", value: "#ff6baa" },
  { name: "Yellow", value: "#ffd93d" },
];

const BG_COLORS = [
  { name: "Dark", value: "transparent" },
  { name: "White", value: "#ffffff" },
  { name: "Yellow", value: "#f5e6a3" },
  { name: "Black", value: "#111111" },
];

type Props = {
  onSubmit: (dataUrl: string) => void;
  isSubmitting?: boolean;
};

export default function DrawingCanvas({ onSubmit, isSubmitting }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0].value);
  const [bgColor, setBgColor] = useState(BG_COLORS[0].value);
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
    if (bgColor === "transparent") {
      onSubmit(canvas.toDataURL("image/png"));
    } else {
      const tmp = document.createElement("canvas");
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      const ctx = tmp.getContext("2d")!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(canvas, 0, 0);
      onSubmit(tmp.toDataURL("image/png"));
    }
    clear();
  }, [onSubmit, clear, bgColor]);

  return (
    <div className="flex flex-col gap-4 w-full flex-1 min-h-0">
      <div
        className="relative w-full rounded-[14px] overflow-hidden flex-1 min-h-0"
        style={{
          touchAction: "none",
          background: "var(--glass-2)",
          border: "1px solid var(--glass-8)",
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                backgroundColor: c.value,
                boxShadow:
                  color === c.value
                    ? `0 0 0 2.5px rgba(10,22,40,0.95), 0 0 0 4px ${c.value}`
                    : "none",
                transform: color === c.value ? "scale(1.1)" : "scale(1)",
              }}
              onClick={() => setColor(c.value)}
              aria-label={c.name}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
              style={{
                background:
                  lineWidth === w ? "var(--glass-10)" : "transparent",
                border:
                  lineWidth === w
                    ? "1px solid var(--glass-15)"
                    : "1px solid transparent",
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
        <Button onClick={clear} className="interact-btn-outline flex-1">
          <Eraser className="size-4" />
          Clear
        </Button>
        <SubmitButton
          onClick={handleSubmit}
          disabled={!hasContent}
          isSubmitting={isSubmitting}
          className="flex-1"
        />
      </div>
    </div>
  );
}
