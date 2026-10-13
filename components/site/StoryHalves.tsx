import { MarkerNotes } from "@/components/site/MarkerNote";
import { company, story } from "@/content/site";

export function StoryHalves() {
  return (
    <section className="px-6 py-24 md:px-14" aria-labelledby="story-heading">
      <p className="kicker">Our story</p>
      <h2 id="story-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand md:text-6xl">{story.title}</h2>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-sand/75">{story.body}</p>
      <p className="mt-10 text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
      <div className="max-w-2xl">
        <MarkerNotes keys={["precast-2020", "heritage-dates", "founding", "partner-materials", "leadership"]} />
      </div>
    </section>
  );
}
