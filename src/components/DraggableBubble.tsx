"use client";

import { useLayoutEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  x: number;
  y: number;
  rotation: number;
  zIndex?: number;
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
  zIndex,
  onDragEnd,
  onDelete,
  className = "",
  style,
  children,
}: Props) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // When parent updates CSS position (after a drag was persisted to the ref),
  // reset the drag offset so visual position = new CSS position + 0.
  // useLayoutEffect ensures this happens before the browser paints.
  useLayoutEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [x, y, dragX, dragY]);

  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing ${className}`}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete();
      }}
      style={{ left: `${x}%`, top: `${y}%`, zIndex, ...style, x: dragX, y: dragY }}
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
      onDragEnd={() => {
        const newXPx = (x / 100) * window.innerWidth + dragX.get();
        const newYPx = (y / 100) * window.innerHeight + dragY.get();
        onDragEnd(newXPx, newYPx);
      }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      {children}
    </motion.div>
  );
}
