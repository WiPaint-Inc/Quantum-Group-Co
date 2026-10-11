import type { Metadata } from "next";
import { MarkerNotes } from "@/components/site/MarkerNote";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Quantum Group Co — published contact details are not ready yet.",
};

export default function ContactPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro
        kicker="Contact"
        title="Start your project."
        lede="A public email, phone and address are not published yet. Nothing here is taken from a partner company."
      />
      <MarkerNotes keys={["contact-email", "contact-phone", "contact-address", "contact-social"]} />
    </main>
  );
}
