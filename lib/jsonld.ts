import { company, developments, estates, type Estate } from "@/content/site";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description,
    url: getSiteUrl(),
    areaServed: {
      "@type": "Country",
      name: company.market,
    },
    knowsAbout: [
      "Ultra-luxury residential construction",
      "High-end residential development",
      "Antigua and Barbuda",
    ],
  };
}

export function estateJsonLd(estate: Estate) {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateListing", "Place", "Residence"],
    name: estate.name,
    description: `${estate.summary} Placeholder study. Commercial terms are not published.`,
    url: absoluteUrl(`/estates/${estate.slug}`),
    address: {
      "@type": "PostalAddress",
      addressCountry: company.marketCountryCode,
      addressRegion: estate.region,
    },
    additionalProperty: estate.finishes.map((finish) => ({
      "@type": "PropertyValue",
      name: "Finish",
      value: finish,
    })),
  };
}

export function estatesItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Signature estates",
    itemListElement: estates.map((estate, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/estates/${estate.slug}`),
      item: estateJsonLd(estate),
    })),
  };
}

export function developmentsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Development studies",
    itemListElement: developments.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/developments/${item.slug}`),
      item: {
        "@type": "Place",
        name: item.name,
        description: item.summary,
        address: {
          "@type": "PostalAddress",
          addressCountry: company.marketCountryCode,
          addressRegion: company.market,
        },
      },
    })),
  };
}
