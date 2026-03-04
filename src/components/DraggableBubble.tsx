"use client";

import { useLayoutEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

type Props = {
  x: number;
  y: number;
  rotation: number;
  zIndex?: number;
  staggerIndex?: number;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function DraggableBubble({
  x,
  y,
  rotation,
  zIndex,
  staggerIndex = 0,
  onDragEnd,
  onDelete,
  className = "",
  style,
  children,
}: Props) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useLayoutEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [x, y, dragX, dragY]);

  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing bubble-enter bubble-glow ${className}`}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete();
      }}
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          zIndex,
          "--i": staggerIndex,
          "--rotate": `${rotation}deg`,
          ...style,
          x: dragX,
          y: dragY,
        } as unknown as CSSProperties
      }
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 9999 }}
      onDragEnd={() => {
        const newXPx = (x / 100) * window.innerWidth + dragX.get();
        const newYPx = (y / 100) * window.innerHeight + dragY.get();
        onDragEnd(newXPx, newYPx);
      }}
    >
      {children}
    </motion.div>
  );
}
