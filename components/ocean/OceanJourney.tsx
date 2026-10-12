"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { scrollToY } from "@/components/experience/scroll";
import { OceanCanvas } from "@/components/ocean/OceanCanvas";
import { PlateBlueprint } from "@/components/ocean/PlateBlueprint";
import { oceanStops } from "@/content/ocean-stops";
import { company } from "@/content/site";
import { contactReveal, nearestStop, stopPresence, stopProgress } from "@/lib/ocean-flight";

function subscribeMounted() {
  return () => {};
}

function mountedOnClient() {
  return true;
}

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function phaseLabel(progress: number) {
  if (progress < 0.18) return "Morning";
  if (progress < 0.4) return "Day";
  if (progress < 0.55) return "Sunset";
  if (progress < 0.86) return "Night";
  return "Dawn";
}

function OceanSound() {
  const [on, setOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => {
    stop.current?.();
    void audio.current?.close();
  }, []);

  function toggle() {
    if (on) {
      stop.current?.();
      stop.current = null;
      setOn(false);
      return;
    }
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    void context.resume();
    const length = context.sampleRate * 2;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 680;
    const gain = context.createGain();
    gain.gain.value = 0.045;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();
    stop.current = () => {
      gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 0.25);
      source.stop(context.currentTime + 0.3);
    };
    setOn(true);
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={on} className="pointer-events-auto border border-gold/40 bg-ink/55 px-3 py-2 text-[0.62rem] tracking-[0.22em] text-sand uppercase backdrop-blur-md">
      Sound {on ? "on" : "off"}
    </button>
  );
}

export function OceanJourney({ draft }: { draft: boolean }) {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const showScene = useSyncExternalStore(subscribeMounted, mountedOnClient, () => false);
  const progressRef = useRef(0);
  const introRef = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const capture = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("capture") === "1",
    () => false,
  );

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const apply = () => setQuality(mobile.matches ? "low" : "high");
    apply();
    mobile.addEventListener("change", apply);
    return () => mobile.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const filming = new URLSearchParams(window.location.search).get("capture") === "1";
    introRef.current = filming || reduced ? 1 : 0;
    if (introRef.current === 1) return;
    let start = 0;
    let frame = 0;
    let skipped = false;
    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / 1600);
      introRef.current = t * t * (3 - 2 * t);
      if (t < 1 && !skipped) frame = requestAnimationFrame(step);
      else introRef.current = 1;
    };
    frame = requestAnimationFrame(step);
    const skip = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button")) return;
      skipped = true;
      introRef.current = 1;
    };
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const total = node.offsetHeight - window.innerHeight;
      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
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
    const params = new URLSearchParams(window.location.search);
    const stop = params.get("stop");
    if (stop) {
      const index = oceanStops.findIndex((item) => item.id === stop);
      if (index >= 0) {
        window.setTimeout(() => seek(stopProgress(index), true), 80);
      }
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("quantum-scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  function seek(at: number, immediate = false) {
    const node = track.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    const total = node.offsetHeight - window.innerHeight;
    const target = top + total * at;
    if (immediate) {
      progressRef.current = at;
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    scrollToY(target);
  }

  if (reduced) {
    return (
      <div>
        {oceanStops.map((stop, index) => (
          <article key={stop.id} id={stop.id} className="relative flex min-h-dvh items-end px-6 py-28 md:px-14">
            <div className={index > 6 ? "still-space" : "still-ocean"} />
            <div className="still-horizon" />
            <div className="relative z-10 max-w-xl">
              <p className="kicker">{stop.tag}</p>
              {index === 0 ? (
                <h1 className="mt-4 font-serif text-5xl leading-[0.9] text-sand sm:text-7xl">{stop.title}</h1>
              ) : (
                <h2 className="mt-4 font-serif text-5xl leading-[0.9] text-sand sm:text-6xl">{stop.title}</h2>
              )}
              <p className="mt-5 max-w-md text-sand/80">{stop.line}</p>
              <div className="mt-6 flex flex-wrap gap-5">
                <Link href={stop.href} className="border-b border-gold pb-1 text-[0.68rem] tracking-[0.22em] text-sand uppercase">{stop.cta}</Link>
                {stop.secondary ? <Link href={stop.secondary.href} className="text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">{stop.secondary.label}</Link> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  const active = nearestStop(progress);
  const hero = 1 - Math.min(1, progress / 0.045);

  return (
    <div ref={track} className="relative h-[1100vh]" data-capture={capture ? "1" : undefined} data-journey="ocean">
      <div className="sticky top-0 h-dvh overflow-hidden bg-ink">
        <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0 }}>
          {showScene ? (
            <OceanCanvas progressRef={progressRef} introRef={introRef} quality={quality} draft={draft} reportFps={capture} onReady={() => setReady(true)} />
          ) : null}
        </div>
        {ready ? null : (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink">
            <p className="font-serif text-2xl tracking-[0.18em] text-sand uppercase">{company.name}</p>
            <div className="mt-8 h-px w-40 bg-sand/15">
              <div className="loader-bar h-px bg-gold" />
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex items-start justify-between px-6 md:px-12">
          <p className="text-[0.62rem] tracking-[0.28em] text-gold-2 uppercase">{phaseLabel(progress)}</p>
          <OceanSound />
        </div>
        <div className="pointer-events-none absolute bottom-28 left-6 z-20 max-w-3xl md:left-12" style={{ opacity: hero }}>
          <p className="kicker">{company.name}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[0.9] text-sand sm:text-7xl md:text-8xl">{company.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-base text-sand/80 md:text-lg">{company.heroSub}</p>
        </div>
        <p className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-[0.62rem] tracking-[0.28em] text-gold-2 uppercase" style={{ opacity: hero }}>
          Scroll to begin the journey
        </p>
        {oceanStops.map((stop, index) => {
          if (index === 0) return null;
          const presence = stop.id === "contact" ? contactReveal(progress) : stopPresence(progress, index);
          const plateOpacity = draft && stop.plate ? Math.min(1, Math.max(0, (presence - 0.62) / 0.32)) : 0;
          return (
            <div key={stop.id}>
              {plateOpacity > 0.02 ? (
                <div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: plateOpacity }}>
                  <Image src={`/concept/${stop.plate}-1280.webp`} alt="Concept render" fill className="object-cover" sizes="100vw" />
                  <PlateBlueprint plate={stop.plate} draw={Math.min(1, Math.max(0, (presence - 0.5) / 0.28))} />
                  <p className="absolute bottom-36 left-6 text-[0.62rem] tracking-[0.22em] text-sand uppercase md:left-12">
                    Concept render{stop.plateCaption ? ` · ${stop.plateCaption}` : ""}
                  </p>
                </div>
              ) : null}
              <article
                className="pointer-events-none absolute bottom-24 left-6 z-20 w-[min(26rem,calc(100%-7rem))] md:left-12"
                style={{ opacity: presence, transform: `translateY(${(1 - presence) * 16}px)` }}
                aria-hidden={presence < 0.4}
              >
                <div className="glass-panel pointer-events-auto px-6 py-6">
                  <p className="kicker">{stop.tag}</p>
                  <h2 className="mt-3 font-serif text-4xl leading-none text-sand md:text-5xl">{stop.title}</h2>
                  <p className="mt-4 text-sm text-sand/75 md:text-base">{stop.line}</p>
                  <div className="mt-5 flex flex-wrap gap-4">
                    <Link href={stop.href} className="text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">{stop.cta}</Link>
                    {stop.secondary ? (
                      <Link href={stop.secondary.href} className="text-[0.68rem] tracking-[0.2em] text-sand/70 uppercase">{stop.secondary.label}</Link>
                    ) : null}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
        <nav aria-label="Journey" className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 md:block">
          <ol className="space-y-2">
            {oceanStops.map((stop, index) => {
              const current = index === active;
              return (
                <li key={stop.id}>
                  <button
                    type="button"
                    onClick={() => seek(stopProgress(index))}
                    aria-current={current ? "step" : undefined}
                    className={`flex items-center gap-3 text-[0.58rem] tracking-[0.16em] uppercase ${current ? "text-sand" : "text-sand/45"}`}
                  >
                    <span className={`block h-1.5 w-1.5 rounded-full ${current ? "bg-gold" : "bg-sand/30"}`} />
                    {stop.short}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <nav aria-label="Journey" className="absolute right-4 bottom-4 left-4 z-20 md:hidden">
          <ol className="flex gap-2 overflow-x-auto pb-1">
            {oceanStops.map((stop, index) => (
              <li key={stop.id}>
                <button type="button" onClick={() => seek(stopProgress(index))} aria-current={index === active ? "step" : undefined} className={`border px-3 py-2 text-[0.58rem] tracking-[0.14em] uppercase ${index === active ? "border-gold text-sand" : "border-gold/25 text-sand/50"}`}>
                  {stop.short}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
