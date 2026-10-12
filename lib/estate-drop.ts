/**
 * Shared CAD drop for the Grand Beachfront estate and the Cliffside residence.
 * Files are metres, Y-up. The origin is the estate centre at ground level. Sea is +Z.
 * The homepage fly-in and the estate page both read this module.
 */

export type EstateVec3 = [number, number, number];

export type EstateCameraFrame = {
  t: number;
  position: EstateVec3;
  target: EstateVec3;
};

export type EstateVegetationItem = {
  position: EstateVec3;
  scale: number;
  type?: string;
};

export type EstateDropFiles = {
  web: string;
  lod1: string;
  lod2: string;
  wireframe: string;
  vegetation: string;
  cameraPath: string;
  /** Optional MEP layer. Only the cliffside drop sets this. */
  mep?: string;
};

export type EstateDrop = {
  id: string;
  /** URL prefix served from public/. */
  publicDir: string;
  /** Folder CAD writes into. Symlinked from publicDir. */
  cadDir: string;
  files: EstateDropFiles;
};

export type EstateAvailability = {
  solid: string | null;
  lod1: string | null;
  lod2: string | null;
  wireframe: string | null;
  mep: string | null;
  cameraPath: EstateCameraFrame[] | null;
  vegetation: EstateVegetationItem[] | null;
};

export const MEGA_ESTATE_DROP: EstateDrop = {
  id: "design-build",
  publicDir: "/estates/mega-estate/web",
  cadDir: "quantum-group-co/estates/mega-estate/web",
  files: {
    web: "mega-estate_web.glb",
    lod1: "mega-estate_web_lod1.glb",
    lod2: "mega-estate_web_lod2.glb",
    wireframe: "mega-estate_web_wireframe.glb",
    vegetation: "mega-estate_vegetation.json",
    cameraPath: "mega-estate_camera_path.json",
  },
};

export const CLIFFSIDE_DROP: EstateDrop = {
  id: "engineering",
  publicDir: "/estates/cliffside/web",
  cadDir: "quantum-group-co/estates/cliffside/web",
  files: {
    web: "cliffside_web.glb",
    lod1: "cliffside_web_lod1.glb",
    lod2: "cliffside_web_lod2.glb",
    wireframe: "cliffside_web_wireframe.glb",
    vegetation: "cliffside_vegetation.json",
    cameraPath: "cliffside_camera_path.json",
    mep: "cliffside_mep.glb",
  },
};

export function estateFileUrl(drop: EstateDrop, file: string) {
  return `${drop.publicDir}/${file}`;
}

function asVec(value: unknown): EstateVec3 | null {
  if (!Array.isArray(value) || value.length < 3) return null;
  const x = Number(value[0]);
  const y = Number(value[1]);
  const z = Number(value[2]);
  if (![x, y, z].every(Number.isFinite)) return null;
  return [x, y, z];
}

export function parseEstateCameraPath(data: unknown): EstateCameraFrame[] | null {
  if (!data || typeof data !== "object") return null;
  const frames = Array.isArray(data) ? data : (data as { frames?: unknown }).frames;
  if (!Array.isArray(frames) || frames.length < 2) return null;
  const parsed: EstateCameraFrame[] = [];
  for (const frame of frames) {
    if (!frame || typeof frame !== "object") return null;
    const row = frame as { t?: unknown; position?: unknown; target?: unknown; lookAt?: unknown };
    const position = asVec(row.position);
    const target = asVec(row.target ?? row.lookAt);
    if (!position || !target) return null;
    const t = typeof row.t === "number" ? row.t : parsed.length / Math.max(1, frames.length - 1);
    parsed.push({ t, position, target });
  }
  parsed.sort((a, b) => a.t - b.t);
  return parsed;
}

export function parseEstateVegetation(data: unknown): EstateVegetationItem[] | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { trees?: unknown; items?: unknown; vegetation?: unknown };
  const list = Array.isArray(data) ? data : record.trees ?? record.items ?? record.vegetation;
  if (!Array.isArray(list)) return null;
  const items: EstateVegetationItem[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as { position?: unknown; scale?: unknown; type?: unknown };
    const position = asVec(row.position);
    if (!position) continue;
    items.push({
      position,
      scale: typeof row.scale === "number" ? row.scale : 1,
      type: typeof row.type === "string" ? row.type : undefined,
    });
  }
  return items.length > 0 ? items : null;
}

const paths = new Map<string, EstateCameraFrame[]>();

export function setEstateCameraPath(id: string, frames: EstateCameraFrame[] | null) {
  if (frames && frames.length > 1) paths.set(id, frames);
  else paths.delete(id);
}

export function getEstateCameraPath(id: string) {
  return paths.get(id) ?? null;
}

function looksLikeGlb(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0x67 && bytes[1] === 0x6c && bytes[2] === 0x54 && bytes[3] === 0x46;
}

async function probeGlb(url: string) {
  try {
    const response = await fetch(url, { headers: { Range: "bytes=0-15" } });
    if (!response.ok && response.status !== 206) return null;
    const type = response.headers.get("content-type") ?? "";
    if (type.includes("text/html")) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    return looksLikeGlb(bytes) ? url : null;
  } catch {
    return null;
  }
}

async function probeJson<T>(url: string, parse: (data: unknown) => T | null) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (type.includes("text/html")) return null;
    return parse(await response.json());
  } catch {
    return null;
  }
}

const pending = new Map<string, Promise<EstateAvailability>>();

export function loadEstateDrop(drop: EstateDrop): Promise<EstateAvailability> {
  const cached = pending.get(drop.id);
  if (cached) return cached;
  const job = (async () => {
    const files = drop.files;
    const [solid, lod1, lod2, wireframe, mep, cameraPath, vegetation] = await Promise.all([
      probeGlb(estateFileUrl(drop, files.web)),
      probeGlb(estateFileUrl(drop, files.lod1)),
      probeGlb(estateFileUrl(drop, files.lod2)),
      probeGlb(estateFileUrl(drop, files.wireframe)),
      files.mep ? probeGlb(estateFileUrl(drop, files.mep)) : Promise.resolve(null),
      probeJson(estateFileUrl(drop, files.cameraPath), parseEstateCameraPath),
      probeJson(estateFileUrl(drop, files.vegetation), parseEstateVegetation),
    ]);
    if (cameraPath) setEstateCameraPath(drop.id, cameraPath);
    return { solid, lod1, lod2, wireframe, mep, cameraPath, vegetation };
  })();
  pending.set(drop.id, job);
  return job;
}

export function chooseEstateLod(found: EstateAvailability, distance: number) {
  if (distance > 480 && found.lod2) return found.lod2;
  if (distance > 240 && found.lod1) return found.lod1;
  return found.solid;
}
