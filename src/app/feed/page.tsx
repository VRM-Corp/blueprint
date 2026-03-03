"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRealtimeTable } from "@/hooks/useRealtimeData";
import type { Message, Drawing, Participant } from "@/lib/supabase";
import { getContactType } from "@/lib/config";
import { timeAgo } from "@/lib/utils";
import { buildFeed } from "@/lib/types";
import Avatar from "@/components/Avatar";
import PageShell from "@/components/PageShell";

export default function FeedPage() {
  const { items: messages } = useRealtimeTable<Message>("messages");
  const { items: drawings } = useRealtimeTable<Drawing>("drawings");
  const { items: participants } = useRealtimeTable<Participant>("participants");

  const participantByName = useMemo(() => {
    const map: Record<string, Participant> = {};
    for (const p of participants) map[p.name] = p;
    return map;
  }, [participants]);

  const feed = useMemo(() => buildFeed(messages, drawings), [messages, drawings]);

  return (
    <PageShell title="Feed" backHref="/interact">
      {feed.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">No messages or drawings yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-[500px] mx-auto">
        {feed.map((item) => {
          const participant = item.sender_name ? participantByName[item.sender_name] : undefined;
          const ct = getContactType(participant?.contact_type);

          const content = (
            <div className="interact-card-body rounded-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar
                  url={participant?.avatar_url}
                  name={item.sender_name}
                  className="size-8"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white/70 leading-tight truncate">
                    {item.sender_name ?? "Anonymous"}
                  </span>
                  {ct && participant?.contact && (
                    <span className="flex items-center gap-1 text-[11px] text-white/30 leading-tight">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ct.icon} alt="" className="size-3 opacity-50" />
                      {participant.contact}
                    </span>
                  )}
                </div>
                <span className="ml-auto text-[11px] text-white/20 shrink-0">{timeAgo(item.created_at)}</span>
              </div>

              {item.kind === "message" ? (
                <p className="text-white/90 text-[15px] leading-relaxed">{item.text}</p>
              ) : (
                <div className="rounded-lg overflow-hidden mx-auto max-w-[280px]" style={{ background: "var(--navy)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_data}
                    alt="Drawing"
                    className="w-full"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          );

          if (participant) {
            return (
              <Link key={item.id} href={`/members/${participant.id}`} className="block transition-transform active:scale-[0.98]">
                {content}
              </Link>
            );
          }

          return <div key={item.id}>{content}</div>;
        })}
      </div>
    </PageShell>
  );
}
