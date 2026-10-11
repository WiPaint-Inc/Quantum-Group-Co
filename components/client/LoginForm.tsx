"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/client/") || value.startsWith("//")) return "/client/portal";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = (await response.json()) as { error?: { message?: string } };
    setPending(false);
    if (!response.ok) {
      setMessage(payload.error?.message ?? "The session was not created.");
      return;
    }
    router.push(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-12 max-w-md space-y-6">
      <label className="block">
        <span className="kicker">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="mt-3 w-full border-b border-line bg-transparent py-3 text-sand outline-none"
        />
      </label>
      <button type="submit" disabled={pending} className="text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        {pending ? "Opening" : "Enter the atelier"}
      </button>
      {message ? <p className="text-sm text-sand/75">{message}</p> : null}
    </form>
  );
}
