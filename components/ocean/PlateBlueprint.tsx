import { ESTATE_PLAN, ESTATE_PLAN_LINES, PENINSULA_PLAN } from "@/components/ocean/estate-plan";

export function PlateBlueprint({ plate, draw, weight = 1.7 }: { plate: "mega-estate-aerial" | "peninsula-development-big-beach"; draw: number; weight?: number }) {
  const offset = 1 - Math.min(1, Math.max(0, draw));
  const stroke = {
    fill: "none" as const,
    stroke: "#E3CB98",
    strokeWidth: weight,
    pathLength: 1,
    style: { strokeDasharray: 1, strokeDashoffset: offset, filter: "drop-shadow(0 0 4px rgba(227,203,152,.85))" },
  };
  const polys = plate === "mega-estate-aerial" ? ESTATE_PLAN : PENINSULA_PLAN;
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {polys.map((points) => (
        <polyline key={points} points={points} {...stroke} />
      ))}
      {plate === "mega-estate-aerial"
        ? ESTATE_PLAN_LINES.map((line) => <line key={line.join("-")} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} {...stroke} />)
        : null}
      {plate === "peninsula-development-big-beach" ? (
        <>
          <line x1="225" y1="625" x2="752" y2="610" {...stroke} />
          <circle cx="117" cy="453" r="30" {...stroke} />
        </>
      ) : null}
    </svg>
  );
}
