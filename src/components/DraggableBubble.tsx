"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  x: number;
  y: number;
  rotation: number;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

export default function DraggableBubble({
  x,
  y,
  rotation,
  onDragEnd,
  onDelete,
  className = "",
  style,
  children,
}: Props) {
  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing ${className}`}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete();
      }}
      style={{ left: `${x}%`, top: `${y}%`, ...style }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
      transition={{
        duration: 0.5,
        scale: { type: "spring", stiffness: 220, damping: 18 },
        opacity: { duration: 0.4 },
      }}
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => onDragEnd(info.point.x, info.point.y)}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      {children}
    </motion.div>
  );
}
