"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Session = { email: string; note: string };

export function ClientHome() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

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

  if (session === undefined) {
    return <p className="mt-10 text-sm text-sand/50">Reading the placeholder session.</p>;
  }

  if (!session) {
    return (
      <p className="mt-10">
        <Link href="/client/login" className="text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
          Sign in
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      <p className="text-sand/75">Signed in as {session.email}. This is a placeholder session.</p>
      <Link href="/client/portal" className="inline-block text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        Open the portal
      </Link>
    </div>
  );
}
