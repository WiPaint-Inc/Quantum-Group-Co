import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Journey } from "@/components/journey/Journey";
import { ConceptFigure } from "@/components/site/ConceptFigure";
import { JsonLd } from "@/components/site/JsonLd";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { BuildLive } from "@/components/client/BuildLive";
import { company, howWeWork, robotics, services, story } from "@/content/site";
import { conceptShots } from "@/lib/concept";
import { draftContentEnabled, roboticsEnabled } from "@/lib/flags";
import { organizationJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  return (
    <Suspense fallback={<Journey draft={false} />}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  await connection();
  const draft = draftContentEnabled();

  return (
    <main id="content">
      <JsonLd data={organizationJsonLd()} />
      <Journey draft={draft} />
      <section className="px-6 py-16 md:px-14">
        <p className="max-w-2xl text-base leading-relaxed text-sand/75">{company.intro}</p>
        <div className="mt-8 flex flex-wrap gap-6 text-[0.68rem] tracking-[0.22em] uppercase">
          <Link href="/contact" className="border-b border-gold pb-1 text-sand">Start your project</Link>
          <Link href="/portfolio" className="text-gold-2">View our work</Link>
        </div>
      </section>

      <section className="px-6 py-24 md:px-14" aria-labelledby="services-heading">
        <p className="kicker">Services</p>
        <h2 id="services-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">Six services. One company.</h2>
      </section>
      {services.map((service) => (
        <section key={service.slug} id={service.slug} className="border-t border-line px-6 py-24 md:px-14" aria-labelledby={`${service.slug}-heading`}>
          <p className="kicker">0{service.order}</p>
          <h2 id={`${service.slug}-heading`} className="mt-4 max-w-3xl font-serif text-5xl text-sand md:text-6xl">{service.title}</h2>
          <p className="mt-6 max-w-2xl text-lg text-sand/80">{service.lede}</p>
          <p className="mt-6 max-w-2xl text-sand/70">{service.paragraphs[0]}</p>
          {service.slug === "full-design-and-build" ? (
            <ConceptFigure shot={conceptShots.designBuild} draft={draft} className="mt-10 h-[52vh] min-h-80" sizes="(min-width: 768px) 80vw, 100vw" />
          ) : null}
          <MarkerNotes keys={service.markerKeys} />
          <Link href={`/services/${service.slug}`} className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
            {service.title}
          </Link>
        </section>
      ))}

      <Suspense fallback={null}>
        <RoboticsChapter />
      </Suspense>

      <BuildLive draft={draft} />

      <section className="px-6 py-8 md:px-14" aria-labelledby="story-heading">
        <p className="kicker">Our story</p>
        <h2 id="story-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">{story.title}</h2>
        <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ConceptFigure shot={conceptShots.dusk} draft={draft} className="mt-10 h-[42vh] min-h-64 max-w-4xl" sizes="(min-width: 768px) 70vw, 100vw" />
        <p className="mt-8 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
        <MarkerNotes keys={["partner-materials", "leadership"]} />
        <Link href="/about" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">About the company</Link>
      </section>

      <section className="px-6 py-20 md:px-14" aria-labelledby="work-heading">
        <h2 id="work-heading" className="font-serif text-5xl text-sand">{howWeWork.headline}</h2>
        <p className="mt-6 max-w-2xl text-sand/75">{howWeWork.lede}</p>
        <div className="mt-6 max-w-2xl space-y-5 text-sand/70">
          {howWeWork.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Link href="/how-we-work" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">How we work</Link>
      </section>
    </main>
  );
}

async function RoboticsChapter() {
  await connection();
  if (!roboticsEnabled()) return null;
  return (
    <section id="robotics" className="border-t border-line px-6 py-24 md:px-14" aria-labelledby="robotics-heading">
      <p className="kicker">Held</p>
      <h2 id="robotics-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">{robotics.title}</h2>
      <p className="mt-6 max-w-2xl text-lg text-sand/80">{robotics.headline}</p>
      <p className="mt-6 max-w-2xl text-sand/70">{robotics.paragraphs[0]}</p>
      <Link href="/services/robotics" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
        Robotics
      </Link>
    </section>
  );
}
