"use client";

import DraggableBubble from "./DraggableBubble";

type Props = {
  text: string;
  x: number;
  y: number;
  rotation: number;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
};

function getFontSize(length: number) {
  if (length > 80) return "1rem";
  if (length > 40) return "1.25rem";
  return "1.5rem";
}

export default function MessageBubble({ text, ...bubble }: Props) {
  return (
    <DraggableBubble
      {...bubble}
      className="px-8 py-4 rounded-2xl max-w-lg"
      style={{
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        fontFamily: "var(--font-inter)",
      }}
    >
      <p
        className="text-white font-light tracking-wide leading-relaxed select-none"
        style={{ fontSize: getFontSize(text.length) }}
      >
        {text}
      </p>
    </DraggableBubble>
  );
}
