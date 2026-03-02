"use client";

import { useEffect, useState } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({ w: 1920, h: 1080 });

  useEffect(() => {
    const update = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
