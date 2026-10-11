import Link from "next/link";
import { company } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10 md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-2xl text-sand">{company.name}</p>
          <p className="mt-2 text-[0.72rem] tracking-[0.22em] text-gold-2 uppercase">{company.tagline}</p>
          <p className="mt-2 max-w-sm text-sm text-sand/60">{company.market}.</p>
        </div>
        <nav aria-label="Agents" className="flex gap-6 text-[0.68rem] tracking-[0.2em] text-sand/55 uppercase">
          <Link href="/llms.txt" className="hover:text-sand">llms.txt</Link>
          <Link href="/api/openapi.json" className="hover:text-sand">OpenAPI</Link>
          <Link href="/api" className="hover:text-sand">API</Link>
          <Link href="/pay" className="hover:text-sand">Pay</Link>
        </nav>
      </div>
    </footer>
  );
}
