export function Plate({
  from,
  to,
  label,
}: {
  from: string;
  to: string;
  label: string;
}) {
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden border border-line"
      style={{ backgroundImage: `linear-gradient(145deg, ${from}, ${to})` }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full opacity-80" aria-hidden="true">
        <path d="M28 150 H292 M40 150 V78 H200 V108 H270 V150 M40 108 H130" fill="none" stroke="#f4efe6" strokeWidth="1" />
        <path d="M200 78 L236 58 H292" fill="none" stroke="#e6d2a8" strokeWidth="1" />
      </svg>
      <span className="absolute bottom-3 left-3 text-[0.62rem] tracking-[0.22em] text-sand uppercase">Study plate</span>
    </div>
  );
}
