"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { company } from "@/content/site";

const links = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/client", label: "Client" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="font-serif text-lg tracking-[0.18em] text-sand uppercase" onClick={() => setOpen(false)}>
          {company.name}
        </Link>
        <nav className="hidden items-center gap-7 text-[0.68rem] tracking-[0.22em] text-sand/70 uppercase md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className={active ? "text-sand" : "hover:text-sand"}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" className="text-[0.68rem] tracking-[0.22em] text-sand uppercase md:hidden" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line bg-ink/95 px-6 py-6 md:hidden" aria-label="Primary">
          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-serif text-4xl text-sand" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function HeaderFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 py-5 md:px-12">
      <span className="font-serif text-lg tracking-[0.18em] text-sand uppercase">{company.name}</span>
    </header>
  );
}
