const STEPS = ["Site", "Structure", "Finish", "Handover"];

export function ProjectAppMock() {
  return (
    <div className="w-full max-w-xl border border-gold/50 bg-ink/80 p-5 text-sand shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="border border-gold bg-ink px-2 py-1 text-[0.68rem] font-medium tracking-[0.22em] text-gold-2 uppercase">Illustration</p>
        <p className="text-right font-serif text-2xl leading-none md:text-3xl">Your private project app</p>
      </div>
      <p className="mt-6 text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">Progress</p>
      <ol className="mt-3 flex items-center gap-2">
        {STEPS.map((step, index) => {
          const current = step === "Structure";
          return (
            <li key={step} className="flex flex-1 items-center gap-2">
              <span className={`block h-1 flex-1 ${index <= 1 ? "bg-gold" : "bg-sand/20"}`} />
              <span className={`text-[0.58rem] tracking-[0.12em] uppercase ${current ? "text-gold-2" : "text-sand/50"}`}>{step}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 border border-line">
        <div className="h-24 bg-[radial-gradient(420px_80px_at_70%_80%,rgba(198,163,106,0.45),transparent_60%),linear-gradient(180deg,#1a1714,#0c1014)]" />
        <p className="px-3 py-2 text-sm text-sand/80">Week 12 · structure and openings</p>
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <p className="text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">Project channel</p>
        <p className="mt-2 text-sm text-sand/80">Weekly note filed. Photographs of the structure are in the folder.</p>
        <p className="mt-2 text-sm text-sand/80">Thursday&apos;s video call stands.</p>
      </div>
      <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
        <p className="text-[0.62rem] tracking-[0.2em] text-sand/50 uppercase">Next video call</p>
        <p className="font-serif text-xl text-sand">Thursday morning</p>
      </div>
    </div>
  );
}
