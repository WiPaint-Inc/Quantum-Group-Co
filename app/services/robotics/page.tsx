import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { robotics } from "@/content/site";
import { roboticsEnabled } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Robotics",
  robots: { index: false, follow: false },
};

export default function RoboticsPage() {
  if (!roboticsEnabled()) notFound();
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">Held</p>
      <h1 className="mt-4 font-serif text-6xl text-sand">{robotics.title}</h1>
      <p className="mt-6 max-w-xl text-sand/75">{robotics.headline}</p>
      <div className="mt-8 max-w-2xl space-y-4 text-sand/70">
        {robotics.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
