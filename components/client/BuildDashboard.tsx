"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { ProjectAppMock } from "@/components/client/ProjectAppMock";

const ClientDashboard = dynamic(
  () => import("@/components/experience/ClientDashboard").then((mod) => mod.ClientDashboard),
  { ssr: false },
);

function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BuildDashboard() {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);

  return (
    <div className="relative mt-12">
      <div className="relative h-64 overflow-hidden border border-line bg-ink md:h-[70vh]">
        {reduced ? <div className="still-ocean absolute inset-0" /> : <ClientDashboard />}
      </div>
      <div className="mt-4 flex flex-col gap-4 md:absolute md:inset-0 md:mt-0 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10">
        <p className="w-fit border border-gold bg-ink/85 px-2 py-1 text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase">Illustration · Coming soon</p>
        <ProjectAppMock />
      </div>
    </div>
  );
}
