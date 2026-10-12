import type { VillaPhase } from "@/lib/villa-flight";

export const VILLA_DIR = "/models/demo-villa";
export const VILLA_COMBINED = `${VILLA_DIR}/demo-villa.glb`;
export const VILLA_VIDEO = "/media/demo-villa-flythrough.mp4";
export const VILLA_POSTER = "/media/demo-villa-flythrough.jpg";
export const DRACO_DECODER_PATH = "/decoders/draco/gltf/";
export const KTX2_TRANSCODER_PATH = "/decoders/basis/";

/** First existing file wins. Wireframe is the parked alias for a blueprint export. */
export const VILLA_PHASE_FILES: Record<Exclude<VillaPhase, "interior"> | "interior", string[]> = {
  blueprint: [`${VILLA_DIR}/demo-villa-blueprint.glb`, `${VILLA_DIR}/demo-villa-wireframe.glb`],
  structure: [`${VILLA_DIR}/demo-villa-structure.glb`],
  finished: [`${VILLA_DIR}/demo-villa-finished.glb`],
  interior: [`${VILLA_DIR}/demo-villa-interior.glb`],
};

const NAME_RULES: { phase: VillaPhase; test: RegExp }[] = [
  { phase: "interior", test: /interior|inside|\broom\b/i },
  { phase: "blueprint", test: /blueprint|wireframe|wire-frame|linework/i },
  { phase: "finished", test: /finished|finish|final|complete|clad/i },
  { phase: "structure", test: /structure|structural|whitebox|white-box|\bframe\b|shell/i },
];

export function phaseFromName(name: string): VillaPhase | null {
  for (const rule of NAME_RULES) {
    if (rule.test.test(name)) return rule.phase;
  }
  return null;
}

export type VillaSources = {
  combined: string | null;
  blueprint: string | null;
  structure: string | null;
  finished: string | null;
  interior: string | null;
  video: boolean;
  poster: boolean;
};

async function urlExists(url: string) {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return true;
    if (head.status !== 405 && head.status !== 501) return false;
    const probe = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
    return probe.ok;
  } catch {
    return false;
  }
}

async function firstExisting(urls: string[]) {
  for (const url of urls) {
    if (await urlExists(url)) return url;
  }
  return null;
}

export async function probeVillaSources(): Promise<VillaSources> {
  const [combined, blueprint, structure, finished, interior, video, poster] = await Promise.all([
    urlExists(VILLA_COMBINED).then((ok) => (ok ? VILLA_COMBINED : null)),
    firstExisting(VILLA_PHASE_FILES.blueprint),
    firstExisting(VILLA_PHASE_FILES.structure),
    firstExisting(VILLA_PHASE_FILES.finished),
    firstExisting(VILLA_PHASE_FILES.interior),
    urlExists(VILLA_VIDEO),
    urlExists(VILLA_POSTER),
  ]);
  return { combined, blueprint, structure, finished, interior, video, poster };
}

export function hasVillaModel(sources: VillaSources) {
  return Boolean(sources.combined || sources.blueprint || sources.structure || sources.finished || sources.interior);
}
