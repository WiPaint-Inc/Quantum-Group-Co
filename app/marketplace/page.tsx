import type { Metadata } from "next";
import { MarketplaceDesk } from "@/components/marketplace/MarketplaceDesk";
import { PageIntro } from "@/components/site/PageIntro";
import { marketplaceListings } from "@/content/site";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "A teaser for a later private issuance of Quantum Group Co plans and renders as NFTs or Bitcoin Ordinals. Nothing is minted.",
};

export default function MarketplacePage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro
        kicker="Marketplace"
        title="Plans and renders, later, for a private buyer."
        lede="A future issuance may take the form of an NFT or a Bitcoin Ordinal: a plan set or a render plate, held by someone who intends to build. Phase 1 is a waitlist and a minting stub. No wallet opens. No public network is touched."
      />
      <MarketplaceDesk listings={marketplaceListings} />
    </main>
  );
}
