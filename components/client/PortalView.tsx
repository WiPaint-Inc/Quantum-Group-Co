"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <p className="mt-12 max-w-xl text-sm text-sand/65">The private project app on this page uses the Demo Villa sample only.</p>
      <button type="button" onClick={signOut} className="mt-10 block text-[0.68rem] tracking-[0.22em] text-sand/60 uppercase">
        Sign out
      </button>
    </div>
  );
}
