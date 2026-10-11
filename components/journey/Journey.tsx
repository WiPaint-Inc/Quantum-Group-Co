"use client";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { posterImage, services } from "@/content/site";

const JourneyScene = dynamic(() => import("@/components/journey/JourneyScene"), { ssr: false });

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function wantsStill() {
  const forced = new URLSearchParams(window.location.search).get("experience");
  if (forced === "still") return true;
  if (forced === "webgl") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.innerWidth < 900) return true;
  return false;
}

export function Journey() {
  const still = useSyncExternalStore(subscribe, wantsStill, () => true);
  const [override, setOverride] = useState<boolean | null>(null);
  const useStill = override ?? still;
  const progressRef = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (useStill) return;
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const total = node.offsetHeight - window.innerHeight;
      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
      progressRef.current = next;
      const index = Math.min(services.length - 1, Math.floor(next * services.length));
      setStage((current) => (current === index ? current : index));
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
  }, [useStill]);

  if (useStill) {
    return (
      <div>
        <div className="relative min-h-[70dvh]">
          <Image src={posterImage} alt="A finished villa, used when the animated sequence is not shown." fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
          <div className="relative z-10 flex min-h-[70dvh] flex-col justify-end px-6 pt-28 pb-12">
            <p className="kicker">Still edition</p>
            <p className="mt-4 max-w-xl font-serif text-4xl text-sand">The sequence, held still.</p>
            <button type="button" className="mt-6 text-left text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase" onClick={() => setOverride(false)}>
              Play the sequence
            </button>
          </div>
        </div>
        <ol>
          {services.map((service) => (
            <li key={service.slug} className="border-t border-line px-6 py-16 md:px-14">
              <p className="kicker">0{service.order}</p>
              <h2 className="mt-3 font-serif text-5xl text-sand">{service.title}</h2>
              <p className="mt-4 max-w-lg text-sand/70">{service.lede}</p>
              <Link href={`/services/${service.slug}`} className="mt-6 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
                Open the service
              </Link>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const current = services[stage];

  return (
    <div ref={track} className="relative h-[420vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <Canvas
          className="h-full w-full"
          camera={{ position: [0.4, 3.2, 7.2], fov: 36 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#07060b");
          }}
        >
          <JourneyScene
            progressRef={progressRef}
            onService={(slug) => router.push(`/services/${slug}`)}
          />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/75 via-transparent to-transparent" />
        <nav className="absolute top-28 right-8 z-10 flex w-72 flex-col gap-3 border border-line bg-ink/70 p-5" aria-label="Service chapters">
          <p className="text-[0.62rem] tracking-[0.22em] text-gold-2 uppercase">Chapters</p>
          {services.map((service, index) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className={index === stage ? "text-[0.68rem] tracking-[0.14em] text-sand uppercase" : "text-[0.68rem] tracking-[0.14em] text-sand/50 uppercase"}
            >
              0{service.order} {service.title}
            </Link>
          ))}
        </nav>
        <div className="pointer-events-none absolute right-6 bottom-8 left-6 md:left-12 md:max-w-xl">
          <p className="kicker">0{current.order}</p>
          <h2 className="mt-3 font-serif text-5xl text-sand md:text-7xl">{current.title}</h2>
          <p className="mt-4 max-w-md text-sand/75">{current.lede}</p>
          <p className="sr-only">
            {services.map((service) => `${service.order}. ${service.title}. ${service.lede}`).join(" ")}
          </p>
        </div>
        <button
          type="button"
          className="absolute top-24 right-6 z-10 text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase"
          onClick={() => setOverride(true)}
        >
          View stills
        </button>
      </div>
    </div>
  );
}
