"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EVENT_CONFIG } from "@/lib/config";

type Props = {
  imageData: string;
  id: string;
  onExpire: (id: string) => void;
};

export default function DrawingBubble({ imageData, id, onExpire }: Props) {
  const [pos] = useState(() => ({
    x: 5 + Math.random() * 65,
    y: 5 + Math.random() * 55,
    rotation: (Math.random() - 0.5) * 12,
  }));

  useEffect(() => {
    const timer = setTimeout(() => onExpire(id), EVENT_CONFIG.drawingDurationMs);
    return () => clearTimeout(timer);
  }, [id, onExpire]);

  return (
    <motion.div
      className="absolute pointer-events-none rounded-xl overflow-hidden"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)",
      }}
      initial={{ opacity: 0, scale: 0, rotate: pos.rotation * 2 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.05, 1, 0.8],
        rotate: pos.rotation,
      }}
      transition={{
        duration: EVENT_CONFIG.drawingDurationMs / 1000,
        times: [0, 0.05, 0.85, 1],
        scale: {
          type: "spring",
          stiffness: 200,
          damping: 15,
          times: [0, 0.08, 0.85, 1],
        },
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageData}
        alt=""
        className="w-48 h-48 object-contain"
        draggable={false}
      />
    </motion.div>
  );
}
