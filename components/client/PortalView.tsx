"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { portfolioProjects } from "@/content/portfolio";
import { clientArea } from "@/content/site";

type Session = { email: string; note: string };

export function PortalView() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { data?: Session };
        return payload.data ?? null;
      })
      .then((data) => {
        if (active) setSession(data);
      })
      .catch(() => {
        if (active) setSession(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/client");
    router.refresh();
  }

  return (
    <div>
      <p className="mt-8 text-sand/75">{session ? `Session for ${session.email}. ${session.note}` : "Confirming the placeholder session."}</p>
      <section className="mt-12">
        <h2 className="font-serif text-4xl text-sand">House slots</h2>
        <p className="mt-3 max-w-xl text-sm text-sand/65">{clientArea.extension.summary}</p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {portfolioProjects.map((project) => (
            <li key={project.slug} className="flex flex-wrap items-baseline justify-between gap-3 py-5">
              <span className="font-serif text-2xl text-sand">{project.name}</span>
              <Link href={`/client/homes/${project.slug}`} className="text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase">
                Extension point
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Link href="/pay" className="mt-8 inline-block text-[0.68rem] tracking-[0.2em] text-gold-2 uppercase">Pay a deposit or invoice</Link>
      <button type="button" onClick={signOut} className="mt-10 block text-[0.68rem] tracking-[0.22em] text-sand/60 uppercase">
        Sign out
      </button>
    </div>
  );
}
