import { company, services } from "@/content/site";
import { portfolioProjects } from "@/content/portfolio";
// conceptRenders stay out of JSON-LD. They are not places and not completed work.
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description,
    url: getSiteUrl(),
    slogan: company.tagline,
    areaServed: { "@type": "Country", name: company.market },
    knowsAbout: services.map((service) => service.title),
  };
}

export function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services",
    itemListElement: services.map((service) => ({
      "@type": "ListItem",
      position: service.order,
      url: absoluteUrl(`/services/${service.slug}`),
      name: service.title,
    })),
  };
}

export function portfolioJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Partner portfolio",
    itemListElement: portfolioProjects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/portfolio/${project.slug}`),
      item: {
        "@type": "Place",
        name: project.name,
        description: `${project.name}, ${project.location}. Partner portfolio work.`,
        address: { "@type": "PostalAddress", addressCountry: "AG", addressLocality: project.location },
      },
    })),
  };
}
