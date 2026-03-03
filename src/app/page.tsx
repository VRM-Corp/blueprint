"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const { messages, drawings, participants, deleteMessage, deleteDrawing } =
    useProjectionData();

  const isPre = phase === "pre-event";
  const zCounterRef = useRef(0);
  const zMapRef = useRef<Record<string, number>>({});
  const [, setZTick] = useState(0);

  const allBubbles = useMemo(() => {
    const items: Array<{ type: "message" | "drawing"; id: string; sender_name?: string; data: Message | Drawing }> = [
      ...messages.map((m) => ({ type: "message" as const, id: m.id, sender_name: m.sender_name, data: m })),
      ...drawings.map((d) => ({ type: "drawing" as const, id: d.id, sender_name: d.sender_name, data: d })),
    ];
    items.sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());
    return items;
  }, [messages, drawings]);

  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const queuedRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const newIds = allBubbles
      .map((b) => b.id)
      .filter((id) => !queuedRef.current.has(id));

    if (newIds.length === 0) return;
    newIds.forEach((id) => queuedRef.current.add(id));

    if (newIds.length <= 2) {
      setVisibleIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.add(id));
        return next;
      });
      return;
    }

    let i = 0;
    const flush = () => {
      if (i >= newIds.length) return;
      setVisibleIds((prev) => new Set([...prev, newIds[i]]));
      i++;
      if (i < newIds.length) {
        timerRef.current = setTimeout(flush, 80);
      }
    };
    flush();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
      duringLeft: w - P.cornerInset - QR_FULL * P.qrDuringScale,
    };
  }, [w, h]);

  return (
    <div className="fixed inset-0 overflow-hidden select-none projection-bg">
      <FloatingElements />

      {!isPre && (
        <div className="fixed inset-0" style={{ zIndex: 2 }}>
          <AnimatePresence>
            {allBubbles.filter((b) => visibleIds.has(b.id)).map((item) => {
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
              };

              const bringToFront = (id: string) => {
                zCounterRef.current += 1;
                zMapRef.current[id] = zCounterRef.current;
                setZTick((n) => n + 1);
              };

              if (item.type === "message") {
                return (
                  <MessageBubble
                    key={item.id}
                    text={(item.data as Message).text}
                    {...shared}
                    onDragEnd={(px, py) => {
                      handleDragEnd(item.id, px, py);
                      bringToFront(item.id);
                    }}
                    onDelete={() => {
                      removePosition(item.id);
                      deleteMessage(item.id);
                    }}
                  />
                );
              }

              return (
                <DrawingBubble
                  key={item.id}
                  imageData={(item.data as Drawing).image_data}
                  {...shared}
                  onDragEnd={(px, py) => {
                    handleDragEnd(item.id, px, py);
                    bringToFront(item.id);
                  }}
                  onDelete={() => {
                    removePosition(item.id);
                    deleteDrawing(item.id);
                  }}
                />
              );
            })}
          </AnimatePresence>
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
        style={{ zIndex: 3, transformOrigin: "top left" }}
        initial={false}
        animate={{
          opacity: 1,
          top: isPre ? qrPos.preTop : qrPos.duringTop,
          left: isPre ? qrPos.preLeft : qrPos.duringLeft,
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
          top: h - P.logoPadding,
          left: isPre ? w / 2 : 40,
          x: isPre ? "-50%" : "0%",
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
