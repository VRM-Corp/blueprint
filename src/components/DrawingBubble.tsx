"use client";

import { memo } from "react";
import DraggableBubble from "./DraggableBubble";
import SenderInfo from "./SenderInfo";
import type { BubbleProps } from "@/lib/types";

type Props = BubbleProps & { imageData: string };

export default memo(function DrawingBubble({
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
      <div className="bubble-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageData}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-44 h-44 object-cover select-none"
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
});
