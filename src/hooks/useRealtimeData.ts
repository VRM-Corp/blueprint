"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, type Message, type Drawing, type Participant } from "@/lib/supabase";

export function useRealtimeTable<T extends { id: string }>(table: string) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    supabase
      .from(table)
      .select("*")
      .order("created_at")
      .then(({ data, error: err }) => {
        if (err) {
          console.error(
            `[Blueprint] Failed to load ${table}:`,
            err.message
          );
          setError(`Failed to load ${table}`);
        }
        if (data) setItems(data as T[]);
      });

    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload) => {
          const item = payload.new as T;
          setItems((prev) => {
            if (prev.some((p) => p.id === item.id)) return prev;
            return [...prev, item];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        (payload) => {
          const updated = payload.new as T;
          setItems((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table },
        (payload) => {
          const deleted = payload.old as { id: string };
          setItems((prev) => prev.filter((item) => item.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  const archiveItem = useCallback(
    async (id: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, archived: true } : item
        )
      );
      const { error: err } = await supabase
        .from(table)
        .update({ archived: true })
        .eq("id", id);
      if (err) {
        console.error(`[Blueprint] Failed to archive in ${table}:`, err.message);
        const { data } = await supabase
          .from(table)
          .select("*")
          .order("created_at");
        if (data) setItems(data as T[]);
      }
    },
    [table]
  );

  const removeItem = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      const { error: err } = await supabase.from(table).delete().eq("id", id);
      if (err) {
        console.error(
          `[Blueprint] Failed to delete from ${table}:`,
          err.message
        );
        const { data } = await supabase
          .from(table)
          .select("*")
          .order("created_at");
        if (data) setItems(data as T[]);
      }
    },
    [table]
  );

  return { items, error, archiveItem, removeItem };
}

export function useProjectionData() {
  const {
    items: allMessages,
    error: messagesError,
    archiveItem: archiveMessage,
    removeItem: deleteMessage,
  } = useRealtimeTable<Message>("messages");
  const {
    items: allDrawings,
    error: drawingsError,
    archiveItem: archiveDrawing,
    removeItem: deleteDrawing,
  } = useRealtimeTable<Drawing>("drawings");
  const {
    items: participants,
    error: participantsError,
  } = useRealtimeTable<Participant>("participants");

  const messages = allMessages.filter((m) => !m.archived);
  const drawings = allDrawings.filter((d) => !d.archived);

  return {
    messages,
    drawings,
    participants,
    archiveMessage,
    archiveDrawing,
    deleteMessage,
    deleteDrawing,
    error: messagesError || drawingsError || participantsError,
  };
}
