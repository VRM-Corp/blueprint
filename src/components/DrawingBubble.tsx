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
      className="pt-2 px-2 pb-5 overflow-hidden bubble-polaroid"
    >
      <div className="bubble-content p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageData}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-48 h-48 object-contain select-none"
          draggable={false}
        />
      </div>
      {senderName && (
        <SenderInfo
          name={senderName}
          avatarUrl={avatarUrl}
          contactIcon={contactIcon}
          contactHandle={contactHandle}
          className="mt-2 shrink-0"
          dark
        />
      )}
    </DraggableBubble>
  );
}
