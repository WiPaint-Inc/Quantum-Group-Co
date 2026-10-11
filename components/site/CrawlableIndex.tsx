import Link from "next/link";
import { company, developments, estates, marketplaceListings, spaceNodes } from "@/content/site";

export function CrawlableIndex() {
  return (
    <section className="crawlable-index" aria-label="Written index of the same facts">
      <p>{company.description}</p>
      <ul>
        {company.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      {estates.map((estate) => (
        <article key={estate.slug}>
          <h2>{estate.name}</h2>
          <p>Placeholder estate. {estate.setting}, {estate.region}.</p>
          <p>{estate.epithet}</p>
          <p>{estate.summary}</p>
          {estate.narrative.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{estate.composition}</p>
          <ul>
            {estate.finishes.map((finish) => (
              <li key={finish}>{finish}</li>
            ))}
          </ul>
          <Link href={`/estates/${estate.slug}`}>Study {estate.name}</Link>
        </article>
      ))}
      {spaceNodes.map((node) => (
        <article key={node.id}>
          <h2>{node.title}</h2>
          <p>{node.summary}</p>
          <Link href={node.href}>{node.title}</Link>
        </article>
      ))}
      {developments.map((item) => (
        <article key={item.slug}>
          <h2>{item.name}</h2>
          <p>Placeholder development. {item.summary}</p>
        </article>
      ))}
      {marketplaceListings.map((listing) => (
        <article key={listing.id}>
          <h2>{listing.title}</h2>
          <p>{listing.summary} Unissued. {listing.standards.join(" or ")}.</p>
        </article>
      ))}
    </section>
  );
}
