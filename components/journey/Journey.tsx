"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ConceptFigure } from "@/components/site/ConceptFigure";
import { company } from "@/content/site";
import { conceptShots } from "@/lib/concept";

const PLAN = [
  { d: "M380 220 H1220", from: 0.04, to: 0.12 },
  { d: "M380 420 H1220", from: 0.06, to: 0.15 },
  { d: "M380 620 H1220", from: 0.08, to: 0.17 },
  { d: "M540 160 V780", from: 0.05, to: 0.16 },
  { d: "M800 160 V780", from: 0.07, to: 0.17 },
  { d: "M1060 160 V780", from: 0.09, to: 0.18 },
  { d: "M460 280 H1140", from: 0.18, to: 0.28 },
  { d: "M460 540 H1140", from: 0.2, to: 0.3 },
  { d: "M620 220 V700", from: 0.19, to: 0.3 },
  { d: "M980 220 V700", from: 0.21, to: 0.32 },
  { d: "M600 310 H1000 V500 H600 Z", from: 0.32, to: 0.44 },
  { d: "M470 360 H600 V480 H470 Z", from: 0.34, to: 0.45 },
  { d: "M1000 340 H1160 V460 H1000 Z", from: 0.36, to: 0.46 },
  { d: "M680 500 H920 V590 H680 Z", from: 0.38, to: 0.48 },
  { d: "M800 590 V800", from: 0.46, to: 0.55 },
  { d: "M1040 490 H1130 V560 H1040 Z", from: 0.48, to: 0.56 },
  { d: "M1130 510 H1220 V580 H1130 Z", from: 0.5, to: 0.58 },
  { d: "M500 540 H680", from: 0.5, to: 0.58 },
];

const STAGES = [
  { label: "Design", at: 0.08 },
  { label: "Engineer", at: 0.22 },
  { label: "Build", at: 0.36 },
  { label: "Finish", at: 0.5 },
];

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function fade(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

export function Journey({ draft }: { draft: boolean }) {
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
  const progressRef = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const total = node.offsetHeight - window.innerHeight;
      const next = total <= 0 ? 0 : clamp01(-rect.top / total);
      progressRef.current = next;
      setProgress((current) => (Math.abs(current - next) < 0.004 ? current : next));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const shown = reduced ? 0.34 : progress;
  const blueprint = 1 - fade(shown, 0.56, 0.7);
  const estate = 1 - fade(shown, 0.64, 0.78);
  const ocean = fade(shown, 0.62, 0.76) * (1 - fade(shown, 0.84, 0.98));
  const space = fade(shown, 0.8, 0.98);
  const copy = 1 - fade(shown, 0.3, 0.48);
  const stage = [...STAGES].reverse().find((item) => shown >= item.at)?.label ?? "Design";
  const scene = space > 0.65 ? "space" : ocean > estate ? "ocean" : "estate";

  return (
    <div ref={track} className="relative h-[340vh]" data-scene={scene}>
      <div className="sticky top-0 h-dvh overflow-hidden bg-ink">
        <div className="still-space absolute inset-0" style={{ opacity: space }} />
        <div className="absolute inset-0" style={{ opacity: ocean, transform: `translate3d(0, ${(0.5 - shown) * 36}px, 0) scale(1.06)` }}>
          {draft ? (
            <ConceptFigure shot={conceptShots.ocean} draft className="h-full w-full" sizes="100vw" />
          ) : (
            <div className="still-ocean absolute inset-0" />
          )}
        </div>
        <div className="absolute inset-0" style={{ opacity: estate }}>
          <ConceptFigure shot={conceptShots.hero} draft={draft} className="h-full w-full" sizes="100vw" priority />
        </div>
        <svg
          viewBox="0 0 1600 900"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ opacity: blueprint }}
          aria-hidden="true"
        >
          <g fill="none" stroke="#E6D3A3" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
            {PLAN.map((line) => {
              const amount = fade(shown, line.from, line.to);
              return (
                <path
                  key={line.d}
                  d={line.d}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - amount}
                  opacity={shown + 0.02 >= line.from ? 0.92 : 0}
                />
              );
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink via-ink/55 to-transparent" style={{ opacity: Math.max(copy, 0.35) }} />
        <div className="absolute right-6 bottom-8 left-6 max-w-3xl md:left-12" style={{ opacity: copy }}>
          <p className="kicker">{draft ? "Concept" : company.market}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.9] text-sand sm:text-7xl md:text-8xl">{company.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-base text-sand/80 md:text-lg">{company.heroSub}</p>
          <p className="mt-6 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
        </div>
        <p className="absolute top-28 right-6 text-[0.68rem] tracking-[0.28em] text-gold-2 uppercase md:right-12" style={{ opacity: blueprint }}>
          {stage}
        </p>
      </div>
    </div>
  );
}
