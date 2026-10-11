"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { company, services } from "@/content/site";

const links = [
  { href: "/portfolio", label: "Partner Portfolio" },
  { href: "/about", label: "About" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/client", label: "Client" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesActive = pathname === "/services" || pathname.startsWith("/services/");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="font-serif text-lg tracking-[0.18em] text-sand uppercase" onClick={() => setOpen(false)}>
          {company.name}
        </Link>
        <nav className="hidden items-center gap-7 text-[0.68rem] tracking-[0.22em] text-sand/70 uppercase md:flex" aria-label="Primary">
          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <Link href="/services" className={servicesActive ? "text-sand" : "hover:text-sand"} aria-expanded={servicesOpen}>
              Services
            </Link>
            {servicesOpen ? (
              <div className="absolute top-full left-0 z-50 pt-3">
                <ul className="w-80 border border-line bg-ink/95 p-4 normal-case">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link href={`/services/${service.slug}`} className="block py-2 tracking-normal text-sand hover:text-gold-2" onClick={() => setServicesOpen(false)}>
                        <span className="mr-3 text-[0.62rem] tracking-[0.18em] text-gold-2">0{service.order}</span>
                        <span className="font-serif text-lg">{service.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
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
            <li>
              <Link href="/services" className="font-serif text-4xl text-sand" onClick={() => setOpen(false)}>
                Services
              </Link>
              <ul className="mt-3 space-y-2">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className="text-sm tracking-normal text-sand/80" onClick={() => setOpen(false)}>
                      0{service.order} {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
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
