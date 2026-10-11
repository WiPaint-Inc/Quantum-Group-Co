import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
import { services } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Renderings, design, engineering and plans through construction, finishing and in-house materials from Quantum Group Co in Antigua and Barbuda.",
};

export default function ServicesPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro
        kicker="Services"
        title="One company, from the rendering to the last surface."
        lede="Six services, in this order. Full design and build, rendering and plans, construction, engineering, developments, and materials."
      />
      <ol className="mt-16 divide-y divide-line border-y border-line">
        {services.map((service) => (
          <li key={service.slug}>
            <Link href={`/services/${service.slug}`} className="grid gap-3 py-8 md:grid-cols-12">
              <span className="kicker md:col-span-2">0{service.order}</span>
              <span className="font-serif text-3xl text-sand md:col-span-6">{service.title}</span>
              <span className="text-sm text-sand/65 md:col-span-4">{service.headline}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
