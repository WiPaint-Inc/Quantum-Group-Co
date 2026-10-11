"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { CameraRig } from "@/components/experience/CameraRig";
import { OceanRealm } from "@/components/experience/OceanRealm";
import { SkyDome } from "@/components/experience/SkyDome";
import { SpaceRealm } from "@/components/experience/SpaceRealm";

export type WorldStatus = "ready" | "lost";

export default function World({
  realm,
  focusId,
  reducedMotion,
  onStatus,
  onSelect,
  onHover,
  onPortal,
}: {
  realm: "ocean" | "space";
  focusId: string | null;
  reducedMotion: boolean;
  onStatus: (status: WorldStatus) => void;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onPortal: () => void;
}) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      shadows
      camera={{ position: [0, 4.5, 15.5], fov: 38, near: 0.1, far: 220 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onPointerMissed={() => onSelect(null)}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.setClearColor("#071014");
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onStatus("lost");
        });
        onStatus("ready");
      }}
    >
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <SkyDome realm={realm} />
        <hemisphereLight args={["#d7fff8", "#e0c49a", 0.62]} />
        <ambientLight intensity={0.22} color="#16343c" />
        <directionalLight
          castShadow
          position={[16, 12, 8]}
          intensity={2.5}
          color="#ffc79a"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={46}
          shadow-camera-left={-18}
          shadow-camera-right={18}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
        />
        <OceanRealm
          visible={realm === "ocean"}
          focusId={focusId}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
          onHover={onHover}
          onPortal={onPortal}
        />
        <SpaceRealm
          visible={realm === "space"}
          focusId={focusId}
          reducedMotion={reducedMotion}
          onSelect={(id) => onSelect(id)}
        />
        <CameraRig realm={realm} focusId={focusId} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
