"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PortfolioImage } from "@/content/portfolio";

export function Gallery({ images }: { images: PortfolioImage[] }) {
  const [open, setOpen] = useState<PortfolioImage | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <li key={image.src}>
            <button type="button" className="block w-full text-left" onClick={() => setOpen(image)}>
              <span className="relative block aspect-[4/3] overflow-hidden border border-line">
                <Image src={image.src} alt={image.caption} fill className="object-cover" sizes="(min-width: 1024px) 30vw, 100vw" />
              </span>
              <span className="mt-3 block text-sm text-sand/70">{image.caption}</span>
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 p-6" role="dialog" aria-modal="true" aria-label={open.caption}>
          <button type="button" className="absolute top-6 right-6 text-[0.68rem] tracking-[0.2em] text-sand uppercase" onClick={() => setOpen(null)}>
            Close
          </button>
          <figure className="max-h-[85dvh] max-w-5xl">
            <Image src={open.src} alt={open.caption} width={open.width} height={open.height} className="max-h-[75dvh] w-auto object-contain" />
            <figcaption className="mt-4 text-sm text-sand/75">{open.caption}</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
