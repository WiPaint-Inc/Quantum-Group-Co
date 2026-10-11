"use client";

import dynamic from "next/dynamic";
import type { PortfolioImage } from "@/content/portfolio";

const ProjectScene = dynamic(() => import("@/components/experience/ProjectScene").then((mod) => mod.ProjectScene), {
  ssr: false,
});

export function ProjectSceneGate({ images, model }: { images: PortfolioImage[]; model?: string }) {
  return <ProjectScene images={images} model={model} />;
}
