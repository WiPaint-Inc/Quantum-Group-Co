"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OceanWorld } from "@/components/ocean/OceanWorld";
import { journeyPath } from "@/src/journey/path";

export function OceanCanvas({
  progressRef,
  introRef,
  draft,
  reportFps,
  onReady,
}: {
  progressRef: { current: number };
  introRef: { current: number };
  draft: boolean;
  reportFps?: boolean;
  onReady: () => void;
}) {
  const cap = Math.min(journeyPath.camera.maxPixelRatio, Math.max(1, window.devicePixelRatio || 1));
  const arrival = journeyPath.camera.arrival.position;
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ position: [arrival[0], arrival[1], arrival[2]], fov: journeyPath.camera.fovDeg, near: journeyPath.camera.near, far: journeyPath.camera.far }}
      dpr={[1, cap]}
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false, preserveDrawingBuffer: Boolean(reportFps) }}
      onCreated={({ gl }) => {
        gl.setClearColor("#07141c", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
        onReady();
      }}
    >
      <OceanWorld progressRef={progressRef} introRef={introRef} draft={draft} reportFps={reportFps} />
    </Canvas>
  );
}
