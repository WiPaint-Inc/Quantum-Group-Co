"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { scrollToY } from "@/components/experience/scroll";
import type { PortfolioImage } from "@/content/portfolio";

export type Place = {
  slug: string;
  name: string;
  location: string;
  caption: string;
  images: PortfolioImage[];
};

const GAP = 7.5;

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

const maps = new Map<string, THREE.Texture>();

function imageMap(src: string) {
  const cached = maps.get(src);
  if (cached) return cached;
  const texture = new THREE.TextureLoader().load(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  maps.set(src, texture);
  return texture;
}

function Places({ places, progressRef }: { places: Place[]; progressRef: { current: number } }) {
  const router = useRouter();
  const cameraTarget = useRef(new THREE.Vector3(0, 1.05, 4.6));
  const look = useRef(new THREE.Vector3(0, 0.35, 0));

  useFrame(({ camera }, delta) => {
    const maxIndex = Math.max(places.length - 1, 1);
    const x = progressRef.current * maxIndex * GAP;
    const damp = 1 - Math.exp(-3 * delta);
    cameraTarget.current.set(x, 1.05, 4.6);
    camera.position.lerp(cameraTarget.current, damp);
    look.current.set(x, 0.35, 0);
    camera.lookAt(look.current);
  });

  return (
    <>
      <color attach="background" args={["#071014"]} />
      <fog attach="fog" args={["#071014", 8, 22]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} color="#fff1d2" />
      {places.map((place, index) => {
        const plates = place.images.slice(0, 3);
        return (
          <group key={place.slug} position={[index * GAP, 0, 0]}>
            {plates.map((image, plate) => (
              <mesh
                key={image.src}
                position={[(plate - 1) * 1.15, 0.45, plate === 1 ? -0.35 : 0.15]}
                rotation={[0, (plate - 1) * -0.18, 0]}
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/portfolio/${place.slug}`);
                }}
              >
                <planeGeometry args={plate === 1 ? [1.7, 1.15] : [1.05, 0.72]} />
                <meshBasicMaterial map={imageMap(image.src)} toneMapped={false} />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}

export function PortfolioPlaces({ places }: { places: Place[] }) {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
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
      setProgress((current) => {
        const max = Math.max(places.length - 1, 1);
        const indexAt = (value: number) => Math.min(places.length - 1, Math.max(0, Math.round(value * max)));
        if (indexAt(current) !== indexAt(next + 0.02)) return next;
        return Math.abs(current - next) < 0.01 ? current : next;
      });
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
  }, [reduced, places.length]);

  if (reduced || places.length === 0) return null;

  const index = Math.min(places.length - 1, Math.round(progress * (places.length - 1)));
  const current = places[index];

  function seek(at: number) {
    const node = track.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    const total = node.offsetHeight - window.innerHeight;
    scrollToY(top + total * at);
  }

  return (
    <div ref={track} className="relative" style={{ height: `${places.length * 80}vh` }} data-places="journey">
      <div className="sticky top-0 h-dvh overflow-hidden bg-ink">
        <Canvas camera={{ position: [0, 1.05, 4.6], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
          <Places places={places} progressRef={progressRef} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/25" />
        {current ? (
          <div className="absolute bottom-24 left-6 max-w-lg md:left-12">
            <p className="kicker">
              {String(index + 1).padStart(2, "0")} / {String(places.length).padStart(2, "0")}
            </p>
            <h2 className="mt-3 font-serif text-5xl text-sand md:text-7xl">{current.name}</h2>
            <p className="mt-3 text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">{current.location}</p>
            <p className="mt-4 max-w-md text-sm text-sand/75">{current.caption}</p>
            <Link href={`/portfolio/${current.slug}`} className="pointer-events-auto mt-6 inline-block border-b border-gold pb-1 text-[0.68rem] tracking-[0.2em] text-sand uppercase">
              Visit
            </Link>
          </div>
        ) : null}
        <nav aria-label="Projects" className="absolute right-4 bottom-6 left-4 z-10 md:right-10 md:left-10">
          <ol className="flex gap-2 overflow-x-auto">
            {places.map((place, placeIndex) => {
              const active = place.slug === current?.slug;
              return (
                <li key={place.slug}>
                  <button
                    type="button"
                    onClick={() => seek(places.length === 1 ? 0 : placeIndex / (places.length - 1))}
                    className={`border px-3 py-2 text-[0.58rem] tracking-[0.16em] uppercase ${active ? "border-gold bg-ink/80 text-sand" : "border-gold/30 bg-ink/50 text-sand/60"}`}
                  >
                    {place.name}
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
