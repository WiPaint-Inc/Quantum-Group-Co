import type { Metadata } from "next";
import { PortalView } from "@/components/client/PortalView";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Portal",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro
        kicker="Portal"
        title="The houses, as slots."
        lede="Nothing private is stored here. Each study below is an extension point for a future per-home application."
      />
      <PortalView />
    </main>
  );
}
