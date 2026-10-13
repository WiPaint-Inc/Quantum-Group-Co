"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { WalkthroughWorld } from "@/components/concept/WalkthroughWorld";
import { scrollToY } from "@/components/experience/scroll";
import { hasVillaModel, probeVillaSources, VILLA_POSTER, VILLA_VIDEO, type VillaSources } from "@/lib/villa-assets";
import { dominantPhase, phaseProgress, sampleVilla, type VillaPhase } from "@/lib/villa-flight";

const STAGES: { phase: VillaPhase; label: string }[] = [
  { phase: "blueprint", label: "Blueprint" },
  { phase: "structure", label: "Structure" },
  { phase: "finished", label: "Finished" },
  { phase: "interior", label: "Interior" },
];

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeNarrow(onChange: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isNarrow() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function subscribeLowPower() {
  return () => {};
}

function lowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return nav.connection?.saveData === true || cores <= 4 || memory <= 4;
}

const WalkCanvas = dynamic(() => Promise.resolve(WalkthroughCanvas), { ssr: false });

function WalkthroughCanvas({
  progressRef,
  sources,
  quality,
  onReady,
}: {
  progressRef: { current: number };
  sources: VillaSources;
  quality: "high" | "low";
  onReady: () => void;
}) {
  const start = sampleVilla(progressRef.current);
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ position: start.pos, fov: 42, near: 0.08, far: 180 }}
      dpr={quality === "low" ? [1, 1] : [1, 1.5]}
      gl={{ antialias: quality === "high", alpha: false, powerPreference: quality === "high" ? "high-performance" : "low-power", localClippingEnabled: true }}
      onCreated={({ gl }) => {
        gl.setClearColor("#10161b", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.localClippingEnabled = true;
        onReady();
      }}
    >
      <WalkthroughWorld progressRef={progressRef} sources={sources} />
    </Canvas>
  );
}

function VideoFallback({
  progressRef,
  scrub,
  poster,
}: {
  progressRef: { current: number };
  scrub: boolean;
  poster: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!scrub) return;
    const node = video.current;
    if (!node) return;
    let frame = 0;
    const apply = () => {
      if (Number.isFinite(node.duration) && node.duration > 0) {
        const next = progressRef.current * Math.max(0, node.duration - 0.05);
        if (Math.abs(node.currentTime - next) > 0.08) node.currentTime = next;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("quantum-scroll", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("quantum-scroll", onScroll);
    };
  }, [progressRef, scrub]);

  return (
    <video
      ref={video}
      className="absolute inset-0 h-full w-full object-cover"
      src={VILLA_VIDEO}
      poster={poster ? VILLA_POSTER : undefined}
      playsInline
      muted
      preload="metadata"
      controls={!scrub}
      aria-label="Concept walkthrough · Demo Villa"
    />
  );
}

export function ConceptWalkthrough() {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const lowPower = useSyncExternalStore(subscribeLowPower, lowPowerDevice, () => false);
  const [sources, setSources] = useState<VillaSources | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancel = false;
    probeVillaSources().then((next) => {
      if (!cancel) setSources(next);
    });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stop = params.get("stop") as VillaPhase | null;
    if (!stop || !(stop in { blueprint: 1, structure: 1, finished: 1, interior: 1 })) return;
    const at = phaseProgress(stop);
    progressRef.current = at;
    const node = track.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    const total = node.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + total * at, behavior: "auto" });
  }, [sources]);

  useEffect(() => {
    if (reduced) {
      progressRef.current = phaseProgress("finished");
      return;
    }
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
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("quantum-scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, sources]);

  function seek(phase: VillaPhase) {
    const node = track.current;
    if (!node) return;
    const at = phaseProgress(phase);
    const top = node.getBoundingClientRect().top + window.scrollY;
    const total = node.offsetHeight - window.innerHeight;
    scrollToY(top + total * at);
  }

  const stage = dominantPhase(reduced ? phaseProgress("finished") : progress);
  const useVideo = Boolean(sources?.video) && (reduced || narrow || lowPower);
  const quality = narrow || lowPower ? "low" : "high";
  const modelNote = sources && hasVillaModel(sources) ? "Model study" : "Procedural study, until a model is added";

  const stageCopy = (
    <div className="pointer-events-none absolute bottom-8 left-6 z-20 w-[min(28rem,calc(100%-7rem))] md:left-12">
      <div className="glass-panel pointer-events-auto px-6 py-6">
        <p className="kicker">Concept walkthrough · Demo Villa</p>
        <h1 className="mt-3 font-serif text-4xl leading-none text-sand md:text-5xl">Demo Villa</h1>
        <p className="mt-4 text-sm text-sand/75 md:text-base">
          Blueprint lines assemble, the structure rises, and the walk ends inside the room. This is a concept study. It is not a client project and it is not a completed house.
        </p>
        <p className="mt-3 text-[0.62rem] tracking-[0.18em] text-gold-2 uppercase">{modelNote} · {STAGES.find((item) => item.phase === stage)?.label}</p>
      </div>
    </div>
  );

  const stageNav = (
    <nav aria-label="Walkthrough" className="absolute top-28 right-4 z-20 hidden md:block">
      <ol className="space-y-2">
        {STAGES.map((item) => {
          const current = item.phase === stage;
          return (
            <li key={item.phase}>
              <button
                type="button"
                onClick={() => seek(item.phase)}
                aria-current={current ? "step" : undefined}
                className={`flex items-center gap-3 text-[0.58rem] tracking-[0.16em] uppercase ${current ? "text-sand" : "text-sand/45"}`}
              >
                <span className={`block h-1.5 w-1.5 rounded-full ${current ? "bg-gold" : "bg-sand/30"}`} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  if (reduced) {
    return (
      <div className="relative min-h-dvh bg-ink">
        <div className="relative h-dvh">
          {useVideo ? <VideoFallback progressRef={progressRef} scrub={false} poster={Boolean(sources?.poster)} /> : sources ? (
            <WalkCanvas progressRef={progressRef} sources={sources} quality="low" onReady={() => setReady(true)} />
          ) : null}
          {stageCopy}
        </div>
        <section className="px-6 py-16 md:px-12">
          <h2 className="font-serif text-3xl text-sand">The sequence, without motion</h2>
          <ol className="mt-6 max-w-xl space-y-3 text-sand/75">
            <li>Blueprint lines assemble on the plan.</li>
            <li>The structure rises from that plan.</li>
            <li>The finished shell replaces the frame.</li>
            <li>The view steps inside the room.</li>
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div ref={track} className="relative h-[640vh]" data-walkthrough="demo-villa">
      <div className="sticky top-0 h-dvh overflow-hidden bg-ink">
        {sources && useVideo ? <VideoFallback progressRef={progressRef} scrub poster={sources.poster} /> : null}
        {sources && !useVideo ? (
          <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0 }}>
            <WalkCanvas progressRef={progressRef} sources={sources} quality={quality} onReady={() => setReady(true)} />
          </div>
        ) : null}
        {stageCopy}
        {stageNav}
      </div>
    </div>
  );
}
