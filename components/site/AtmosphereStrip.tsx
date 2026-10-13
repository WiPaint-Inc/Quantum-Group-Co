import Image from "next/image";
import type { PortfolioImage } from "@/content/portfolio";

export function AtmosphereStrip({ images, className = "" }: { images: PortfolioImage[]; className?: string }) {
  if (images.length === 0) return null;
  return (
    <ul className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${className}`}>
      {images.map((image) => (
        <li key={image.file} className="relative aspect-[3/4] overflow-hidden">
          <Image src={image.src} alt={image.caption} fill sizes="(min-width: 768px) 22vw, 45vw" className="object-cover" />
        </li>
      ))}
    </ul>
  );
}
