"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { estateSceneModules } from "@/components/estates/scene-modules";
import type { Walkthrough3d } from "@/content/estates";

const EYE = 1.6;

function WalkControls({ subject }: { subject?: THREE.Object3D }) {
  const orbit = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const forward = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const eyeY = useRef(EYE);
  const yaw = useRef(0);
  const pitch = useRef(-0.12);
  const framed = useRef(false);

  useLayoutEffect(() => {
    if (!subject || framed.current) return;
    const box = new THREE.Box3().setFromObject(subject);
    if (box.isEmpty()) return;
    framed.current = true;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const span = Math.max(size.x, size.y, size.z, 1);
    eyeY.current = box.min.y + EYE;
    camera.position.set(center.x + span * 0.75, Math.max(eyeY.current, center.y + span * 0.35), center.z + span * 0.95);
    camera.near = Math.max(0.05, span / 400);
    camera.far = span * 40;
    camera.updateProjectionMatrix();
    camera.lookAt(center);
    orbit.current?.target.copy(center);
  }, [camera, subject]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.code);
      if (document.pointerLockElement === gl.domElement && (event.code === "KeyW" || event.code === "KeyA" || event.code === "KeyS" || event.code === "KeyD")) {
        event.preventDefault();
      }
    };
    const up = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };
    const look = (event: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      yaw.current -= event.movementX * 0.0022;
      pitch.current = Math.max(-1.05, Math.min(1.05, pitch.current - event.movementY * 0.0022));
    };
    const locked = () => {
      if (document.pointerLockElement !== gl.domElement) return;
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
      yaw.current = euler.y;
      pitch.current = euler.x;
      camera.position.y = eyeY.current;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("mousemove", look);
    document.addEventListener("pointerlockchange", locked);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("mousemove", look);
      document.removeEventListener("pointerlockchange", locked);
    };
  }, [camera, gl]);

  useFrame((_, dt) => {
    const controls = orbit.current;
    const lockedNow = document.pointerLockElement === gl.domElement;
    if (controls) controls.enabled = !lockedNow;
    if (!lockedNow) return;
    const step = Math.min(dt, 0.05) * 3.2;
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    else forward.normalize();
    side.crossVectors(forward, camera.up).normalize();
    if (keys.current.has("KeyW")) camera.position.addScaledVector(forward, step);
    if (keys.current.has("KeyS")) camera.position.addScaledVector(forward, -step);
    if (keys.current.has("KeyD")) camera.position.addScaledVector(side, step);
    if (keys.current.has("KeyA")) camera.position.addScaledVector(side, -step);
    camera.position.y = eyeY.current;
  });

  return <OrbitControls ref={orbit} enablePan={false} enableDamping />;
}

function GlbView({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return (
    <>
      <primitive object={gltf.scene} />
      <WalkControls subject={gltf.scene} />
    </>
  );
}

function SceneView({ name, onFail }: { name: string; onFail: () => void }) {
  const load = estateSceneModules[name];
  const [Mod, setMod] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!load) {
      onFail();
      return;
    }
    let live = true;
    load()
      .then((mod) => {
        if (live) setMod(() => mod.default);
      })
      .catch(() => {
        if (live) onFail();
      });
    return () => {
      live = false;
    };
  }, [load, onFail]);

  if (!Mod) return null;
  return (
    <>
      <Mod />
      <WalkControls />
    </>
  );
}

export function WalkthroughStage({ config, onFail }: { config: Walkthrough3d; onFail: () => void }) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      dpr={[1, 1.25]}
      camera={{ fov: 50, near: 0.1, far: 200, position: [8, 4, 12] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
        gl.setClearColor("#141210", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <hemisphereLight args={["#f4efe4", "#2a241c", 0.9]} />
      <directionalLight position={[14, 18, 8]} intensity={1.5} />
      <Suspense fallback={null}>
        {"glb" in config ? <GlbView url={config.glb} /> : <SceneView name={config.scene} onFail={onFail} />}
      </Suspense>
    </Canvas>
  );
}
