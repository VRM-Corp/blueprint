"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function useSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeRef = useRef(false);

  const submit = useCallback(
    async (
      table: string,
      data: Record<string, unknown>,
      options?: { successMessage?: string; onSuccess?: () => void }
    ) => {
      if (activeRef.current) return;
      activeRef.current = true;
      setIsSubmitting(true);
      try {
        const { error } = await supabase.from(table).insert(data);
        if (error) throw error;
        options?.onSuccess?.();
        toast.success(options?.successMessage ?? "Sent!");
      } catch {
        toast.error("Failed to send. Try again!");
      } finally {
        activeRef.current = false;
        setIsSubmitting(false);
      }
    },
    []
  );

  return { isSubmitting, submit };
}
