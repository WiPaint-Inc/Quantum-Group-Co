"use client";

import { Canvas } from "@react-three/fiber";
import { World } from "@/components/experience/World";

export function ExperienceCanvas({
  progressRef,
  quality,
  onReady,
}: {
  progressRef: { current: number };
  quality: "high" | "low";
  onReady: () => void;
}) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [11, 6.2, 16], fov: 36, near: 0.1, far: 140 }}
      dpr={quality === "high" ? [1, 1.5] : 1}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#071014", 0);
        onReady();
      }}
    >
      <World progressRef={progressRef} quality={quality} />
    </Canvas>
  );
}
