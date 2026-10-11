import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Journey } from "@/components/journey/Journey";
import { StoryHalves } from "@/components/site/StoryHalves";
import { TeamGrid } from "@/components/site/TeamGrid";
import { ConceptFigure } from "@/components/site/ConceptFigure";
import { JsonLd } from "@/components/site/JsonLd";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { BuildLive } from "@/components/client/BuildLive";
import { AtmosphereStrip } from "@/components/site/AtmosphereStrip";
import { atmosphereWhere, portfolioProjects } from "@/content/portfolio";
import { company, howWeWork, philosophy, robotics, serviceParagraphs, services, team } from "@/content/site";
import { conceptShots } from "@/lib/concept";
import { draftContentEnabled, roboticsEnabled, showInternalNotes, showVividProductLines } from "@/lib/flags";
import { organizationJsonLd } from "@/lib/jsonld";

const sceneVillas = portfolioProjects.map((project) => ({
  slug: project.slug,
  name: project.name,
  location: project.location,
}));

export default function HomePage() {
  return (
    <Suspense fallback={<Journey draft={false} villas={sceneVillas} />}>
      <HomeBody />
    </Suspense>
  );
}

async function HomeBody() {
  await connection();
  const draft = draftContentEnabled();
  const vividLines = showVividProductLines();

  return (
    <main id="content">
      <JsonLd data={organizationJsonLd()} />
      <Journey draft={draft} villas={sceneVillas} />
      <section className="px-6 py-16 md:px-14">
        <p className="max-w-2xl text-base leading-relaxed text-sand/75">{company.intro}</p>
        <div className="mt-8 flex flex-wrap gap-6 text-[0.68rem] tracking-[0.22em] uppercase">
          <Link href="/contact" className="border-b border-gold pb-1 text-sand">Start your project</Link>
          <Link href="/portfolio" className="text-gold-2">Partner Portfolio</Link>
        </div>
      </section>

      <section className="px-6 py-24 md:px-14" aria-labelledby="services-heading">
        <p className="kicker">Services</p>
        <h2 id="services-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">Six services. One company.</h2>
      </section>
      {services.map((service) => {
        const paragraphs = serviceParagraphs(service, vividLines);
        const texture =
          service.slug === "full-design-and-build"
            ? atmosphereWhere("partner-portfolio").slice(0, 4)
            : service.slug === "construction"
              ? atmosphereWhere("partner-portfolio").slice(4)
              : [];
        return (
        <section key={service.slug} id={service.slug} className="glass-panel mx-6 my-6 px-6 py-24 md:mx-14 md:px-10" aria-labelledby={`${service.slug}-heading`}>
          <p className="kicker">0{service.order}</p>
          <h2 id={`${service.slug}-heading`} className="mt-4 max-w-3xl font-serif text-5xl text-sand md:text-6xl">{service.title}</h2>
          <p className="mt-6 max-w-2xl text-lg text-sand/80">{service.lede}</p>
          <div className="mt-6 max-w-2xl space-y-5 text-sand/70">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-8 max-w-2xl">
            {service.points.map((point) => (
              <li key={point} className="border-t border-line py-3 text-sand/80">{point}</li>
            ))}
          </ul>
          {service.slug === "full-design-and-build" ? (
            <ConceptFigure shot={conceptShots.bluehour} draft={draft} className="mt-10 h-[52vh] min-h-80" sizes="(min-width: 768px) 80vw, 100vw" />
          ) : null}
          {service.slug === "developments" ? (
            <ConceptFigure
              shot={conceptShots.development}
              draft={draft}
              caption="Peninsula Development"
              blueprint
              className="mt-10 h-[52vh] min-h-80"
              sizes="(min-width: 768px) 80vw, 100vw"
            />
          ) : null}
          <AtmosphereStrip images={texture} className="mt-10" />
          <MarkerNotes keys={service.markerKeys} />
          <div className="mt-8 flex flex-wrap gap-6">
            <Link href={`/services/${service.slug}`} className="text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
              {service.title}
            </Link>
            {service.related?.map((link) => (
              <Link key={link.href} href={link.href} className="text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
        );
      })}

      <Suspense fallback={null}>
        <RoboticsChapter />
      </Suspense>

      <BuildLive />

      <StoryHalves />
      <div className="grid gap-4 px-6 md:grid-cols-2 md:px-14">
        <ConceptFigure shot={conceptShots.bluehour} draft={draft} className="h-[42vh] min-h-64" sizes="(min-width: 768px) 45vw, 100vw" />
        <ConceptFigure shot={conceptShots.arrival} draft={draft} className="h-[42vh] min-h-64" sizes="(min-width: 768px) 45vw, 100vw" />
      </div>
      <div className="px-6 md:px-14">
        <Link href="/about" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">About the company</Link>
      </div>
      <TeamGrid members={team} showUnconfirmed={showInternalNotes()} />

      <section className="px-6 py-24 md:px-14" aria-labelledby="philosophy-heading">
        <p className="kicker">With the land</p>
        <h2 id="philosophy-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">{philosophy.title}</h2>
        <div className="mt-6 max-w-2xl space-y-5 text-sand/75">
          {philosophy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {showInternalNotes() ? <p>{philosophy.ecoSlot}</p> : null}
        </div>
        <MarkerNotes keys={["eco-credentials"]} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <ConceptFigure shot={conceptShots.ecoAerial} draft={draft} className="h-64" sizes="(min-width: 768px) 30vw, 100vw" />
          <ConceptFigure shot={conceptShots.ecoInterior} draft={draft} className="h-64" sizes="(min-width: 768px) 30vw, 100vw" />
          <ConceptFigure shot={conceptShots.beachfront} draft={draft} className="h-64" sizes="(min-width: 768px) 30vw, 100vw" />
        </div>
      </section>

      <section className="px-6 py-20 md:px-14" aria-labelledby="work-heading">
        <h2 id="work-heading" className="font-serif text-5xl text-sand">{howWeWork.headline}</h2>
        <p className="mt-6 max-w-2xl text-sand/75">{howWeWork.lede}</p>
        <div className="mt-6 max-w-2xl space-y-5 text-sand/70">
          {howWeWork.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="mt-8 max-w-2xl">
          {howWeWork.points.map((point) => (
            <li key={point} className="border-t border-line py-3 text-sand/80">{point}</li>
          ))}
        </ul>
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
