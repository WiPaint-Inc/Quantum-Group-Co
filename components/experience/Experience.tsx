"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import { Loader } from "@/components/experience/Loader";
import { Overlay } from "@/components/experience/Overlay";
import { StillBackdrop } from "@/components/experience/StillBackdrop";
import type { WorldStatus } from "@/components/experience/World";

const World = dynamic(() => import("@/components/experience/World"), { ssr: false });

type RealmId = "ocean" | "space";
type Edition = "still" | "webgl";
type Phase = "idle" | "leaving" | "arriving";

class Boundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
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

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  window.addEventListener("resize", onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function readPreference(): Edition {
  const forced = new URLSearchParams(window.location.search).get("experience");
  if (forced === "still" || forced === "webgl") return forced;
  const saved = window.sessionStorage.getItem("qg-experience");
  if (saved === "still" || saved === "webgl") return saved;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.innerWidth < 900;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory < 4;
  const lowCores = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2;
  if (reduce || narrow || lowMemory || lowCores || nav.connection?.saveData || !hasWebGL()) return "still";
  return "webgl";
}

function subscribeMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function Experience() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "still" as const);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const [override, setOverride] = useState<Edition | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [realm, setRealm] = useState<RealmId>("ocean");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const choice = override ?? preference;
  const wantWebGL = choice === "webgl" && !failed;
  const live = wantWebGL && ready;

  const travel = useCallback(
    (next: RealmId) => {
      if (next === realm || phase !== "idle") return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const leaveFor = reduce ? 0 : 880;
      const arriveFor = reduce ? 0 : 640;
      setPhase("leaving");
      setFocusId(next === "space" ? "meridian" : null);
      window.setTimeout(() => {
        setRealm(next);
        setFocusId(null);
        setPhase("arriving");
        window.setTimeout(() => setPhase("idle"), arriveFor);
      }, leaveFor);
    },
    [phase, realm],
  );

  const onStatus = useCallback((status: WorldStatus) => {
    if (status === "lost") {
      setFailed(true);
      setReady(false);
      return;
    }
    setReady(true);
  }, []);

  function toggleEdition() {
    const next: Edition = live || choice === "webgl" ? "still" : "webgl";
    if (next === "webgl") {
      setFailed(false);
      setReady(false);
    }
    setOverride(next);
    window.sessionStorage.setItem("qg-experience", next);
  }

  return (
    <div className={live ? "relative z-0 h-dvh overflow-hidden" : "relative z-0 min-h-dvh"}>
      <div className={live ? "absolute inset-0 z-0" : "pointer-events-none fixed inset-0 z-0"}>
        {live ? null : <StillBackdrop realm={realm} />}
        {wantWebGL ? (
          <Boundary
            onFail={() => {
              setFailed(true);
              setReady(false);
            }}
          >
            <World
              realm={realm}
              focusId={focusId}
              reducedMotion={reducedMotion}
              onStatus={onStatus}
              onSelect={setFocusId}
              onHover={setHoveredId}
              onPortal={() => travel("space")}
            />
          </Boundary>
        ) : null}
      </div>
      <div className={`veil ${phase !== "idle" ? "veil-on" : ""}`} aria-hidden="true" />
      {wantWebGL && !live ? <Loader /> : null}
      <Overlay
        realm={realm}
        focusId={focusId}
        hoveredId={hoveredId}
        live={live}
        failed={failed}
        onFocus={setFocusId}
        onRealm={travel}
        onToggleEdition={toggleEdition}
      />
    </div>
  );
}
