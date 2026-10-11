import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header, HeaderFallback } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { company } from "@/content/site";
import { organizationJsonLd } from "@/lib/jsonld";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${company.name} — Ultra-luxury residences`,
    template: `%s — ${company.name}`,
  },
  description: company.description,
  applicationName: company.name,
  keywords: [
    "Quantum Group Co.",
    "Antigua and Barbuda",
    "ultra-luxury residential",
    "high-end construction",
    "development",
  ],
  openGraph: {
    type: "website",
    locale: "en",
    siteName: company.name,
    title: `${company.name} — Ultra-luxury residences`,
    description: company.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} — Ultra-luxury residences`,
    description: company.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071014",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-ink font-sans text-sand">
        <JsonLd data={organizationJsonLd()} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[80] focus:bg-ink focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <noscript>
          <p className="px-6 py-8 text-sm text-sand/80">
            JavaScript is off. The written pages, JSON-LD, and the agent API remain available. Begin with the estates index.
          </p>
        </noscript>
      </body>
    </html>
  );
}
