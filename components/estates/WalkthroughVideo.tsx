"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WalkthroughVideo({ src, poster }: { src: string | null; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = video.current;
    if (!node || !src || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void node.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          node.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.55 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, src]);

  function toggle() {
    const node = video.current;
    if (!node) return;
    if (node.paused) void node.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      node.pause();
      setPlaying(false);
    }
  }

  return (
    <figure id="walkthrough">
      <div className="relative aspect-video bg-[#1a1a1a]">
        {src ? (
          <video
            ref={video}
            src={src}
            poster={poster}
            muted
            playsInline
            controls
            preload="metadata"
            className="h-full w-full object-cover"
            aria-label="Concept walkthrough"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : (
          <Image src={poster} alt="Concept render" fill className="object-cover" sizes="100vw" />
        )}
        {src && !playing ? (
          <button
            type="button"
            onClick={toggle}
            className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6d2a8] bg-black/45 text-[0.62rem] tracking-[0.22em] text-[#e6d2a8] uppercase"
          >
            Play
          </button>
        ) : null}
      </div>
      <figcaption className="paper-kicker mt-3">Concept walkthrough</figcaption>
    </figure>
  );
}
