"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { islandScale, oceanStops } from "@/content/ocean-stops";
import { hash, islandHeight, makeCanopyDome, makeCanopyTexture, makeIsland, makePalm } from "@/components/ocean/geometry";
import { linesFor } from "@/components/ocean/linework";
import {
  canopyFragment,
  canopyVertex,
  islandFragment,
  islandVertex,
  lineFragment,
  lineVertex,
  skyFragment,
  skyVertex,
  waterFragment,
  waterVertex,
} from "@/components/ocean/shaders";
import { drawAmount, sampleFlight, scenicCays, stopPresence } from "@/lib/ocean-flight";

const GOLD = new THREE.Color("#e6d2a8");

export function OceanWorld({
  progressRef,
  introRef,
  quality,
  draft,
  reportFps,
}: {
  progressRef: { current: number };
  introRef: { current: number };
  quality: "high" | "low";
  draft: boolean;
  reportFps?: boolean;
}) {
  const normal = useMemo(() => {
    const texture = new THREE.TextureLoader().load("/textures/waternormals.jpg");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.NoColorSpace;
    return texture;
  }, []);

  const canopyTex = useMemo(() => makeCanopyTexture(), []);

  const islands = useMemo(() => {
    const segs = quality === "high" ? 80 : 40;
    return [...oceanStops, ...scenicCays]
      .filter((stop) => stop.size !== "none")
      .map((stop) => {
        const scale = islandScale(stop.size);
        return {
          stop,
          scale,
          geometry: makeIsland(scale.radius, scale.peak, scale.stretch, segs),
          lines: oceanStops.includes(stop) ? linesFor(stop.kind, scale.radius) : null,
        };
      });
  }, [quality]);

  const islandUniform = useMemo(() => {
    const values = Array.from({ length: 16 }, () => new THREE.Vector4());
    islands.slice(0, 16).forEach((island, index) => {
      values[index].set(island.stop.x, island.stop.z, island.scale.radius, island.scale.stretch);
    });
    return values;
  }, [islands]);

  const water = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          uTime: { value: 0 },
          uCamera: { value: new THREE.Vector3() },
          uNormal: { value: normal },
          uSun: { value: new THREE.Vector3(0.2, 0.4, 0.3) },
          uSunColor: { value: new THREE.Color("#ffe0b0") },
          uMoon: { value: new THREE.Vector3(-0.4, 0.7, -0.3) },
          uHorizon: { value: new THREE.Color("#8eafc4") },
          uZenith: { value: new THREE.Color("#1a5c96") },
          uNight: { value: 0 },
          uIslands: { value: islandUniform },
          uIslandCount: { value: Math.min(16, islands.length) },
        },
        vertexShader: waterVertex,
        fragmentShader: waterFragment,
      }),
    [islandUniform, islands.length, normal],
  );

  const sky = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uHorizon: { value: new THREE.Color("#8eafc4") },
          uZenith: { value: new THREE.Color("#1a5c96") },
          uSun: { value: new THREE.Vector3() },
          uSunColor: { value: new THREE.Color("#ffe0b0") },
          uMoon: { value: new THREE.Vector3(-0.42, 0.72, -0.28) },
          uNight: { value: 0 },
        },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
      }),
    [],
  );

  const land = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          uSun: { value: new THREE.Vector3() },
          uSunColor: { value: new THREE.Color("#ffe0b0") },
          uMoon: { value: new THREE.Vector3(-0.42, 0.72, -0.28) },
          uNight: { value: 0 },
          uCanopy: { value: canopyTex },
        },
        vertexShader: islandVertex,
        fragmentShader: islandFragment,
      }),
    [canopyTex],
  );

  const canopyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          uTime: { value: 0 },
          uSun: { value: new THREE.Vector3() },
          uSunColor: { value: new THREE.Color("#ffe0b0") },
          uNight: { value: 0 },
          uCanopy: { value: canopyTex },
        },
        vertexShader: canopyVertex,
        fragmentShader: canopyFragment,
      }),
    [canopyTex],
  );

  const lineMaterials = useMemo(() => {
    const map = new Map<string, THREE.ShaderMaterial>();
    for (const island of islands) {
      if (!island.lines) continue;
      map.set(island.stop.id, new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uDraw: { value: 0 },
          uWash: { value: 0 },
          uNight: { value: 0 },
          uFade: { value: 1 },
          uColor: { value: GOLD.clone() },
        },
        vertexShader: lineVertex,
        fragmentShader: lineFragment,
      }));
    }
    return map;
  }, [islands]);

  const plates = useMemo(() => {
    if (!draft) return [] as Array<{ id: string; mesh: THREE.Mesh }>;
    const loader = new THREE.TextureLoader();
    return oceanStops.flatMap((stop) => {
      if (!stop.plate) return [];
      const scale = islandScale(stop.size);
      const texture = loader.load(`/concept/${stop.plate}-1280.webp`);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(scale.radius * 0.72, scale.radius * 0.4), material);
      mesh.position.set(stop.x, Math.max(8, scale.peak * 0.85), stop.z);
      mesh.renderOrder = 3;
      return [{ id: stop.id, mesh }];
    });
  }, [draft]);

  const palm = useMemo(() => {
    const geometry = makePalm();
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         transformed.x += sin(uTime * 1.3 + position.z * 0.8) * 0.12 * smoothstep(1.5, 6.0, position.y);
         transformed.z += cos(uTime * 1.1 + position.x) * 0.08 * smoothstep(1.5, 6.0, position.y);`,
      );
      material.userData.shader = shader;
    };
    const spots: Array<{ x: number; y: number; z: number; rot: number; scale: number }> = [];
    for (const island of islands) {
      const budget = quality === "high"
        ? island.scale.radius > 150 ? 10 : island.scale.radius > 80 ? 6 : 3
        : island.scale.radius > 80 ? 3 : 2;
      for (let i = 0; i < budget; i += 1) {
        const seed = hash(island.stop.x * 0.01 + island.stop.z * 0.013 + i * 17.3);
        const seed2 = hash(seed * 9.1 + 2);
        const ang = seed * Math.PI * 2;
        const dist = 0.74 + seed2 * 0.14;
        const x = Math.cos(ang) * island.scale.radius * dist * island.scale.stretch;
        const z = Math.sin(ang) * island.scale.radius * dist;
        const y = islandHeight(dist, island.scale.peak);
        spots.push({
          x: island.stop.x + x,
          y,
          z: island.stop.z + z,
          rot: seed * Math.PI * 2,
          scale: 2.4 + seed2 * 0.8,
        });
      }
    }
    return { geometry, material, spots };
  }, [islands, quality]);

  const masses = useMemo(() => {
    const geometry = makeCanopyDome();
    const spots: Array<{ x: number; y: number; z: number; sx: number; sy: number; sz: number; rot: number }> = [];
    for (const island of islands) {
      const budget = quality === "high"
        ? island.scale.radius > 150 ? 22 : island.scale.radius > 80 ? 12 : 4
        : island.scale.radius > 80 ? 7 : 3;
      for (let i = 0; i < budget; i += 1) {
        const seed = hash(island.stop.x * 0.02 + i * 3.1 + island.stop.z * 0.01);
        const seed2 = hash(seed * 4.2 + 8);
        const ang = seed * Math.PI * 2;
        const dist = 0.12 + seed2 * 0.5;
        const x = Math.cos(ang) * island.scale.radius * dist * island.scale.stretch;
        const z = Math.sin(ang) * island.scale.radius * dist;
        const y = islandHeight(dist, island.scale.peak);
        const span = island.scale.radius * (0.08 + seed * 0.07);
        spots.push({
          x: island.stop.x + x,
          y: Math.max(0.4, y - 0.4),
          z: island.stop.z + z,
          sx: span,
          sy: 4.5 + seed2 * 5.5,
          sz: span * (0.75 + seed2 * 0.35),
          rot: seed * Math.PI * 2,
        });
      }
    }
    return { geometry, spots };
  }, [islands, quality]);

  const birds = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([
      0, 0, 0, -1.1, 0.04, -0.35, -1, 0, 0.12,
      0, 0, 0, 1.1, 0.04, -0.35, 1, 0, 0.12,
    ], 3));
    const count = quality === "high" ? 14 : 5;
    return { geometry, count };
  }, [quality]);

  useEffect(() => () => {
    normal.dispose();
    canopyTex.dispose();
    water.dispose();
    sky.dispose();
    land.dispose();
    canopyMat.dispose();
    palm.geometry.dispose();
    palm.material.dispose();
    masses.geometry.dispose();
    birds.geometry.dispose();
    for (const island of islands) island.geometry.dispose();
    for (const island of islands) island.lines?.dispose();
    for (const material of lineMaterials.values()) material.dispose();
    for (const plate of plates) {
      plate.mesh.geometry.dispose();
      (plate.mesh.material as THREE.Material).dispose();
    }
  }, [birds.geometry, canopyMat, canopyTex, islands, land, lineMaterials, masses.geometry, normal, palm.geometry, palm.material, plates, sky, water]);

  const { camera, scene } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const fps = useRef(60);
  const birdMesh = useRef<THREE.InstancedMesh>(null);
  const skyMesh = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const hemi = useMemo(() => new THREE.HemisphereLight("#c5d7ea", "#1c3a32", 0.55), []);
  const sunLight = useMemo(() => new THREE.DirectionalLight("#fff1d2", 1.5), []);

  useEffect(() => {
    scene.add(hemi);
    scene.add(sunLight);
    scene.add(sunLight.target);
    for (const plate of plates) scene.add(plate.mesh);
    return () => {
      scene.remove(hemi);
      scene.remove(sunLight);
      scene.remove(sunLight.target);
      for (const plate of plates) scene.remove(plate.mesh);
    };
  }, [hemi, plates, scene, sunLight]);

  useFrame(({ clock }, delta) => {
    const flight = sampleFlight(progressRef.current);
    const intro = 1 - introRef.current;
    desired.set(flight.pos[0], flight.pos[1] + intro * 30, flight.pos[2] + intro * 220);
    desired.y = Math.min(300, Math.max(120, desired.y));
    desiredLook.set(flight.look[0], flight.look[1], flight.look[2]);
    const damp = 1 - Math.exp(-2.4 * delta);
    camera.position.lerp(desired, damp);
    look.lerp(desiredLook, damp);
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.rotateZ(flight.bank);
    if (skyMesh.current) skyMesh.current.position.copy(camera.position);
    const time = clock.elapsedTime;
    water.uniforms.uTime.value = time;
    water.uniforms.uCamera.value.copy(camera.position);
    canopyMat.uniforms.uTime.value = time;
    const palmShader = palm.material.userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
    if (palmShader) palmShader.uniforms.uTime.value = time;
    const sun = water.uniforms.uSun.value as THREE.Vector3;
    sun.set(flight.sun[0], flight.sun[1], flight.sun[2]);
    (sky.uniforms.uSun.value as THREE.Vector3).copy(sun);
    (land.uniforms.uSun.value as THREE.Vector3).copy(sun);
    (canopyMat.uniforms.uSun.value as THREE.Vector3).copy(sun);
    const sunColor = water.uniforms.uSunColor.value as THREE.Color;
    sunColor.setRGB(flight.sunColor[0], flight.sunColor[1], flight.sunColor[2]);
    (sky.uniforms.uSunColor.value as THREE.Color).copy(sunColor);
    (land.uniforms.uSunColor.value as THREE.Color).copy(sunColor);
    (canopyMat.uniforms.uSunColor.value as THREE.Color).copy(sunColor);
    const horizon = water.uniforms.uHorizon.value as THREE.Color;
    horizon.setRGB(flight.horizon[0], flight.horizon[1], flight.horizon[2]);
    (sky.uniforms.uHorizon.value as THREE.Color).copy(horizon);
    const zenith = water.uniforms.uZenith.value as THREE.Color;
    zenith.setRGB(flight.zenith[0], flight.zenith[1], flight.zenith[2]);
    (sky.uniforms.uZenith.value as THREE.Color).copy(zenith);
    const moon = water.uniforms.uMoon.value as THREE.Vector3;
    moon.set(flight.moon[0], flight.moon[1], flight.moon[2]);
    (sky.uniforms.uMoon.value as THREE.Vector3).copy(moon);
    (land.uniforms.uMoon.value as THREE.Vector3).copy(moon);
    water.uniforms.uNight.value = flight.night;
    sky.uniforms.uNight.value = flight.night;
    land.uniforms.uNight.value = flight.night;
    canopyMat.uniforms.uNight.value = flight.night;
    sunLight.position.copy(camera.position).addScaledVector(sun, 800);
    sunLight.target.position.copy(camera.position);
    sunLight.color.copy(sunColor);
    sunLight.intensity = 1.6 * (1 - flight.night) + 0.08;
    hemi.intensity = 0.45 * (1 - flight.night) + 0.12;
    oceanStops.forEach((stop, index) => {
      const material = lineMaterials.get(stop.id);
      if (!material) return;
      const presence = stopPresence(progressRef.current, index);
      material.uniforms.uDraw.value = drawAmount(progressRef.current, index);
      material.uniforms.uNight.value = flight.night;
      material.uniforms.uWash.value = stop.kind === "construction" ? presence : 0;
      material.uniforms.uFade.value = stop.plate ? 1 - Math.min(1, Math.max(0, (presence - 0.55) / 0.3)) : 1;
    });
    for (const plate of plates) {
      const index = oceanStops.findIndex((stop) => stop.id === plate.id);
      const presence = index < 0 ? 0 : stopPresence(progressRef.current, index);
      const descend = THREE.MathUtils.smoothstep(presence, 0.18, 0.72);
      const yieldToPlate = 1 - THREE.MathUtils.smoothstep(presence, 0.62, 0.9);
      const material = plate.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = descend * yieldToPlate;
      plate.mesh.lookAt(camera.position.x, plate.mesh.position.y + 12, camera.position.z);
    }
    if (birdMesh.current) {
      for (let i = 0; i < birds.count; i += 1) {
        const ang = time * 0.12 + i;
        const radius = 70 + (i % 5) * 28;
        dummy.position.set(
          camera.position.x + Math.cos(ang) * radius,
          camera.position.y - 36 - (i % 4) * 8,
          camera.position.z + Math.sin(ang) * radius * 0.65,
        );
        dummy.rotation.y = -ang;
        dummy.scale.setScalar(7 + (i % 3));
        dummy.updateMatrix();
        birdMesh.current.setMatrixAt(i, dummy.matrix);
      }
      birdMesh.current.instanceMatrix.needsUpdate = true;
      const mat = birdMesh.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - flight.night) * 0.8;
    }
    const instant = 1 / Math.max(delta, 1e-4);
    fps.current = fps.current * 0.9 + instant * 0.1;
    if (reportFps) {
      const view = desiredLook.clone().sub(camera.position);
      const align = (flight.sun[0] * view.x + flight.sun[2] * view.z) / (Math.hypot(flight.sun[0], flight.sun[2]) * Math.hypot(view.x, view.z) || 1);
      (window as unknown as { __quantumFps?: number; __flight?: object }).__quantumFps = Math.round(fps.current);
      (window as unknown as { __flight?: object }).__flight = {
        y: Math.round(camera.position.y),
        night: Number(flight.night.toFixed(2)),
        sunY: Number(flight.sun[1].toFixed(2)),
        bank: Number(flight.bank.toFixed(3)),
        align: Number(align.toFixed(2)),
      };
    }
  });

  const oceanSeg = quality === "high" ? 110 : 56;

  return (
    <>
      <mesh ref={skyMesh} material={sky} frustumCulled={false}>
        <sphereGeometry args={[6000, 32, 20]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4800]} material={water} frustumCulled={false}>
        <planeGeometry args={[14000, 18000, oceanSeg, oceanSeg]} />
      </mesh>
      {islands.map((island) => (
        <group key={island.stop.id} position={[island.stop.x, 0, island.stop.z]}>
          <mesh geometry={island.geometry} material={land} />
          {island.lines ? (
            <mesh geometry={island.lines} material={lineMaterials.get(island.stop.id)} position={[0, 0.6, 0]} />
          ) : null}
        </group>
      ))}
      <instancedMesh
        ref={(node) => {
          if (!node) return;
          masses.spots.forEach((spot, index) => {
            dummy.position.set(spot.x, spot.y, spot.z);
            dummy.rotation.set(0, spot.rot, 0);
            dummy.scale.set(spot.sx, spot.sy, spot.sz);
            dummy.updateMatrix();
            node.setMatrixAt(index, dummy.matrix);
          });
          node.instanceMatrix.needsUpdate = true;
        }}
        args={[masses.geometry, canopyMat, masses.spots.length]}
      />
      <instancedMesh
        ref={(node) => {
          if (!node) return;
          palm.spots.forEach((spot, index) => {
            dummy.position.set(spot.x, spot.y, spot.z);
            dummy.rotation.set(0, spot.rot, 0);
            dummy.scale.setScalar(spot.scale);
            dummy.updateMatrix();
            node.setMatrixAt(index, dummy.matrix);
          });
          node.instanceMatrix.needsUpdate = true;
        }}
        args={[palm.geometry, palm.material, palm.spots.length]}
      />
      <instancedMesh ref={birdMesh} args={[birds.geometry, undefined, birds.count]}>
        <meshBasicMaterial color="#1b2428" transparent opacity={0.8} />
      </instancedMesh>
    </>
  );
}
