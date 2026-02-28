"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingElements from "@/components/FloatingElements";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import MessageBubble from "@/components/MessageBubble";
import DrawingBubble from "@/components/DrawingBubble";
import { supabase, type Message, type Drawing } from "@/lib/supabase";
import { EVENT_CONFIG } from "@/lib/config";

type Phase = "pre-event" | "during";

const {
  projection: P,
  assets,
} = EVENT_CONFIG;

const QR_FULL = P.qrSize + P.qrQuietZone * 2;
const CORNER_POSITIONS = [
  { top: -40, left: -40, rotate: 0 },
  { top: -40, right: -40, rotate: 90 },
  { bottom: -40, right: -40, rotate: 180 },
  { bottom: -40, left: -40, rotate: 270 },
] as const;

export default function ProjectionPage() {
  const [phase, setPhase] = useState<Phase>("pre-event");
  const [messages, setMessages] = useState<Message[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const initialized = useRef(false);
  const [winSize, setWinSize] = useState({ w: 1920, h: 1080 });

  useEffect(() => {
    const update = () =>
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const removeDrawing = useCallback((id: string) => {
    setDrawings((prev) => prev.filter((d) => d.id !== id));
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const msgChannel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    const drawChannel = supabase
      .channel("drawings-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "drawings" },
        (payload) => {
          const newDraw = payload.new as Drawing;
          setDrawings((prev) => [...prev, newDraw]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(drawChannel);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setPhase((p) => (p === "pre-event" ? "during" : "pre-event"));
          break;
        case "1":
          setPhase("pre-event");
          break;
        case "2":
          setPhase("during");
          break;
        case "f":
        case "F":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const { w, h } = winSize;
  const isPre = phase === "pre-event";

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
    <div className="fixed inset-0 overflow-hidden cursor-none select-none">
      <AnimatedBackground />
      <FloatingElements />

      {/* Messages + Drawings layer */}
      <div className="fixed inset-0" style={{ zIndex: 2 }}>
        <AnimatePresence>
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              id={m.id}
              text={m.text}
              onExpire={removeMessage}
            />
          ))}
          {drawings.map((d) => (
            <DrawingBubble
              key={d.id}
              id={d.id}
              imageData={d.image_data}
              onExpire={removeDrawing}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Title */}
      <motion.div
        className="fixed flex flex-col"
        style={{ zIndex: 3 }}
        initial={{ opacity: 0, top: h * P.titleTopPercent, left: w / 2, x: "-50%" }}
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
              style={{ fontFamily: "Advercase, sans-serif", textAlign: "center" }}
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

      {/* QR code */}
      <motion.div
        className="fixed"
        style={{ zIndex: 3, transformOrigin: "top left" }}
        initial={{ opacity: 0, top: qrPos.preTop, left: qrPos.preLeft, scale: 1 }}
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

      {/* Logos */}
      <motion.div
        className="fixed flex items-center gap-6"
        style={{ zIndex: 4 }}
        initial={{ opacity: 0, top: h - P.logoPadding, left: w / 2, x: "-50%" }}
        animate={{
          opacity: 1,
          top: h - P.logoPadding,
          left: isPre ? w / 2 : 40,
          x: isPre ? "-50%" : "0%",
        }}
        transition={{ duration: P.transitionDuration, ease: "easeInOut" }}
      >
        {assets.logos.map((logo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            className="h-10 opacity-60"
          />
        ))}
      </motion.div>

      {/* Star graphics — all four corners */}
      {CORNER_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="fixed"
          style={{ zIndex: 1, ...pos }}
          initial={{ opacity: 0 }}
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
