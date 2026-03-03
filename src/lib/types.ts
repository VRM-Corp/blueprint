import type { Message, Drawing } from "./supabase";

export type FeedItem =
  | { kind: "message"; id: string; sender_name?: string; created_at: string; text: string }
  | { kind: "drawing"; id: string; sender_name?: string; created_at: string; image_data: string };

export function buildFeed(messages: Message[], drawings: Drawing[]): FeedItem[] {
  const items: FeedItem[] = [
    ...messages.map((m) => ({ kind: "message" as const, ...m })),
    ...drawings.map((d) => ({ kind: "drawing" as const, ...d })),
  ];
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return items;
}

export type BubbleProps = {
  senderName?: string;
  avatarUrl?: string;
  contactIcon?: string;
  contactHandle?: string;
  x: number;
  y: number;
  rotation: number;
  zIndex?: number;
  onDragEnd: (x: number, y: number) => void;
  onDelete: () => void;
};
