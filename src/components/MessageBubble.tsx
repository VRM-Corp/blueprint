"use client";

import { memo, useRef, useLayoutEffect, useState } from "react";
import DraggableBubble from "./DraggableBubble";
import SenderInfo from "./SenderInfo";
import type { BubbleProps } from "@/lib/types";

type Props = BubbleProps & { text: string };

const NOTE_SIZE = 140;
const MAX_FONT = 28;
const MIN_FONT = 8;

function useAutoFitFont(text: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(MAX_FONT);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    let size = MAX_FONT;
    el.style.fontSize = `${size}px`;

    while (size > MIN_FONT && el.scrollHeight > container.clientHeight) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }

    setFontSize(size);
  }, [text]);

  return { containerRef, textRef, fontSize };
}

export default memo(function MessageBubble({
  text,
  senderName,
  avatarUrl,
  contactIcon,
  contactHandle,
  zIndex,
  ...bubble
}: Props) {
  const { containerRef, textRef, fontSize } = useAutoFitFont(text);

  return (
    <DraggableBubble
      {...bubble}
      zIndex={zIndex}
      className="flex flex-col bubble-sticky"
      style={{
        fontFamily: "var(--font-inter)",
        width: NOTE_SIZE,
        height: NOTE_SIZE,
        padding: 8,
      }}
    >
      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden">
        <p
          ref={textRef}
          className="text-neutral-800 font-medium leading-snug select-none break-words"
          style={{ fontSize }}
        >
          {text}
        </p>
      </div>
      {senderName && (
        <SenderInfo
          name={senderName}
          avatarUrl={avatarUrl}
          contactIcon={contactIcon}
          contactHandle={contactHandle}
          className="mt-auto pt-1 shrink-0"
          dark
        />
      )}
    </DraggableBubble>
  );
});
