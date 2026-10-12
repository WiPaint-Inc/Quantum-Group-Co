"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useRef, useState, type ReactNode } from "react";
import type { Walkthrough3d } from "@/content/estates";

const WalkthroughStage = dynamic(() => import("@/components/estates/WalkthroughStage").then((mod) => mod.WalkthroughStage), { ssr: false });

class StageBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function EstateWalk3d({ config }: { config: Walkthrough3d }) {
  const [phase, setPhase] = useState<"idle" | "open" | "failed">("idle");
  const section = useRef<HTMLElement>(null);
  const fail = useCallback(() => setPhase("failed"), []);

  if (phase === "failed") return null;

  return (
    <section ref={section} className="mt-10" aria-label="Concept walkthrough">
      {phase === "idle" ? (
        <button
          type="button"
          onClick={() => setPhase(webglAvailable() ? "open" : "failed")}
          className="border border-[#c5a059] px-6 py-4 text-[0.68rem] tracking-[0.22em] text-[#1a1a1a] uppercase hover:bg-[#1a1a1a] hover:text-[#f3efe6]"
        >
          Explore in 3D
        </button>
      ) : (
        <div className="relative aspect-video bg-[#141210]">
          <StageBoundary onFail={fail}>
            <WalkthroughStage config={config} onFail={fail} />
          </StageBoundary>
          <button
            type="button"
            onClick={() => section.current?.querySelector("canvas")?.requestPointerLock()}
            className="absolute bottom-4 left-4 border border-[#e6d2a8]/80 bg-black/50 px-4 py-2 text-[0.62rem] tracking-[0.18em] text-[#e6d2a8] uppercase"
          >
            Walk
          </button>
        </div>
      )}
      <p className="paper-kicker mt-3">Concept walkthrough</p>
    </section>
  );
}
