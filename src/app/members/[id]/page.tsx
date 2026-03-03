"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase, type Participant, type Message, type Drawing } from "@/lib/supabase";
import { getContactType } from "@/lib/config";
import { timeAgo } from "@/lib/utils";
import { buildFeed } from "@/lib/types";
import Avatar from "@/components/Avatar";
import PageShell from "@/components/PageShell";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      const { data: p } = await supabase
        .from("participants")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled || !p) {
        setLoading(false);
        return;
      }

      setParticipant(p as Participant);

      const [msgRes, drawRes] = await Promise.all([
        supabase.from("messages").select("*").eq("sender_name", p.name).order("created_at", { ascending: false }),
        supabase.from("drawings").select("*").eq("sender_name", p.name).order("created_at", { ascending: false }),
      ]);

      if (!cancelled) {
        setMessages((msgRes.data as Message[]) ?? []);
        setDrawings((drawRes.data as Drawing[]) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const ct = getContactType(participant?.contact_type);
  const feed = useMemo(() => buildFeed(messages, drawings), [messages, drawings]);

  if (loading) {
    return (
      <div className="interact-page h-[100dvh] flex items-center justify-center">
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="interact-page h-[100dvh] flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 text-sm">Member not found.</p>
        <Link href="/members" className="nav-pill">
          <ArrowLeft className="size-4" />
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <PageShell backHref="/members">
      <div className="flex flex-col items-center gap-3 pt-2 pb-6">
        <Avatar
          url={participant.avatar_url}
          className="size-20"
          iconClassName="size-8 text-white/30"
          style={{ border: "2px solid var(--glass-15)" }}
        />
        <h2 className="text-2xl font-bold text-white tracking-tight">{participant.name}</h2>
        {ct && participant.contact && (
          <span className="flex items-center gap-2 text-sm text-white/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ct.icon} alt="" className="size-4 opacity-60" />
            {participant.contact}
          </span>
        )}
      </div>

      {feed.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">No messages or drawings yet.</p>
        </div>
      ) : (
        <>
          <p className="text-white/25 text-xs font-semibold uppercase tracking-[0.15em] mb-3 w-full max-w-[500px] mx-auto">
            {feed.length} {feed.length === 1 ? "submission" : "submissions"}
          </p>
          <div className="flex flex-col gap-3 w-full max-w-[500px] mx-auto">
            {feed.map((item) => (
              <div key={item.id} className="interact-card-body rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-white/20">{timeAgo(item.created_at)}</span>
                  <span className="text-[11px] text-white/15 uppercase tracking-wider">{item.kind}</span>
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
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
