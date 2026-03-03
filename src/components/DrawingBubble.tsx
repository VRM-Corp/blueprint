"use client";

import DraggableBubble from "./DraggableBubble";

type Props = {
  imageData: string;
  x: number;
  y: number;
  rotation: number;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
};

export default function DrawingBubble({ imageData, ...bubble }: Props) {
  return (
    <DraggableBubble
      {...bubble}
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--glass-4)",
        border: "1px solid var(--glass-8)",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageData}
        alt=""
        className="w-48 h-48 object-contain select-none"
        draggable={false}
      />
    </DraggableBubble>
  );
}
