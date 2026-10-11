export function Loader() {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink text-sand" role="status">
      <div className="w-[min(26rem,84vw)]">
        <p className="kicker">Quantum Group Co.</p>
        <p className="mt-5 font-serif text-5xl leading-none text-sand">Entering the archipelago</p>
        <div className="mt-10 h-px overflow-hidden bg-sand/15">
          <div className="loader-bar h-px bg-gold" />
        </div>
        <p className="mt-5 text-[0.68rem] tracking-[0.28em] text-sand/60 uppercase">Antigua and Barbuda</p>
      </div>
    </div>
  );
}
