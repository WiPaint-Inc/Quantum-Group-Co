import type { WebGLRenderer } from "three";
import { KTX2Loader, type GLTFLoader, type GLTFLoaderPlugin, type GLTFReference } from "three-stdlib";
import { KTX2_TRANSCODER_PATH, phaseFromName } from "@/lib/villa-assets";
import type { VillaPhase } from "@/lib/villa-flight";

type Association = GLTFReference & { primitives?: number };
type Mapping = { material: number; variants: number[] };
type VariantMesh = {
  object: { isMesh?: boolean; material?: unknown };
  byPhase: Partial<Record<VillaPhase, unknown>>;
};

/**
 * KTX2 plus a small KHR_materials_variants reader.
 * Draco and meshopt are attached by useGLTF's own loader hooks.
 */
export function attachVillaLoaders(loader: GLTFLoader, gl: WebGLRenderer) {
  const ktx2 = new KTX2Loader();
  ktx2.setTranscoderPath(KTX2_TRANSCODER_PATH);
  ktx2.detectSupport(gl);
  loader.setKTX2Loader(ktx2);

  loader.register((parser): GLTFLoaderPlugin => ({
    afterRoot(result) {
      const json = parser.json as {
        extensions?: { KHR_materials_variants?: { variants?: { name: string }[] } };
        meshes?: Array<{ primitives?: Array<{ extensions?: { KHR_materials_variants?: { mappings?: Mapping[] } } }> }>;
      };
      const names = json.extensions?.KHR_materials_variants?.variants?.map((variant) => variant.name) ?? [];
      const meshes: VariantMesh[] = [];
      const tasks: Promise<void>[] = [];
      const associations = parser.associations as Map<{ isMesh?: boolean; material?: unknown }, Association>;
      for (const [object, assoc] of associations) {
        if (!object.isMesh || assoc.meshes == null || assoc.primitives == null) continue;
        const mappings = json.meshes?.[assoc.meshes]?.primitives?.[assoc.primitives]?.extensions?.KHR_materials_variants?.mappings;
        if (!mappings) continue;
        const byPhase: VariantMesh["byPhase"] = {};
        for (const mapping of mappings) {
          for (const index of mapping.variants) {
            const phase = phaseFromName(names[index] ?? "");
            if (!phase || byPhase[phase]) continue;
            tasks.push(
              parser.getDependency("material", mapping.material).then((material: unknown) => {
                byPhase[phase] = material;
              }),
            );
          }
        }
        meshes.push({ object, byPhase });
      }
      return Promise.all(tasks).then(() => {
        result.scene.userData.variantNames = names;
        result.scene.userData.applyPhaseMaterials = (phase: VillaPhase) => {
          const materialPhase = phase === "interior" && !meshes.some((entry) => entry.byPhase.interior) ? "finished" : phase;
          for (const entry of meshes) {
            const material = entry.byPhase[materialPhase];
            if (material) entry.object.material = material;
          }
        };
      });
    },
  }));

  return ktx2;
}
