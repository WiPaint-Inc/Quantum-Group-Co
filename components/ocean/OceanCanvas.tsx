"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OceanWorld } from "@/components/ocean/OceanWorld";

export function OceanCanvas({
  progressRef,
  introRef,
  quality,
  draft,
  reportFps,
  onReady,
}: {
  progressRef: { current: number };
  introRef: { current: number };
  quality: "high" | "low";
  draft: boolean;
  reportFps?: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ position: [420, 278, 980], fov: quality === "low" ? 52 : 46, near: 0.12, far: 28000 }}
      dpr={quality === "high" ? [1, 1.25] : [1, 1]}
      gl={{ antialias: quality === "high", alpha: false, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: Boolean(reportFps) }}
      onCreated={({ gl }) => {
        gl.setClearColor("#07141c", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady();
      }}
    >
      <OceanWorld progressRef={progressRef} introRef={introRef} quality={quality} draft={draft} reportFps={reportFps} />
    </Canvas>
  );
}
