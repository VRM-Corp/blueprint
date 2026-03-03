"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, type Message, type Drawing } from "@/lib/supabase";

function useRealtimeTable<T extends { id: string }>(table: string) {
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

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

  return { items, error, removeItem };
}

export function useProjectionData() {
  const {
    items: messages,
    error: messagesError,
    removeItem: deleteMessage,
  } = useRealtimeTable<Message>("messages");
  const {
    items: drawings,
    error: drawingsError,
    removeItem: deleteDrawing,
  } = useRealtimeTable<Drawing>("drawings");

  return {
    messages,
    drawings,
    deleteMessage,
    deleteDrawing,
    error: messagesError || drawingsError,
  };
}
