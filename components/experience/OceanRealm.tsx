"use client";

import { estates } from "@/content/site";
import { Island } from "@/components/experience/Island";
import { PortalRing } from "@/components/experience/PortalRing";
import { Water } from "@/components/experience/Water";

export function OceanRealm({
  visible,
  focusId,
  reducedMotion,
  onSelect,
  onHover,
  onPortal,
}: {
  visible: boolean;
  focusId: string | null;
  reducedMotion: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onPortal: () => void;
}) {
  if (!visible) return null;

  return (
    <group>
      <fogExp2 attach="fog" args={["#16464e", 0.026]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <circleGeometry args={[70, 48]} />
        <meshBasicMaterial color="#062228" />
      </mesh>
      <Water reducedMotion={reducedMotion} onClear={() => onSelect(null)} />
      {estates.map((estate) => (
        <Island
          key={estate.slug}
          estate={estate}
          focused={focusId === estate.slug}
          onSelect={(id) => onSelect(id)}
          onHover={onHover}
        />
      ))}
      <PortalRing reducedMotion={reducedMotion} onPortal={onPortal} />
    </group>
  );
}
