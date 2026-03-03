"use client";

import { useEffect, useRef } from "react";

const GRID_MAJOR = 60;
const GRID_MINOR = 12;

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const bgColor = rootStyle.getPropertyValue("--navy").trim();
    const minorLine = rootStyle.getPropertyValue("--grid-line-minor").trim();
    const majorLine = rootStyle.getPropertyValue("--grid-line-major").trim();

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const { width, height } = canvas;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = minorLine;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += GRID_MINOR) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += GRID_MINOR) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = majorLine;
      ctx.lineWidth = 0.8;
      for (let x = 0; x < width; x += GRID_MAJOR) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += GRID_MAJOR) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
