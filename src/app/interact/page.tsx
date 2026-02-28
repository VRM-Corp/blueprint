"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DrawingCanvas from "@/components/DrawingCanvas";
import { supabase } from "@/lib/supabase";
import { EVENT_CONFIG } from "@/lib/config";

type Tab = "message" | "draw";

export default function InteractPage() {
  const [tab, setTab] = useState<Tab>("message");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const flashToast = useCallback(() => {
    setSent(true);
    setTimeout(() => setSent(false), EVENT_CONFIG.toastDurationMs);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await supabase.from("messages").insert({ text: message.trim() });
      setMessage("");
      flashToast();
    } catch {
      /* silent in event context */
    } finally {
      setSending(false);
    }
  }, [message, sending, flashToast]);

  const sendDrawing = useCallback(
    async (dataUrl: string) => {
      setSending(true);
      try {
        await supabase.from("drawings").insert({ image_data: dataUrl });
        flashToast();
      } catch {
        /* silent in event context */
      } finally {
        setSending(false);
      }
    },
    [flashToast]
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #0a1628 0%, #0f1d35 50%, #0a1628 100%)",
        fontFamily: "Advercase, sans-serif",
      }}
    >
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center">
        <h1
          className="text-4xl tracking-tight text-white"
          style={{ fontFamily: "Kabond, serif" }}
        >
          {EVENT_CONFIG.title}
        </h1>
        <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">
          {EVENT_CONFIG.venue}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-6 mb-6">
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {(["message", "draw"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm font-medium tracking-wider uppercase transition-all"
              style={{
                background:
                  tab === t ? "rgba(74, 127, 255, 0.2)" : "transparent",
                color: tab === t ? "white" : "rgba(255,255,255,0.4)",
                borderBottom:
                  tab === t
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
              }}
            >
              {t === "message" ? "Message" : "Draw"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {tab === "message" && (
            <motion.div
              key="message"
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-white/50 text-sm">
                Your message will float across the projection screen.
              </p>
              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value.slice(0, EVENT_CONFIG.messageMaxLength)
                  )
                }
                placeholder="Type your message..."
                maxLength={EVENT_CONFIG.messageMaxLength}
                rows={3}
                className="w-full p-4 rounded-xl text-white placeholder-white/30 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-xs">
                  {message.length}/{EVENT_CONFIG.messageMaxLength}
                </span>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="px-8 py-3 rounded-xl text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-30"
                  style={{
                    background: message.trim()
                      ? "rgba(74, 127, 255, 0.8)"
                      : "rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </motion.div>
          )}

          {tab === "draw" && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-white/50 text-sm mb-4">
                Draw something and it will pop up on screen.
              </p>
              <DrawingCanvas onSubmit={sendDrawing} submitting={sending} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success toast */}
        <AnimatePresence>
          {sent && (
            <motion.div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium tracking-wide"
              style={{
                background: "rgba(74, 127, 255, 0.9)",
                backdropFilter: "blur(12px)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              Sent to the big screen!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
