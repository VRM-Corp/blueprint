"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { EVENT_CONFIG } from "@/lib/config";

type Props = {
  text: string;
  id: string;
  onExpire: (id: string) => void;
};

const OFF_SCREEN_PX = 400;
const durationSec = EVENT_CONFIG.messageDurationMs / 1000;

function getFontSize(length: number) {
  if (length > 80) return "1rem";
  if (length > 40) return "1.25rem";
  return "1.5rem";
}

export default function MessageBubble({ text, id, onExpire }: Props) {
  const style = useMemo(() => {
    const y = 10 + Math.random() * 70;
    const fromLeft = Math.random() > 0.5;
    const wobble = (Math.random() - 0.5) * 8;
    const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
    return {
      y,
      fromLeft,
      wobble,
      fontSize: getFontSize(text.length),
      startX: fromLeft ? -OFF_SCREEN_PX : screenW + 100,
      endX: fromLeft ? screenW + 100 : -OFF_SCREEN_PX,
    };
  }, [text.length]);

  useEffect(() => {
    const timer = setTimeout(() => onExpire(id), EVENT_CONFIG.messageDurationMs);
    return () => clearTimeout(timer);
  }, [id, onExpire]);

  return (
    <motion.div
      className="absolute pointer-events-none px-8 py-4 rounded-2xl max-w-lg"
      style={{
        top: `${style.y}%`,
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        fontFamily: "var(--font-inter)",
      }}
      initial={{ x: style.startX, opacity: 0 }}
      animate={{
        x: style.endX,
        opacity: [0, 1, 1, 1, 0],
        y: [0, style.wobble * 3, -style.wobble * 2, style.wobble, 0],
      }}
      transition={{
        duration: durationSec,
        ease: "linear",
        opacity: { times: [0, 0.05, 0.3, 0.9, 1] },
        y: { duration: durationSec, ease: "easeInOut" },
      }}
    >
      <p
        className="text-white font-light tracking-wide leading-relaxed"
        style={{ fontSize: style.fontSize }}
      >
        {text}
      </p>
    </motion.div>
  );
}
