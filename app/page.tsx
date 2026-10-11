import Link from "next/link";
import { Journey } from "@/components/journey/Journey";
import { JsonLd } from "@/components/site/JsonLd";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { company, howWeWork, services, story } from "@/content/site";
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
        <h2 id="services-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">Six ways the same team stays on the work.</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug}>
              <Link href={`/services/${service.slug}`} className="glass-panel block h-full p-6">
                <span className="kicker">0{service.order}</span>
                <span className="mt-4 block font-serif text-3xl text-sand">{service.title}</span>
                <span className="mt-3 block text-sm text-sand/70">{service.lede}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-6 py-8 md:px-14" aria-labelledby="story-heading">
        <p className="kicker">Our story</p>
        <h2 id="story-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand">{story.title}</h2>
        <div className="mt-8 max-w-2xl space-y-5 text-sand/75">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-8 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
        <MarkerNotes keys={["heritage-1981", "heritage-dates", "founding", "partner-materials", "leadership"]} />
        <Link href="/about" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">Read the story</Link>
      </section>

      <section className="px-6 py-20 md:px-14" aria-labelledby="work-heading">
        <h2 id="work-heading" className="font-serif text-5xl text-sand">{howWeWork.headline}</h2>
        <p className="mt-6 max-w-2xl text-sand/75">{howWeWork.lede}</p>
        <Link href="/how-we-work" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">How we work</Link>
      </section>
    </main>
  );
}
