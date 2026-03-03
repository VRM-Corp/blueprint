"use client";

import DraggableBubble from "./DraggableBubble";
import SenderInfo from "./SenderInfo";
import type { BubbleProps } from "@/lib/types";

type Props = BubbleProps & { imageData: string };

export default function DrawingBubble({
  imageData,
  senderName,
  avatarUrl,
  contactIcon,
  contactHandle,
  zIndex,
  ...bubble
}: Props) {
  return (
    <DraggableBubble
      {...bubble}
      zIndex={zIndex}
      className="p-3 rounded-2xl overflow-hidden"
      style={{
        background: "var(--glass-10)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--glass-10)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageData}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-48 h-48 object-contain select-none rounded-xl"
        draggable={false}
      />
    </DraggableBubble>
  );
}
