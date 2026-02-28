"use client";

import { useMemo } from "react";

function Particle({
  x,
  y,
  size,
  delay,
  duration,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background:
          "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
        animation: `particle-pulse ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

function edgeParticle(): { x: number; y: number } {
  const cx = 50;
  const cy = 45;
  const angle = Math.random() * Math.PI * 2;
  const minR = 30;
  const r = minR + Math.random() * 30;
  return {
    x: Math.max(0, Math.min(100, cx + r * Math.cos(angle))),
    y: Math.max(0, Math.min(100, cy + r * Math.sin(angle))),
  };
}

export default function FloatingElements() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const pos = edgeParticle();
        return {
          id: i,
          x: pos.x,
          y: pos.y,
          size: 3 + Math.random() * 6,
          delay: Math.random() * 8,
          duration: 3 + Math.random() * 5,
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <Particle
          key={p.id}
          x={p.x}
          y={p.y}
          size={p.size}
          delay={p.delay}
          duration={p.duration}
        />
      ))}
    </div>
  );
}
