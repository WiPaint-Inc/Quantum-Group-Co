"use client";

import Link from "next/link";
import { useEffect } from "react";
import { estates, getEstate, meridian, realms, spaceNodes } from "@/content/site";

type RealmId = "ocean" | "space";

export function Overlay({
  realm,
  focusId,
  hoveredId,
  live,
  failed,
  onFocus,
  onRealm,
  onToggleEdition,
}: {
  realm: RealmId;
  focusId: string | null;
  hoveredId: string | null;
  live: boolean;
  failed: boolean;
  onFocus: (id: string | null) => void;
  onRealm: (realm: RealmId) => void;
  onToggleEdition: () => void;
}) {
  const copy = realms[realm];
  const estate = focusId ? getEstate(focusId) : null;
  const space = spaceNodes.find((node) => node.id === focusId) ?? null;
  const activeId = focusId ?? hoveredId;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onFocus(null);
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const ids = realm === "ocean" ? estates.map((item) => item.slug) : spaceNodes.map((item) => item.id);
      const current = focusId ? ids.indexOf(focusId) : -1;
      const step = event.key === "ArrowRight" ? 1 : -1;
      const next = ids[(current + step + ids.length) % ids.length];
      onFocus(next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusId, onFocus, realm]);

  return (
    <div className={live ? "pointer-events-none absolute inset-0 z-10" : "relative z-10"}>
      <p className="sr-only" aria-live="polite">
        {copy.label}
        {failed ? " Still edition. The waters could not start." : live ? " Waters." : " Still edition."}
      </p>

      <div
        className={`flex flex-col justify-end gap-10 px-6 pt-28 pb-8 md:px-12 md:pb-12 ${
          live ? "h-full" : "min-h-dvh"
        } ${focusId ? "md:pr-[28rem]" : ""}`}
      >
        <div className="mt-auto grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className={focusId ? "hidden lg:block lg:opacity-40" : ""}>
            <p className="kicker">{copy.kicker}</p>
            <h1 className="mt-4 max-w-3xl font-serif text-6xl leading-[0.9] text-sand sm:text-7xl md:text-8xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-sand/75">{copy.lede}</p>
            <p className="mt-4 text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
              {failed ? "Still edition — the waters did not start" : live ? "Archipelago study" : "Still edition"}
            </p>
          </div>

          <nav
            aria-label={realm === "ocean" ? "Estates on the water" : "Meridian worlds"}
            className={`pointer-events-auto ${focusId ? "hidden" : ""}`}
          >
            <ol className="space-y-1 border-l border-line pl-4">
              {realm === "ocean"
                ? estates.map((item, index) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        className={`w-full py-1.5 text-left ${activeId === item.slug ? "text-sand" : "text-sand/55 hover:text-sand"}`}
                        onClick={() => onFocus(item.slug)}
                      >
                        <span className="block text-[0.62rem] tracking-[0.22em] uppercase">
                          {String(index + 1).padStart(2, "0")} · Placeholder
                        </span>
                        <span className="font-serif text-2xl leading-none">{item.name}</span>
                      </button>
                    </li>
                  ))
                : spaceNodes.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`w-full py-1.5 text-left ${activeId === item.id ? "text-sand" : "text-sand/55 hover:text-sand"}`}
                        onClick={() => onFocus(item.id)}
                      >
                        <span className="block text-[0.62rem] tracking-[0.22em] uppercase">{item.kicker}</span>
                        <span className="font-serif text-2xl leading-none">{item.title}</span>
                      </button>
                    </li>
                  ))}
              {realm === "ocean" ? (
                <li>
                  <button type="button" className="w-full py-2 text-left text-gold-2 hover:text-sand" onClick={() => onRealm("space")}>
                    <span className="block text-[0.62rem] tracking-[0.22em] uppercase">{meridian.kicker}</span>
                    <span className="font-serif text-2xl leading-none">{meridian.title}</span>
                  </button>
                </li>
              ) : (
                <li>
                  <button type="button" className="w-full py-2 text-left text-gold-2 hover:text-sand" onClick={() => onRealm("ocean")}>
                    <span className="block text-[0.62rem] tracking-[0.22em] uppercase">Return</span>
                    <span className="font-serif text-2xl leading-none">The archipelago</span>
                  </button>
                </li>
              )}
            </ol>
          </nav>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.68rem] tracking-[0.22em] uppercase">
          <div className="flex gap-4">
            <button type="button" className={realm === "ocean" ? "text-sand" : "text-sand/45 hover:text-sand"} onClick={() => onRealm("ocean")}>
              Archipelago
            </button>
            <button type="button" className={realm === "space" ? "text-sand" : "text-sand/45 hover:text-sand"} onClick={() => onRealm("space")}>
              Meridian
            </button>
          </div>
          <button type="button" className="text-gold-2 hover:text-sand" onClick={onToggleEdition}>
            {live ? "View stills" : "Enter the waters"}
          </button>
          <Link href="/estates" className="text-sand/55 hover:text-sand">
            Read the index
          </Link>
        </div>
      </div>

      {estate ? (
        <aside className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 max-h-[78dvh] overflow-y-auto border-line bg-ink/88 p-6 backdrop-blur-md md:inset-y-0 md:right-0 md:left-auto md:w-[26rem] md:border-l md:p-10 md:pt-28">
          <p className="kicker">Placeholder estate</p>
          <h2 className="mt-4 font-serif text-5xl leading-none text-sand">{estate.name}</h2>
          <p className="mt-4 text-sand/80">{estate.epithet}</p>
          <p className="mt-2 text-sm tracking-wide text-gold-2">{estate.setting} · {estate.region}</p>
          <p className="mt-6 text-sm leading-relaxed text-sand/75">{estate.summary}</p>
          <p className="mt-4 text-sm leading-relaxed text-sand/60">{estate.composition}</p>
          <div className="mt-8 flex flex-wrap gap-4 text-[0.68rem] tracking-[0.18em] uppercase">
            <Link href={`/estates/${estate.slug}`} className="border-b border-gold pb-1 text-sand">
              Read the study
            </Link>
            <button type="button" className="text-sand/60 hover:text-sand" onClick={() => onFocus(null)}>
              Release
            </button>
          </div>
        </aside>
      ) : null}

      {space ? (
        <aside className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 border-line bg-ink/88 p-6 backdrop-blur-md md:inset-y-0 md:right-0 md:left-auto md:w-[26rem] md:border-l md:p-10 md:pt-28">
          <p className="kicker">{space.kicker}</p>
          <h2 className="mt-4 font-serif text-5xl leading-none text-sand">{space.title}</h2>
          <p className="mt-6 text-sm leading-relaxed text-sand/75">{space.summary}</p>
          <div className="mt-8 flex flex-wrap gap-4 text-[0.68rem] tracking-[0.18em] uppercase">
            <Link href={space.href} className="border-b border-gold pb-1 text-sand">
              Continue
            </Link>
            <button type="button" className="text-sand/60 hover:text-sand" onClick={() => onFocus(null)}>
              Release
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
