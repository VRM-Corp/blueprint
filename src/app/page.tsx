"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingElements from "@/components/FloatingElements";
import LogoStrip from "@/components/LogoStrip";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import MessageBubble from "@/components/MessageBubble";
import DrawingBubble from "@/components/DrawingBubble";
import { usePhase } from "@/hooks/usePhase";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useBubblePositions } from "@/hooks/useBubblePositions";
import { useProjectionData } from "@/hooks/useRealtimeData";
import { EVENT_CONFIG, getContactType } from "@/lib/config";

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
    <div className="fixed inset-0 overflow-hidden select-none">
      <AnimatedBackground />
      <FloatingElements />

      {!isPre && (
        <div className="fixed inset-0" style={{ zIndex: 2 }}>
          <AnimatePresence>
            {messages.map((m) => {
              const pos = ensurePosition(m.id);
              return (
                <MessageBubble
                  key={m.id}
                  text={m.text}
                  senderName={m.sender_name}
                  avatarUrl={m.sender_name ? contactByName[m.sender_name]?.avatar : undefined}
                  contactIcon={m.sender_name ? contactByName[m.sender_name]?.icon : undefined}
                  contactHandle={m.sender_name ? contactByName[m.sender_name]?.handle : undefined}
                  x={pos.x}
                  y={pos.y}
                  rotation={pos.rotation}
                  onDragEnd={(px, py) => handleDragEnd(m.id, px, py)}
                  onDelete={() => {
                    removePosition(m.id);
                    deleteMessage(m.id);
                  }}
                />
              );
            })}
            {drawings.map((d) => {
              const pos = ensurePosition(d.id);
              return (
                <DrawingBubble
                  key={d.id}
                  imageData={d.image_data}
                  senderName={d.sender_name}
                  avatarUrl={d.sender_name ? contactByName[d.sender_name]?.avatar : undefined}
                  contactIcon={d.sender_name ? contactByName[d.sender_name]?.icon : undefined}
                  contactHandle={d.sender_name ? contactByName[d.sender_name]?.handle : undefined}
                  x={pos.x}
                  y={pos.y}
                  rotation={pos.rotation}
                  onDragEnd={(px, py) => handleDragEnd(d.id, px, py)}
                  onDelete={() => {
                    removePosition(d.id);
                    deleteDrawing(d.id);
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
            className="w-[28vw] pointer-events-none"
          />
        </motion.div>
      ))}
    </div>
  );
}
