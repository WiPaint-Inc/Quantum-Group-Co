import Link from "next/link";
import { company } from "@/content/site";
import { agentApiEnabled, paymentsEnabled } from "@/lib/flags";

export function Footer() {
  const links = [
    ...(agentApiEnabled()
      ? [
          { href: "/llms.txt", label: "llms.txt" },
          { href: "/api/openapi.json", label: "OpenAPI" },
          { href: "/api", label: "API" },
        ]
      : []),
    ...(paymentsEnabled() ? [{ href: "/pay", label: "Pay" }] : []),
  ];

  return (
    <footer className="border-t border-line px-6 py-10 md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-2xl text-sand">{company.name}</p>
          <p className="mt-2 text-[0.72rem] tracking-[0.22em] text-gold-2 uppercase">{company.tagline}</p>
          <p className="mt-2 max-w-sm text-sm text-sand/60">{company.market}.</p>
        </div>
        {links.length > 0 ? (
          <nav aria-label="More" className="flex gap-6 text-[0.68rem] tracking-[0.2em] text-sand/55 uppercase">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-sand">{link.label}</Link>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
