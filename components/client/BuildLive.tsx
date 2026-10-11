import Link from "next/link";
import { BuildDashboard } from "@/components/client/BuildDashboard";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { buildLive } from "@/content/site";

export function BuildLive({ nested = false }: { nested?: boolean }) {
  return (
    <section id="your-build-live" className={nested ? "py-16" : "border-t border-line px-6 py-24 md:px-14"} aria-labelledby="build-live-heading">
      <p className="kicker">{buildLive.kicker}</p>
      <h2 id="build-live-heading" className="mt-4 max-w-4xl font-serif text-4xl text-sand md:text-6xl">{buildLive.headline}</h2>
      <ul className="mt-10 max-w-2xl">
        {buildLive.offerings.map((item) => (
          <li key={item.id} className="border-t border-line py-3 text-sand/80">
            <span className="text-sand">{item.title}.</span> {item.detail}
          </li>
        ))}
      </ul>
      <ul className="mt-8 max-w-2xl">
        {buildLive.kept.map((item) => (
          <li key={item.id} className="border-t border-line py-3 text-sand/80">
            <span className="text-sand">{item.title}.</span> {item.detail}
          </li>
        ))}
      </ul>
      <div className="mt-10 max-w-2xl border border-dashed border-gold/50 px-5 py-5">
        <p className="kicker">Coming soon</p>
        <p className="mt-3 text-sand/80">{buildLive.avatar.copy}</p>
      </div>
      <Link href={buildLive.href} className="mt-8 inline-block border-b border-gold pb-1 text-[0.68rem] tracking-[0.22em] text-sand uppercase">
        Client area
      </Link>
      <MarkerNotes keys={buildLive.markerKeys} />
      <BuildDashboard />
    </section>
  );
}
