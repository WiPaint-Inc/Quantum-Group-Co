"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PaperTone() {
  const pathname = usePathname();
  useEffect(() => {
    const paper = pathname.startsWith("/estates");
    document.body.dataset.sheet = paper ? "paper" : "";
    return () => {
      document.body.dataset.sheet = "";
    };
  }, [pathname]);
  return null;
}
