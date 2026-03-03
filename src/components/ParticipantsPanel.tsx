"use client";

import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import type { Participant } from "@/lib/supabase";

type Props = {
  participants: Participant[];
};

export default function ParticipantsPanel({ participants }: Props) {
  if (participants.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 left-10 max-w-xs"
      style={{ zIndex: 5 }}
    >
      <p className="text-white/30 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">
        Joined
      </p>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {participants.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-white/70 font-medium select-none"
                style={{
                  background: "var(--glass-6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--glass-10)",
                }}
              >
                {p.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar_url} alt="" className="size-4 rounded-full object-cover -ml-0.5" />
                ) : (
                  <User className="size-3.5 opacity-60 -ml-0.5" />
                )}
                {p.name}
              </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
