import Link from "next/link";

export default function NotFound() {
  return (
    <main id="content" className="px-6 pt-36 pb-24 md:px-12">
      <p className="kicker">Missing</p>
      <h1 className="mt-4 font-serif text-6xl text-sand">This page is not on the plan.</h1>
      <p className="mt-6 max-w-md text-sand/70">The address does not match a published study.</p>
      <Link href="/" className="mt-10 inline-block text-[0.68rem] tracking-[0.22em] text-gold-2 uppercase">
        Return home
      </Link>
    </main>
  );
}
