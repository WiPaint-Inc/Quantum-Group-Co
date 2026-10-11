"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { focusTarget } from "@/content/site";

export function CameraRig({
  realm,
  focusId,
  reducedMotion,
}: {
  realm: "ocean" | "space";
  focusId: string | null;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.4, 0));
  const desired = useRef(new THREE.Vector3(0, 4.6, 15.5));
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const target = focusId ? focusTarget(focusId) : null;
    if (target && target.realm === realm) {
      desired.current.set(target.position[0] * 0.62, target.position[1] + 2.3, target.position[2] + 5.5);
      lookTarget.current.set(target.position[0], target.position[1] + 0.4, target.position[2]);
    } else if (realm === "space") {
      desired.current.set(Math.sin(t * 0.05) * 0.35, 3.15, 15.4);
      lookTarget.current.set(0, 1.25, 0);
    } else {
      desired.current.set(Math.sin(t * 0.08) * 0.5, 4.5 + Math.sin(t * 0.11) * 0.05, 15.5);
      lookTarget.current.set(0, 0.32, 0);
    }
    const k = 1 - Math.exp(-2.15 * dt);
    camera.position.lerp(desired.current, k);
    look.current.lerp(lookTarget.current, k);
    camera.lookAt(look.current);
  });

  return null;
}
