"use client";

import { useEffect, useState, useCallback } from "react";

export type Phase = "pre-event" | "during";

export function usePhase() {
  const [phase, setPhaseRaw] = useState<Phase>("pre-event");

  const setPhase = useCallback((p: Phase | ((prev: Phase) => Phase)) => {
    setPhaseRaw((prev) => {
      const next = typeof p === "function" ? p(prev) : p;
      window.location.hash = next === "during" ? "during" : "";
      return next;
    });
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "during") setPhaseRaw("during");
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
  }, [setPhase]);

  return { phase, setPhase };
}
