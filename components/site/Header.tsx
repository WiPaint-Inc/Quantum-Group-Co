"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { company, services } from "@/content/site";

const links = [
  { href: "/estates", label: "Estates" },
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
  const paper = pathname.startsWith("/estates");
  const ink = paper ? "text-[#1a1a1a]" : "text-sand";
  const muted = paper ? "text-[#1a1a1a]/70" : "text-sand/70";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${paper ? "border-b border-[#c5a059]/50 bg-[#f3efe6]/95" : ""}`}>
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className={`font-serif text-lg tracking-[0.18em] uppercase ${ink}`} onClick={() => setOpen(false)}>
          {company.name}
        </Link>
        <nav className={`hidden items-center gap-7 text-[0.68rem] tracking-[0.22em] uppercase md:flex ${muted}`} aria-label="Primary">
          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <Link href="/services" className={servicesActive ? ink : paper ? "hover:text-[#1a1a1a]" : "hover:text-sand"} aria-expanded={servicesOpen}>
              Services
            </Link>
            {servicesOpen ? (
              <div className="absolute top-full left-0 z-50 pt-3">
                <ul className={`w-80 border p-4 normal-case ${paper ? "border-[#c5a059] bg-[#f3efe6]" : "border-line bg-ink/95"}`}>
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link href={`/services/${service.slug}`} className={`block py-2 tracking-normal hover:text-[#8d7344] ${paper ? "text-[#1a1a1a]" : "text-sand"}`} onClick={() => setServicesOpen(false)}>
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
              <Link key={link.href} href={link.href} className={active ? ink : paper ? "hover:text-[#1a1a1a]" : "hover:text-sand"}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button type="button" className={`text-[0.68rem] tracking-[0.22em] uppercase md:hidden ${ink}`} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav className={`border-t px-6 py-6 md:hidden ${paper ? "border-[#c5a059] bg-[#f3efe6]" : "border-line bg-ink/95"}`} aria-label="Primary">
          <ul className="space-y-4">
            <li>
              <Link href="/services" className={`font-serif text-4xl ${ink}`} onClick={() => setOpen(false)}>
                Services
              </Link>
              <ul className="mt-3 space-y-2">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className={`text-sm tracking-normal ${paper ? "text-[#1a1a1a]/80" : "text-sand/80"}`} onClick={() => setOpen(false)}>
                      0{service.order} {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`font-serif text-4xl ${ink}`} onClick={() => setOpen(false)}>
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
