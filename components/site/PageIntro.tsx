export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="kicker">{kicker}</p>
      <h1 className="mt-4 font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">{title}</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-sand/70">{lede}</p>
    </header>
  );
}
