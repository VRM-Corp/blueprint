"use client";

import { useEffect, useState } from "react";

type ParticleData = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

function edgeParticle(): { x: number; y: number } {
  const cx = 50;
  const cy = 45;
  const angle = Math.random() * Math.PI * 2;
  const r = 30 + Math.random() * 30;
  return {
    x: Math.max(0, Math.min(100, cx + r * Math.cos(angle))),
    y: Math.max(0, Math.min(100, cy + r * Math.sin(angle))),
  };
}

export default function FloatingElements() {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => {
        const pos = edgeParticle();
        return {
          id: i,
          x: pos.x,
          y: pos.y,
          size: 3 + Math.random() * 6,
          delay: Math.random() * 8,
          duration: 3 + Math.random() * 5,
        };
      })
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
            animation: `particle-pulse ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
            contain: "strict",
          }}
        />
      ))}
    </div>
  );
}
