import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Journey } from "@/components/journey/Journey";
import { JsonLd } from "@/components/site/JsonLd";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { company, howWeWork, robotics, services, story } from "@/content/site";
import { roboticsEnabled } from "@/lib/flags";
import { organizationJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  return (
    <main id="content">
      <JsonLd data={organizationJsonLd()} />
      <header className="relative flex min-h-[88dvh] flex-col justify-end px-6 pt-32 pb-16 md:px-14">
        <p className="kicker">{company.market}</p>
        <h1 className="mt-4 max-w-4xl font-serif text-6xl leading-[0.9] text-sand sm:text-8xl">{company.heroTitle}</h1>
        <p className="mt-6 max-w-xl text-lg text-sand/80">{company.heroSub}</p>
        <p className="mt-6 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-sand/70">{company.intro}</p>
        <p className="mt-4 text-sm text-sand/50">{company.heroAlt}</p>
        <div className="mt-8 flex flex-wrap gap-6 text-[0.68rem] tracking-[0.22em] uppercase">
          <Link href="/contact" className="border-b border-gold pb-1 text-sand">Start your project</Link>
          <Link href="/portfolio" className="text-gold-2">View our work</Link>
        </div>
      </header>

      <Journey />

      <section className="px-6 py-24 md:px-14" aria-labelledby="services-heading">
        <p className="kicker">Services</p>
        <h2 id="services-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">Five services. One company.</h2>
      </section>
      {services.map((service) => (
        <section key={service.slug} id={service.slug} className="border-t border-line px-6 py-24 md:px-14" aria-labelledby={`${service.slug}-heading`}>
          <p className="kicker">0{service.order}</p>
          <h2 id={`${service.slug}-heading`} className="mt-4 max-w-3xl font-serif text-5xl text-sand md:text-6xl">{service.title}</h2>
          <p className="mt-6 max-w-2xl text-lg text-sand/80">{service.lede}</p>
          <p className="mt-6 max-w-2xl text-sand/70">{service.paragraphs[0]}</p>
          <MarkerNotes keys={service.markerKeys} />
          <Link href={`/services/${service.slug}`} className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">
            {service.title}
          </Link>
        </section>
      ))}

      <Suspense fallback={null}>
        <RoboticsChapter />
      </Suspense>

      <section className="px-6 py-8 md:px-14" aria-labelledby="story-heading">
        <p className="kicker">Our story</p>
        <h2 id="story-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">{story.title}</h2>
        <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
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
