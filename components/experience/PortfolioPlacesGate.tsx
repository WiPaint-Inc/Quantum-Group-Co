"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/components/experience/PortfolioPlaces";

const PortfolioPlaces = dynamic(
  () => import("@/components/experience/PortfolioPlaces").then((mod) => mod.PortfolioPlaces),
  { ssr: false },
);

export function PortfolioPlacesGate({ places }: { places: Place[] }) {
  return <PortfolioPlaces places={places} />;
}
