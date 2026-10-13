"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import Image from "next/image";
import { Suspense, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import type { PortfolioImage } from "@/content/portfolio";

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function PhotoPlanes({ images }: { images: PortfolioImage[] }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer }) => {
    if (!group.current) return;
    group.current.rotation.y = pointer.x * 0.16;
    group.current.rotation.x = pointer.y * -0.05;
  });
  const plates = images.slice(0, 6);
  return (
    <group ref={group}>
      {plates.map((image, index) => {
        const angle = (index / Math.max(plates.length, 1)) * Math.PI * 1.15 - 0.55;
        const radius = index === 0 ? 0.2 : 2.15;
        const y = index === 0 ? 0.15 : (index % 2 === 0 ? 0.35 : -0.15);
        return (
          <mesh
            key={image.src}
            position={index === 0 ? [0, 0.15, -0.4] : [Math.sin(angle) * radius, y, Math.cos(angle) * radius * 0.35 - 1.1]}
            rotation={[0, index === 0 ? 0 : -angle * 0.65, 0]}
          >
            <planeGeometry args={index === 0 ? [2.4, 1.5] : [1.15, 0.78]} />
            <meshBasicMaterial map={imageMap(image.src)} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
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

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url, false, true);
  return <primitive object={gltf.scene} />;
}

function Scene({ images, model }: { images: PortfolioImage[]; model?: string }) {
  return (
    <>
      <color attach="background" args={["#071014"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 2]} intensity={1.5} color="#fff1d2" />
      <Suspense fallback={null}>{model ? <Model url={model} /> : <PhotoPlanes images={images} />}</Suspense>
    </>
  );
}

export function ProjectScene({
  images,
  model,
  className = "h-[58vh] min-h-80",
}: {
  images: PortfolioImage[];
  model?: string;
  className?: string;
}) {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const lead = images[0];

  if (reduced) {
    return (
      <div className={`relative overflow-hidden border border-line bg-ink ${className}`}>
        {lead ? <Image src={lead.src} alt={lead.caption} fill className="object-cover" sizes="(min-width: 768px) 80vw, 100vw" /> : null}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden border border-line bg-ink ${className}`}>
      <Canvas camera={{ position: [0, 0.55, 4.4], fov: 36 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
        <Scene images={images} model={model} />
      </Canvas>
    </div>
  );
}
