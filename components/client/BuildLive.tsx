import { ConceptFigure } from "@/components/site/ConceptFigure";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { buildLive } from "@/content/site";
import { conceptShots } from "@/lib/concept";

export function BuildLive({ draft }: { draft: boolean }) {
  return (
    <section id="your-build-live" className="border-t border-line px-6 py-24 md:px-14" aria-labelledby="build-live-heading">
      <p className="kicker">{buildLive.kicker}</p>
      <h2 id="build-live-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand md:text-6xl">{buildLive.title}</h2>
      <p className="mt-6 max-w-2xl text-lg text-sand/75">{buildLive.lede}</p>
      <ul className="mt-8 max-w-2xl">
        {buildLive.points.map((point) => (
          <li key={point} className="border-t border-line py-3 text-sand/80">{point}</li>
        ))}
      </ul>
      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <ConceptFigure shot={conceptShots.arrival} draft={draft} className="h-[48vh] min-h-72 lg:col-span-7" sizes="(min-width: 1024px) 58vw, 100vw" />
        <div className="border border-line bg-white/[0.03] p-6 lg:col-span-5">
          <p className="kicker">Private project</p>
          <p className="mt-3 font-serif text-4xl text-sand">Demo Villa</p>
          <p className="mt-2 text-[0.62rem] tracking-[0.22em] text-gold-2 uppercase">Concept</p>
          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">This week</dt>
              <dd className="mt-1 text-sand/80">Weekly progress is filed for Demo Villa.</dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">Channels</dt>
              <dd className="mt-1 text-sand/80">WhatsApp and Slack</dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">Meeting</dt>
              <dd className="mt-1 text-sand/80">Weekly video</dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">Representative</dt>
              <dd className="mt-1 text-sand/80">Designated for this project.</dd>
            </div>
          </dl>
          <ConceptFigure shot={conceptShots.interior} draft={draft} className="mt-8 h-40" sizes="(min-width: 1024px) 30vw, 100vw" />
          <MarkerNotes keys={["representative"]} />
        </div>
      </div>
    </section>
  );
}
