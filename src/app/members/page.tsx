"use client";

import Link from "next/link";
import { useRealtimeTable } from "@/hooks/useRealtimeData";
import type { Participant } from "@/lib/supabase";
import { getContactType } from "@/lib/config";
import Avatar from "@/components/Avatar";
import PageShell from "@/components/PageShell";

export default function MembersPage() {
  const { items: participants } = useRealtimeTable<Participant>("participants");

  return (
    <PageShell title="Members" backHref="/interact">
      {participants.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">No one has joined yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-2.5 w-full max-w-[500px] mx-auto">
        {participants.map((p) => {
          const ct = getContactType(p.contact_type);

          return (
            <Link
              key={p.id}
              href={`/members/${p.id}`}
              className="interact-card-body rounded-2xl flex items-center gap-3 transition-transform active:scale-[0.98]"
            >
              <Avatar url={p.avatar_url} className="size-11" iconClassName="size-5" />
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold text-white/80 leading-tight truncate">
                  {p.name}
                </span>
                {ct && p.contact && (
                  <span className="flex items-center gap-1.5 text-xs text-white/30 leading-tight mt-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ct.icon} alt="" className="size-3.5 opacity-50" />
                    {p.contact}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
