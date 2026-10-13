"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { registerScroll } from "@/components/experience/scroll";

export function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    registerScroll(lenis);
    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("quantum-scroll"));
    });
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      registerScroll(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
