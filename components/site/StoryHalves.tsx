import { MarkerNotes } from "@/components/site/MarkerNote";
import { company, story } from "@/content/site";

export function StoryHalves() {
  return (
    <section className="px-6 py-24 md:px-14" aria-labelledby="story-heading">
      <p className="kicker">Our story</p>
      <h2 id="story-heading" className="mt-4 max-w-3xl font-serif text-5xl text-sand md:text-6xl">{story.title}</h2>
      <p className="mt-6 max-w-2xl text-lg text-sand/75">{story.partnership}</p>
      <div className="mt-12 grid overflow-hidden border border-line md:grid-cols-2">
        {story.halves.map((half, index) => (
          <article key={half.id} className={index === 0 ? "border-b border-line p-8 md:border-r md:border-b-0 md:p-12" : "p-8 md:p-12"}>
            <p className="kicker">{half.kicker}</p>
            <h3 className="mt-4 font-serif text-4xl text-sand">{half.name}</h3>
            <p className="mt-4 text-sand/70">{half.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-10 text-center text-[0.72rem] tracking-[0.28em] text-gold-2 uppercase">{company.tagline}</p>
      <p className="mx-auto mt-6 max-w-2xl text-center text-sand/70">{story.join}</p>
      <div className="mx-auto max-w-2xl">
        <MarkerNotes keys={["heritage-finishing", "heritage-construction", "heritage-join", "heritage-1981", "heritage-dates", "founding", "partner-materials", "leadership"]} />
      </div>
    </section>
  );
}
