"use client";

import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { enableSolidShadows, makePalm, sampleIslandHeight } from "@/components/ocean/geometry";
import { contactYaw } from "@/lib/ocean-flight";

const SAND = sampleIslandHeight("private", 0, 0.7, 16, 0.55, 1.08);

function tumbler() {
  return new THREE.LatheGeometry([
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.032, 0.004),
    new THREE.Vector2(0.034, 0.02),
    new THREE.Vector2(0.046, 0.12),
  ], 28);
}

export function MeetingCay({ x, z }: { x: number; z: number }) {
  const root = useRef<THREE.Group>(null);
  const { scene, gl } = useThree();
  const palm = useMemo(() => makePalm(), []);
  const glassGeo = useMemo(() => tumbler(), []);
  const wood = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#8d5a32",
    roughness: 0.42,
    metalness: 0.02,
    clearcoat: 0.18,
    clearcoatRoughness: 0.45,
  }), []);
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.05,
    metalness: 0,
    transmission: 1,
    thickness: 0.4,
    ior: 1.5,
    transparent: true,
  }), []);
  const citrus = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#e39a45",
    roughness: 0.08,
    transmission: 0.86,
    thickness: 0.6,
    ior: 1.33,
    attenuationColor: new THREE.Color("#e39a45"),
    attenuationDistance: 0.12,
    transparent: true,
  }), []);
  const warmer = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#c96a3a",
    roughness: 0.08,
    transmission: 0.86,
    thickness: 0.6,
    ior: 1.33,
    attenuationColor: new THREE.Color("#c96a3a"),
    attenuationDistance: 0.12,
    transparent: true,
  }), []);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    const sphere = new THREE.SphereGeometry(8, 24, 16);
    const colors = new Float32Array(sphere.attributes.position.count * 3);
    const positions = sphere.attributes.position;
    const top = new THREE.Color("#f4b7c4");
    const bottom = new THREE.Color("#f6c48a");
    const gold = new THREE.Color("#ffc98a");
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i += 1) {
      const height = positions.getY(i) / 8;
      if (height > 0.15) color.copy(bottom).lerp(top, Math.min(1, (height - 0.15) / 0.85));
      else color.copy(bottom).lerp(gold, 0.4);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    sphere.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const sky = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
    envScene.add(new THREE.Mesh(sphere, sky));
    const env = pmrem.fromScene(envScene, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.65;
    return () => {
      scene.environment = null;
      scene.environmentIntensity = 1;
      env.texture.dispose();
      pmrem.dispose();
      sphere.dispose();
      sky.dispose();
    };
  }, [gl, scene]);

  useEffect(() => () => {
    palm.dispose();
    glassGeo.dispose();
    wood.dispose();
    glass.dispose();
    citrus.dispose();
    warmer.dispose();
  }, [citrus, glass, glassGeo, palm, warmer, wood]);

  useEffect(() => {
    enableSolidShadows(root.current);
  }, []);

  return (
    <group ref={root} position={[x, 0, z]} rotation={[0, contactYaw, 0]}>
      <group position={[0, SAND, 0]}>
        <TeakChair side={-1} material={wood} />
        <TeakChair side={1} material={wood} />
        <mesh position={[0, 0.04, 0.92]} material={wood}>
          <cylinderGeometry args={[0.16, 0.18, 0.045, 24]} />
        </mesh>
        <mesh position={[0, 0.26, 0.92]} material={wood}>
          <cylinderGeometry args={[0.045, 0.05, 0.4, 16]} />
        </mesh>
        <mesh position={[0, 0.5, 0.92]} material={wood}>
          <cylinderGeometry args={[0.38, 0.38, 0.04, 40]} />
        </mesh>
        <mesh position={[-0.12, 0.52, 0.86]} geometry={glassGeo} material={glass} />
        <mesh position={[0.12, 0.52, 0.98]} geometry={glassGeo} material={glass} />
        <mesh position={[-0.12, 0.555, 0.86]} material={citrus}>
          <cylinderGeometry args={[0.028, 0.026, 0.062, 20]} />
        </mesh>
        <mesh position={[0.12, 0.555, 0.98]} material={warmer}>
          <cylinderGeometry args={[0.028, 0.026, 0.062, 20]} />
        </mesh>
        <mesh geometry={palm} position={[-2.35, 0, -1.55]} rotation={[0, 0.5, 0]} scale={1.05}>
          <meshLambertMaterial vertexColors />
        </mesh>
        <mesh geometry={palm} position={[2.15, 0, -1.15]} rotation={[0, -0.7, 0]} scale={0.92}>
          <meshLambertMaterial vertexColors />
        </mesh>
        <ContactShadows
          position={[0, 0.02, 0.55]}
          opacity={0.55}
          scale={12}
          blur={2.2}
          far={4.5}
          color="#2a211c"
          frames={24}
          resolution={512}
        />
      </group>
    </group>
  );
}

function TeakChair({ side, material }: { side: -1 | 1; material: THREE.Material }) {
  const legs: Array<[number, number]> = [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]];
  return (
    <group position={[side * 0.72, 0, 0.15]} rotation={[0, side * 0.58, 0]}>
      {legs.map(([lx, lz]) => (
        <mesh key={`${lx}:${lz}`} position={[lx, 0.21, lz]} material={material}>
          <boxGeometry args={[0.045, 0.42, 0.045]} />
        </mesh>
      ))}
      <mesh position={[0, 0.44, 0]} material={material}>
        <boxGeometry args={[0.52, 0.045, 0.48]} />
      </mesh>
      <mesh position={[-0.22, 0.74, -0.2]} material={material}>
        <boxGeometry args={[0.04, 0.62, 0.04]} />
      </mesh>
      <mesh position={[0.22, 0.74, -0.2]} material={material}>
        <boxGeometry args={[0.04, 0.62, 0.04]} />
      </mesh>
      {[0.56, 0.68, 0.8, 0.92].map((y) => (
        <mesh key={y} position={[0, y, -0.2]} material={material}>
          <boxGeometry args={[0.4, 0.016, 0.012]} />
        </mesh>
      ))}
      <mesh position={[-0.24, 0.62, 0.02]} material={material}>
        <boxGeometry args={[0.04, 0.028, 0.4]} />
      </mesh>
      <mesh position={[0.24, 0.62, 0.02]} material={material}>
        <boxGeometry args={[0.04, 0.028, 0.4]} />
      </mesh>
    </group>
  );
}
