"use client";

import { useState } from "react";
import type { MarketplaceListing } from "@/content/site";

type Notice = { tone: "quiet" | "warn"; text: string };

export function MarketplaceDesk({ listings }: { listings: MarketplaceListing[] }) {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<"plans" | "renders" | "both">("both");
  const [waitlist, setWaitlist] = useState<Notice | null>(null);
  const [mintNote, setMintNote] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<"waitlist" | "mint" | null>(null);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setBusy("waitlist");
    setWaitlist(null);
    const response = await fetch("/api/marketplace/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, interest }),
    });
    const payload = (await response.json()) as { ok?: boolean; data?: { note?: string }; error?: { message?: string } };
    setBusy(null);
    if (!response.ok) {
      setWaitlist({ tone: "warn", text: payload.error?.message ?? "The request was not accepted." });
      return;
    }
    setWaitlist({ tone: "quiet", text: payload.data?.note ?? "Received. Nothing was stored." });
    setEmail("");
  }

  async function previewMint(listing: MarketplaceListing) {
    setBusy("mint");
    setMintNote(null);
    const response = await fetch("/api/marketplace/mint", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId: listing.id, standard: listing.standards[0] }),
    });
    const payload = (await response.json()) as { data?: { message?: string }; error?: { message?: string } };
    setBusy(null);
    setMintNote({
      tone: response.ok ? "quiet" : "warn",
      text: payload.data?.message ?? payload.error?.message ?? "The stub did not answer.",
    });
  }

  return (
    <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="waitlist-heading">
        <h2 id="waitlist-heading" className="font-serif text-4xl text-sand">Waitlist</h2>
        <p className="mt-4 text-sm leading-relaxed text-sand/70">
          Leave an address if you want to hear when a private issuance opens. This stub accepts the request and does not store it.
        </p>
        <form onSubmit={join} className="mt-8 space-y-5">
          <label className="block">
            <span className="kicker">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full border-b border-line bg-transparent py-3 text-sand outline-none"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="kicker">Interest</span>
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value as "plans" | "renders" | "both")}
              className="mt-3 w-full border-b border-line bg-transparent py-3 text-sand outline-none"
            >
              <option value="both">Plans and renders</option>
              <option value="plans">Plans</option>
              <option value="renders">Renders</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy === "waitlist"}
            className="text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase"
          >
            {busy === "waitlist" ? "Sending" : "Request a place"}
          </button>
        </form>
        {waitlist ? <p className="mt-6 text-sm text-sand/75">{waitlist.text}</p> : null}
      </section>

      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="font-serif text-4xl text-sand">Unissued</h2>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {listings.map((listing) => (
            <li key={listing.id} className="py-6">
              <p className="kicker">{listing.kind} · {listing.standards.join(" / ")} · unissued</p>
              <h3 className="mt-2 font-serif text-3xl text-sand">{listing.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sand/70">{listing.summary}</p>
              <button
                type="button"
                className="mt-4 text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase"
                disabled={busy === "mint"}
                onClick={() => previewMint(listing)}
              >
                Preview mint stub
              </button>
            </li>
          ))}
        </ul>
        {mintNote ? <p className="mt-6 text-sm text-sand/75">{mintNote.text}</p> : null}
      </section>
    </div>
  );
}
