"use client";

import { useEffect, useRef } from "react";

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    if (!media.matches) return;
    const node = ring.current;
    if (!node) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let scale = 1;
    let frame = 0;
    const move = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("a, button");
      scale = target ? 1.7 : 1;
      if (target instanceof HTMLElement) {
        const box = target.getBoundingClientRect();
        tx += (box.left + box.width / 2 - event.clientX) * 0.18;
        ty += (box.top + box.height / 2 - event.clientY) * 0.18;
      }
    };
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[70] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/80 mix-blend-difference md:block"
    />
  );
}
