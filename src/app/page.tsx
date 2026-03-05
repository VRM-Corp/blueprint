"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import FloatingElements from "@/components/FloatingElements";
import LogoStrip from "@/components/LogoStrip";
import MessageBubble from "@/components/MessageBubble";
import DrawingBubble from "@/components/DrawingBubble";
import { usePhase } from "@/hooks/usePhase";

const QRCodeDisplay = dynamic(() => import("@/components/QRCodeDisplay"), {
  ssr: false,
});
import { useWindowSize } from "@/hooks/useWindowSize";
import { useBubblePositions } from "@/hooks/useBubblePositions";
import { useProjectionData } from "@/hooks/useRealtimeData";
import { EVENT_CONFIG, getContactType } from "@/lib/config";
import type { Message, Drawing } from "@/lib/supabase";

const { projection: P, assets } = EVENT_CONFIG;

type StableCallbacks = {
  id: string;
  onBringToFront: (id: string) => void;
  onHandleDragEnd: (id: string, px: number, py: number) => void;
  onRemovePosition: (id: string) => void;
  onDeleteItem: (id: string) => void;
};

type MemoMessageProps = StableCallbacks & React.ComponentProps<typeof MessageBubble> & { id: string };

const MemoMessageBubble = memo(function MemoMessageBubble({
  id, onBringToFront, onHandleDragEnd, onRemovePosition, onDeleteItem,
  ...props
}: Omit<MemoMessageProps, "onDragEnd" | "onDelete">) {
  return (
    <MessageBubble
      {...props}
      onDragEnd={(px: number, py: number) => {
        onHandleDragEnd(id, px, py);
        onBringToFront(id);
      }}
      onDelete={() => {
        onRemovePosition(id);
        onDeleteItem(id);
      }}
    />
  );
});

type MemoDrawingProps = StableCallbacks & React.ComponentProps<typeof DrawingBubble> & { id: string };

const MemoDrawingBubble = memo(function MemoDrawingBubble({
  id, onBringToFront, onHandleDragEnd, onRemovePosition, onDeleteItem,
  ...props
}: Omit<MemoDrawingProps, "onDragEnd" | "onDelete">) {
  return (
    <DrawingBubble
      {...props}
      onDragEnd={(px: number, py: number) => {
        onHandleDragEnd(id, px, py);
        onBringToFront(id);
      }}
      onDelete={() => {
        onRemovePosition(id);
        onDeleteItem(id);
      }}
    />
  );
});

const QR_FULL = P.qrSize + P.qrQuietZone * 2;
const CORNER_POSITIONS = [
  { top: -40, left: -40, rotate: 0 },
  { top: -40, right: -40, rotate: 90 },
  { bottom: -40, right: -40, rotate: 180 },
  { bottom: -40, left: -40, rotate: 270 },
] as const;

export default function ProjectionPage() {
  const { phase } = usePhase();
  const { w, h } = useWindowSize();
  const { ensurePosition, handleDragEnd, removePosition } =
    useBubblePositions();
  const { messages, drawings, participants, archiveMessage, archiveDrawing } =
    useProjectionData();

  const isPre = phase === "pre-event";
  const [showBubbles, setShowBubbles] = useState(false);

  useEffect(() => {
    if (!isPre) {
      const timer = setTimeout(() => setShowBubbles(true), 1000);
      return () => clearTimeout(timer);
    }
    setShowBubbles(false);
  }, [isPre]);

  const zCounterRef = useRef(0);
  const zMapRef = useRef<Record<string, number>>({});
  const [, setZTick] = useState(0);

  const bringToFront = useCallback((id: string) => {
    zCounterRef.current += 1;
    zMapRef.current[id] = zCounterRef.current;
    setZTick((n) => n + 1);
  }, []);

  const allBubbles = useMemo(() => {
    const items: Array<{ type: "message" | "drawing"; id: string; sender_name?: string; data: Message | Drawing }> = [
      ...messages.map((m) => ({ type: "message" as const, id: m.id, sender_name: m.sender_name, data: m })),
      ...drawings.map((d) => ({ type: "drawing" as const, id: d.id, sender_name: d.sender_name, data: d })),
    ];
    items.sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());
    return items;
  }, [messages, drawings]);

  const staggerRef = useRef<Record<string, number>>({});
  const initialDoneRef = useRef(false);

  allBubbles.forEach((item, index) => {
    if (!(item.id in staggerRef.current)) {
      staggerRef.current[item.id] = initialDoneRef.current ? 0 : index;
    }
  });

  useEffect(() => {
    if (allBubbles.length > 0) {
      initialDoneRef.current = true;
    }
  }, [allBubbles]);

  const contactByName = useMemo(() => {
    const map: Record<string, { icon?: string; handle?: string; avatar?: string }> = {};
    for (const p of participants) {
      const icon = getContactType(p.contact_type)?.icon;
      const existing = map[p.name];
      map[p.name] = {
        icon: icon || existing?.icon,
        handle: p.contact || existing?.handle,
        avatar: p.avatar_url || existing?.avatar,
      };
    }
    return map;
  }, [participants]);

  const qrPos = useMemo(() => {
    const titleBottom = h * P.titleTopPercent + w * 0.12 * 0.9 + 20;
    const logosTop = h - P.logoPadding;
    return {
      preTop: (titleBottom + logosTop) / 2 - QR_FULL / 2,
      preLeft: w / 2 - QR_FULL / 2,
      duringTop: h - P.cornerInset - QR_FULL * P.qrDuringScale,
      duringLeft: w / 2 - (QR_FULL * P.qrDuringScale) / 2,
    };
  }, [w, h]);

  return (
    <div className="fixed inset-0 overflow-hidden select-none projection-bg">
      <FloatingElements />

      {showBubbles && (
        <div className="fixed inset-0" style={{ zIndex: 2 }}>
          {allBubbles.map((item) => {
            if (!(item.id in zMapRef.current)) {
              zCounterRef.current += 1;
              zMapRef.current[item.id] = zCounterRef.current;
            }
            const pos = ensurePosition(item.id);
            const contact = item.sender_name ? contactByName[item.sender_name] : undefined;
            const shared = {
              senderName: item.sender_name,
              avatarUrl: contact?.avatar,
              contactIcon: contact?.icon,
              contactHandle: contact?.handle,
              x: pos.x,
              y: pos.y,
              rotation: pos.rotation,
              zIndex: zMapRef.current[item.id],
              staggerIndex: staggerRef.current[item.id] ?? 0,
            };

            if (item.type === "message") {
              return (
                <MemoMessageBubble
                  key={item.id}
                  id={item.id}
                  text={(item.data as Message).text}
                  {...shared}
                  onBringToFront={bringToFront}
                  onHandleDragEnd={handleDragEnd}
                  onRemovePosition={removePosition}
                  onDeleteItem={archiveMessage}
                />
              );
            }

            return (
              <MemoDrawingBubble
                key={item.id}
                id={item.id}
                imageData={(item.data as Drawing).image_data}
                {...shared}
                onBringToFront={bringToFront}
                onHandleDragEnd={handleDragEnd}
                onRemovePosition={removePosition}
                onDeleteItem={archiveDrawing}
              />
            );
          })}
        </div>
      )}


      <motion.div
        className="fixed flex flex-col"
        style={{ zIndex: 3 }}
        initial={false}
        animate={{
          opacity: 1,
          top: isPre ? h * P.titleTopPercent : 32,
          left: isPre ? w / 2 : 40,
          x: isPre ? "-50%" : "0%",
        }}
        transition={{ duration: P.transitionDuration, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {isPre && (
            <motion.p
              key="welcome"
              className="text-2xl font-light tracking-[0.2em] text-white/50"
              style={{
                fontFamily: "Advercase, sans-serif",
                textAlign: "center",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome to
            </motion.p>
          )}
        </AnimatePresence>
        <motion.h1
          className="leading-[0.9] tracking-tight"
          style={{ fontFamily: "Kabond, serif" }}
          initial={{ fontSize: P.titleFontPre, marginTop: "-0.75rem" }}
          animate={{
            fontSize: isPre ? P.titleFontPre : P.titleFontDuring,
            marginTop: isPre ? "-0.75rem" : "0rem",
          }}
          transition={{ duration: P.transitionDuration, ease: "easeInOut" }}
        >
          {EVENT_CONFIG.title}
        </motion.h1>
      </motion.div>

      <motion.div
        className="fixed"
        style={{ zIndex: 3, transformOrigin: "top center" }}
        initial={false}
        animate={{
          opacity: 1,
          top: isPre ? qrPos.preTop : 32,
          left: isPre ? qrPos.preLeft : w / 2 - (QR_FULL * P.qrDuringScale) / 2,
          scale: isPre ? 1 : P.qrDuringScale,
        }}
        transition={{ duration: P.transitionDuration, ease: "easeInOut" }}
      >
        <QRCodeDisplay />
      </motion.div>

      <motion.div
        className="fixed flex items-center gap-6"
        style={{ zIndex: 4 }}
        initial={false}
        animate={{
          opacity: 1,
          top: isPre ? h - P.logoPadding : h - P.cornerInset,
          left: w / 2,
          x: "-50%",
          y: isPre ? "0%" : "-100%",
        }}
        transition={{ duration: P.transitionDuration, ease: "easeInOut" }}
      >
        <LogoStrip />
      </motion.div>

      {CORNER_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="fixed"
          style={{ zIndex: 1, ...pos }}
          initial={false}
          animate={{ opacity: 0.15, rotate: pos.rotate }}
          transition={{ duration: P.fadeInDuration, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.starGraphic}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-[28vw] pointer-events-none"
          />
        </motion.div>
      ))}
    </div>
  );
}
