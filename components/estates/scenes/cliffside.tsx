"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CliffStudy } from "@/components/ocean/EstateFlyIns";

export default function CliffsideScene() {
  const { camera } = useThree();
  const progress = useRef(1);

  useEffect(() => {
    const view = camera as THREE.PerspectiveCamera;
    view.fov = 46;
    view.near = 0.15;
    view.far = 800;
    view.position.set(22, 16, 36);
    view.lookAt(0, 5, 0);
    view.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      <color attach="background" args={["#12151c"]} />
      <CliffStudy progressRef={progress} forceNight={1} />
    </>
  );
}
