import { CrawlableIndex } from "@/components/site/CrawlableIndex";
import { Experience } from "@/components/experience/Experience";
import { JsonLd } from "@/components/site/JsonLd";
import { estatesItemListJsonLd } from "@/lib/jsonld";

export default function HomePage() {
  return (
    <main id="content" className="relative">
      <JsonLd data={estatesItemListJsonLd()} />
      <CrawlableIndex />
      <Experience />
    </main>
  );
}
