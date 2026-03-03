"use client";

import { useEffect, useRef, useState } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({ w: 1920, h: 1080 });
  const rafId = useRef(0);

  useEffect(() => {
    const update = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setSize({ w: window.innerWidth, h: window.innerHeight });
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return size;
}
