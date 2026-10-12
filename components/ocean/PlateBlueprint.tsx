const ESTATE = [
  "350,195 458,143 670,141 818,192 350,195",
  "370,205 370,330 840,330 840,205",
  "113,358 195,297 293,297 352,352 113,358",
  "127,360 127,410 342,410 342,355",
  "674,391 801,385 1016,498 860,537 674,391",
  "922,524 977,489 1055,489 1094,524 922,524",
  "934,526 934,586 1084,586 1084,526",
  "1006,322 1055,287 1143,287 1192,322 1006,322",
  "1231,371 1280,318 1436,318 1495,371 1231,371",
  "1240,372 1240,430 1490,430 1490,372",
  "1305,512 1348,469 1446,469 1481,512 1305,512",
  "1270,557 1397,557 1397,596 1270,596 1270,557",
  "0,551 332,616 586,694 821,772 1036,860 1094,900",
];

const ESTATE_LINES: Array<[number, number, number, number]> = [
  [458, 143, 505, 190],
  [670, 141, 700, 188],
  [352, 300, 850, 300],
  [68, 655, 342, 567],
  [60, 635, 80, 680],
  [380, 345, 840, 345],
  [380, 337, 380, 353],
  [840, 337, 840, 353],
];

const PENINSULA = [
  "400,289 449,270 557,270 582,293",
  "400,293 400,332 582,332 582,293",
  "629,264 840,260 840,328 629,328 629,264",
  "903,250 997,225 1090,244",
  "903,250 903,309 1090,309 1090,244",
  "1129,244 1221,217 1348,244",
  "1129,244 1129,303 1348,303 1348,244",
  "1336,303 1553,299 1553,391 1336,391 1336,303",
  "254,400 586,381 977,391 1446,410",
  "254,469 977,489 1465,489",
  "567,504 997,492 997,572 528,576 567,504",
  "1016,512 1348,524 1348,580 1016,572 1016,512",
  "63,621 117,645 352,640 371,610 234,586 88,610 63,621",
  "332,586 586,629 821,723 1016,811 1172,900",
  "1104,625 1426,660 1426,694 1104,660 1104,625",
];

export function PlateBlueprint({ plate, draw, weight = 1.7 }: { plate: "mega-estate-aerial" | "peninsula-development-big-beach"; draw: number; weight?: number }) {
  const offset = 1 - Math.min(1, Math.max(0, draw));
  const stroke = {
    fill: "none" as const,
    stroke: "#E3CB98",
    strokeWidth: weight,
    pathLength: 1,
    style: { strokeDasharray: 1, strokeDashoffset: offset, filter: "drop-shadow(0 0 4px rgba(227,203,152,.85))" },
  };
  const polys = plate === "mega-estate-aerial" ? ESTATE : PENINSULA;
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {polys.map((points) => (
        <polyline key={points} points={points} {...stroke} />
      ))}
      {plate === "mega-estate-aerial"
        ? ESTATE_LINES.map((line) => <line key={line.join("-")} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} {...stroke} />)
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
