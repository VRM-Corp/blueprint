"use client";

import DraggableBubble from "./DraggableBubble";
import SenderInfo from "./SenderInfo";
import type { BubbleProps } from "@/lib/types";

type Props = BubbleProps & { text: string };

function getFontSize(length: number) {
  if (length > 80) return "1rem";
  if (length > 40) return "1.25rem";
  return "1.5rem";
}

export default function MessageBubble({
  text,
  senderName,
  avatarUrl,
  contactIcon,
  contactHandle,
  ...bubble
}: Props) {
  return (
    <DraggableBubble
      {...bubble}
      className="p-3 rounded-2xl max-w-lg"
      style={{
        background: "var(--glass-10)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--glass-10)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        fontFamily: "var(--font-inter)",
      }}
    >
      {senderName && (
        <SenderInfo
          name={senderName}
          avatarUrl={avatarUrl}
          contactIcon={contactIcon}
          contactHandle={contactHandle}
          className="mb-2"
        />
      )}
      <p
        className="text-white font-light tracking-wide leading-relaxed select-none"
        style={{ fontSize: getFontSize(text.length) }}
      >
        {text}
      </p>
    </DraggableBubble>
  );
}
