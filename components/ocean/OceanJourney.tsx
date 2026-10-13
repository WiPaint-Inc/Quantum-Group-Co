"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { scrollToY } from "@/components/experience/scroll";
import { OceanCanvas } from "@/components/ocean/OceanCanvas";
import { oceanStops } from "@/content/ocean-stops";
import { company } from "@/content/site";
import { contactReveal, nearestStop, stopPresence, stopProgress } from "@/lib/ocean-flight";
import { journeyPath } from "@/src/journey/path";

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
  const scaled = progress * (oceanStops.length - 1);
  if (scaled < 1.15) return "Morning";
  if (scaled < 2.15) return "Day";
  if (scaled < 3.05) return "Sunset";
  if (scaled < 6.15) return "Night";
  return "Dawn";
}

function HeroLockup({ heading = "h1" }: { heading?: "h1" | "h2" }) {
  const Title = heading;
  return (
    <>
      <p className="kicker">{company.name}</p>
      <Title className="mt-4 max-w-4xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl md:text-8xl">
        {company.heroTitle} <em className="text-gold italic">{company.heroAccent}</em>
      </Title>
      <p className="mt-6 max-w-xl text-base text-sand/80 md:text-lg">{company.heroSub}</p>
      <p className="mt-4 text-sm font-light tracking-wide text-sand/50">{company.heroQuiet}</p>
    </>
  );
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
  const capture = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("capture") === "1",
    () => false,
  );

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
              {index === 0 ? (
                <HeroLockup />
              ) : (
                <>
                  <p className="kicker">{stop.tag}</p>
                  <h2 className="mt-4 font-serif text-5xl leading-[0.9] text-sand sm:text-6xl">{stop.title}</h2>
                  <p className="mt-5 max-w-md text-sand/80">{stop.line}</p>
                </>
              )}
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
    <div ref={track} className="relative" style={{ height: `${journeyPath.timing.scrollTrackVh}vh` }} data-capture={capture ? "1" : undefined} data-journey="ocean">
      <div className="sticky top-0 h-dvh overflow-hidden bg-ink">
        <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0 }}>
          {showScene ? (
            <OceanCanvas progressRef={progressRef} introRef={introRef} draft={draft} reportFps={capture} onReady={() => setReady(true)} />
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
        <div className="pointer-events-none absolute bottom-28 left-6 z-20 max-w-3xl pr-14 md:left-12 md:pr-0" style={{ opacity: hero }}>
          <HeroLockup />
        </div>
        <p className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-[0.62rem] tracking-[0.28em] text-gold-2 uppercase" style={{ opacity: hero }}>
          Scroll to begin the journey
        </p>
        {oceanStops.map((stop, index) => {
          if (index === 0) return null;
          const presence = stop.id === "contact" ? contactReveal(progress) : stopPresence(progress, index);
          const study = draft && stop.id === "design-build"
            ? "Concept walkthrough · The Grand Beachfront Estate"
            : draft && stop.id === "construction"
              ? "Construction study · The Cliffside Residence"
              : null;
          if (stop.id === "contact") {
            return (
              <div key={stop.id} style={{ opacity: presence }} aria-hidden={presence < 0.4}>
                <div
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4,6,12,0.34) 0%, rgba(4,6,12,0.08) 18%, rgba(4,6,12,0) 36%, rgba(4,6,12,0) 64%, rgba(4,6,12,0.42) 100%)",
                  }}
                />
                <article className="pointer-events-none absolute inset-x-0 top-[14%] z-20 px-6 text-center md:top-[16%]">
                  <p className="kicker">{stop.tag}</p>
                  <h2 className="mx-auto mt-3 max-w-xl font-serif text-4xl leading-none text-sand md:text-5xl">{stop.title}</h2>
                  <p className="mx-auto mt-4 max-w-md text-sm text-sand/80 md:text-base">{stop.line}</p>
                </article>
                <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center px-6">
                  <Link href={stop.href} className="pointer-events-auto text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">{stop.cta}</Link>
                </div>
              </div>
            );
          }
          return (
            <div key={stop.id}>
              <article
                className="pointer-events-none absolute bottom-24 left-6 z-20 w-[min(26rem,calc(100%-7rem))] md:left-12"
                style={{ opacity: presence, transform: `translateY(${(1 - presence) * 16}px)` }}
                aria-hidden={presence < 0.4}
              >
                <div className="glass-panel pointer-events-auto px-6 py-6">
                  {study ? <p className="mb-3 text-[0.62rem] tracking-[0.22em] text-gold-2 uppercase">{study}</p> : null}
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
        <nav aria-label="Journey" className="absolute top-1/2 right-3 z-20 -translate-y-1/2 md:right-6">
          <ol className="flex flex-col items-end gap-3">
            {oceanStops.filter((stop) => stop.id !== "arrival").map((stop) => {
              const index = oceanStops.findIndex((item) => item.id === stop.id);
              const current = index === active;
              return (
                <li key={stop.id}>
                  <button
                    type="button"
                    onClick={() => seek(stopProgress(index))}
                    aria-current={current ? "step" : undefined}
                    className="flex items-center justify-end gap-2.5"
                  >
                    <span className={`text-[0.58rem] tracking-[0.18em] uppercase ${current ? "text-gold" : "hidden text-gold-2/80 md:inline"}`}>
                      {stop.short}
                    </span>
                    <span className={`block shrink-0 rounded-full ${current ? "h-2 w-2 bg-gold shadow-[0_0_8px_rgba(198,163,106,0.9)]" : "h-1.5 w-1.5 bg-gold-2/50"}`} />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
