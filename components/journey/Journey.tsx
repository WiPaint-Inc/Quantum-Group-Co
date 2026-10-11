"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SoundToggle } from "@/components/experience/SoundToggle";
import { scrollToY } from "@/components/experience/scroll";
import { company, services } from "@/content/site";
import { posterImage } from "@/content/portfolio";

const ExperienceCanvas = dynamic(
  () => import("@/components/experience/ExperienceCanvas").then((mod) => mod.ExperienceCanvas),
  { ssr: false },
);

export type SceneVilla = { slug: string; name: string; location: string };

const CHAPTERS = [
  { label: "Site", at: 0.02 },
  { label: "Vision", at: 0.12 },
  { label: "Blueprint", at: 0.24 },
  { label: "Structure", at: 0.36 },
  { label: "Finish", at: 0.48 },
  { label: "Evening", at: 0.58 },
  { label: "Engineering", at: 0.66 },
  { label: "Plans", at: 0.74 },
  { label: "Construction", at: 0.8 },
  { label: "Finishing", at: 0.86 },
  { label: "Materials", at: 0.92 },
  { label: "Developments", at: 0.97 },
];

function subscribeMotion(onChange: () => void) {
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

function hourLabel(progress: number) {
  if (progress < 0.22) return "Morning";
  if (progress < 0.42) return "Afternoon";
  if (progress < 0.62) return "Dusk";
  return "Night";
}

export function Journey({ draft, villas = [] }: { draft: boolean; villas?: SceneVilla[] }) {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const progressRef = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const apply = () => setQuality(mobile.matches ? "low" : "high");
    apply();
    mobile.addEventListener("change", apply);
    return () => mobile.removeEventListener("change", apply);
  }, []);

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
    window.addEventListener("quantum-scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("quantum-scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const shown = reduced ? 0 : progress;
  const chapter = [...CHAPTERS].reverse().find((item) => shown >= item.at) ?? CHAPTERS[0];
  const chapterIndex = CHAPTERS.findIndex((item) => item.label === chapter.label);
  const hero = reduced ? 1 : 1 - clamp01((shown - 0.06) / 0.1);
  const showCanvas = !reduced;

  function seek(at: number) {
    const node = track.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    const total = node.offsetHeight - window.innerHeight;
    scrollToY(top + total * at);
  }

  return (
    <div ref={track} className={reduced ? "relative" : "relative h-[520vh] md:h-[760vh]"} data-scene={chapter.label.toLowerCase()}>
      <div className={reduced ? "relative h-dvh overflow-hidden bg-ink" : "sticky top-0 h-dvh overflow-hidden bg-ink"}>
        <Image src={posterImage.src} alt={posterImage.alt} fill priority className="object-cover" sizes="100vw" />
        {showCanvas ? (
          <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
            <ExperienceCanvas progressRef={progressRef} quality={quality} onReady={() => setReady(true)} />
          </div>
        ) : null}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40"
          style={{ opacity: showCanvas && ready ? 0.42 : 0.72 }}
        />
        <div className="pointer-events-none absolute right-6 bottom-28 left-6 max-w-3xl md:left-12" style={{ opacity: hero }}>
          <p className="kicker">{draft ? "Concept" : company.market}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.9] text-sand sm:text-7xl md:text-8xl">{company.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-base text-sand/80 md:text-lg">{company.heroSub}</p>
          <p className="mt-6 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
          <p className="mt-3 text-sm text-sand/60">{company.heroAlts[1]}</p>
        </div>
        <p
          className="pointer-events-none absolute top-24 left-6 font-serif text-4xl text-sand md:top-28 md:left-12 md:text-6xl"
          style={{ opacity: 1 - hero }}
        >
          {chapter.label}
        </p>
        <div className="absolute top-24 right-6 z-10 flex items-center gap-3 md:top-28">
          <p className="text-[0.62rem] tracking-[0.22em] text-gold-2 uppercase">
            {String(chapterIndex + 1).padStart(2, "0")} {hourLabel(shown)}
          </p>
          <SoundToggle />
        </div>
        <div className="absolute right-6 bottom-[4.6rem] left-6 z-10 h-px bg-sand/20 md:right-12 md:left-12">
          <div className="h-px bg-gold" style={{ width: `${shown * 100}%` }} />
        </div>
        <nav aria-label="Journey" className="absolute right-4 bottom-6 left-4 z-10 md:right-10 md:left-10">
          <ol className="flex gap-2 overflow-x-auto pb-1">
            {CHAPTERS.map((item) => {
              const active = item.label === chapter.label;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => seek(item.at)}
                    aria-current={active ? "step" : undefined}
                    className={`border px-3 py-2 text-[0.58rem] tracking-[0.16em] uppercase ${active ? "border-gold bg-ink/80 text-sand" : "border-gold/30 bg-ink/50 text-sand/60"}`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <nav
          aria-label="Services"
          className="absolute top-40 left-6 z-10 hidden max-w-xs space-y-2 md:block"
          style={{ opacity: shown > 0.64 && shown < 0.96 ? 1 : 0, pointerEvents: shown > 0.64 && shown < 0.96 ? "auto" : "none" }}
        >
          {services.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`} className="block text-[0.62rem] tracking-[0.14em] text-sand uppercase">
              0{service.order} {service.title}
            </Link>
          ))}
        </nav>
        <nav
          aria-label="Partner portfolio"
          className="absolute top-1/2 right-6 z-10 hidden max-h-[50vh] -translate-y-1/2 space-y-2 overflow-auto md:block"
          style={{ opacity: shown > 0.94 ? 1 : 0, pointerEvents: shown > 0.94 ? "auto" : "none" }}
        >
          {villas.map((villa) => (
            <Link key={villa.slug} href={`/portfolio/${villa.slug}`} className="block border border-gold/30 bg-ink/70 px-3 py-2 text-sand">
              <span className="block font-serif text-lg leading-none">{villa.name}</span>
              <span className="mt-1 block text-[0.58rem] tracking-[0.14em] text-gold-2 uppercase">{villa.location}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
