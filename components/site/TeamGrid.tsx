import type { TeamMember } from "@/content/site";
import { MarkerNotes } from "@/components/site/MarkerNote";

export function TeamGrid({ members, showUnconfirmed }: { members: TeamMember[]; showUnconfirmed: boolean }) {
  const visible = members.filter((member) => member.confirmed || showUnconfirmed);
  if (visible.length === 0) return null;

  return (
    <section className="px-6 py-8 md:px-14" aria-labelledby="team-heading">
      <h2 id="team-heading" className="font-serif text-5xl text-sand">Team</h2>
      <ul className="mt-10 grid gap-8 md:grid-cols-3">
        {visible.map((member) => (
          <li key={member.id} className="border-t border-line pt-5">
            <div className="mb-5 flex aspect-[4/5] items-end border border-dashed border-gold/50 p-4 text-[0.62rem] tracking-[0.22em] text-gold-2 uppercase">
              {showUnconfirmed ? "[PLACEHOLDER: photo]" : null}
            </div>
            {member.confirmed ? null : <p className="kicker">TO CONFIRM</p>}
            <h3 className="mt-2 font-serif text-3xl text-sand">{member.name}</h3>
            <p className="mt-2 text-sm text-gold-2">{member.title}</p>
            <p className="mt-3 text-sm text-sand/70">{member.bio}</p>
            <MarkerNotes keys={member.markerKeys} />
          </li>
        ))}
      </ul>
    </section>
  );
}
