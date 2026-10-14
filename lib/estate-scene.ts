import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Uploaded textures stay at or under 2K on the long edge. */
export const TEX_MAX = 2048;

const MAP_KEYS = ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap", "lightMap"] as const;

/** CAD terrain and site slabs. The procedural island is the ground, so these stay hidden. */
export const CAD_HIDE = /(?:^|\/)(T_Terrain(?:_withSkirt)?|SITE_Terrain|SITE_Sea|Site_Terrain|SITE_Ground|G_Service_and_Staff_Building|K_Site_)(?:$|[./])/i;

const DUPE_SUFFIX = /(_\d+|\.00\d+)$/;
const ANIM_KEEP = /crane|dump_truck|excavator|loader|beacon/i;

/** Planting stays at full size. Only the built form grows in. */
export const VEGETATION_NAME = /veg|canopy|palm|tree|landscap|plant|forest|shrub|flora|lawn|garden|jungle|hedge|grass|foliage|fern|bush/i;

export function isVegetationNode(object: THREE.Object3D) {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (VEGETATION_NAME.test(node.name || "")) return true;
    node = node.parent;
  }
  return false;
}

/** Pull planting out of the building group so a reveal scale does not grow the trees. */
export function splitEstateVegetation(root: THREE.Object3D) {
  const vegetation = new THREE.Group();
  vegetation.name = "estate-vegetation";
  const buildings = new THREE.Group();
  buildings.name = "estate-buildings";
  const moving: THREE.Object3D[] = [];
  root.traverse((object) => {
    if (object === root || !VEGETATION_NAME.test(object.name || "")) return;
    if (object.parent && VEGETATION_NAME.test(object.parent.name || "")) return;
    moving.push(object);
  });
  root.updateWorldMatrix(true, true);
  for (const object of moving) vegetation.attach(object);
  while (root.children.length > 0) buildings.add(root.children[0]);
  root.add(buildings);
  root.add(vegetation);
  return { buildings, vegetation };
}

export function nodePath(object: THREE.Object3D, stop?: THREE.Object3D) {
  const parts: string[] = [];
  let node: THREE.Object3D | null = object;
  while (node && node !== stop) {
    if (node.name) parts.push(node.name);
    node = node.parent;
  }
  return parts.reverse().join("/");
}

function meshLeaf(name: string) {
  const cut = name.lastIndexOf("/");
  return cut >= 0 ? name.slice(cut + 1) : name;
}

/**
 * Hide CAD ground, including names that carry a `Site/` prefix.
 * When a mesh and a `_3` / `.001` copy both exist, keep the unsuffixed mesh.
 */
export function hideCadDupes(root: THREE.Object3D, extra?: RegExp | null) {
  const rows: THREE.Mesh[] = [];
  root.traverse((object) => {
    const path = nodePath(object, root);
    const name = object.name || "";
    const blob = path || name;
    if (CAD_HIDE.test(name) || CAD_HIDE.test(blob) || (extra && (extra.test(name) || extra.test(blob)))) {
      object.visible = false;
      return;
    }
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) rows.push(mesh);
  });
  const by = new Map<string, THREE.Mesh[]>();
  rows.forEach((mesh) => {
    const base = meshLeaf(mesh.name || "").replace(DUPE_SUFFIX, "");
    const group = by.get(base) ?? [];
    group.push(mesh);
    by.set(base, group);
  });
  by.forEach((list) => {
    if (list.length < 2) return;
    const keep = list.find((mesh) => !DUPE_SUFFIX.test(meshLeaf(mesh.name || "")));
    if (!keep) return;
    list.forEach((mesh) => {
      if (mesh !== keep) mesh.visible = false;
    });
  });
}

/** v1aa has no wireframe; the file that exists is the v2 wireframe. `loadGLB` would insert another `v2/` and 404. */
export function cliffsideWireframeUrl(dir: string, name: string) {
  if (dir.includes("/v1aa/")) return `cliffside/web/v2/${name}_wireframe.glb`;
  const base = dir.endsWith("/") ? dir : `${dir}/`;
  return `${base}${name}_wireframe.glb`;
}

function downsampleTexture(texture: THREE.Texture) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const width = image?.width ?? 0;
  const height = image?.height ?? 0;
  if (!width || !height || (width <= TEX_MAX && height <= TEX_MAX)) return;
  const mips = texture.mipmaps;
  if (mips && mips.length > 1) {
    let level = 0;
    while ((width >> level) > TEX_MAX || (height >> level) > TEX_MAX) {
      if (level >= mips.length - 1) break;
      level += 1;
    }
    if (level > 0 && mips[level]) {
      texture.mipmaps = mips.slice(level);
      texture.image = mips[level];
      texture.needsUpdate = true;
      return;
    }
  }
  if (typeof document === "undefined" || typeof image?.width !== "number") return;
  const scale = TEX_MAX / Math.max(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width * scale | 0);
  canvas.height = Math.max(1, height * scale | 0);
  const context = canvas.getContext("2d");
  if (!context) return;
  try {
    context.drawImage(image as CanvasImageSource, 0, 0, canvas.width, canvas.height);
    texture.image = canvas;
    texture.mipmaps = [];
    texture.needsUpdate = true;
  } catch {
    // Compressed images that cannot be drawn stay as uploaded. The mip drop above covers KTX2 chains.
  }
}

export function capTextures(root: THREE.Object3D) {
  const seen = new Set<THREE.Texture>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!material) return;
      MAP_KEYS.forEach((key) => {
        const texture = (material as unknown as Record<string, THREE.Texture | null>)[key];
        if (!texture || seen.has(texture)) return;
        seen.add(texture);
        downsampleTexture(texture);
      });
    });
  });
}

function animatedAncestor(object: THREE.Object3D) {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (ANIM_KEEP.test(node.name || "")) return true;
    node = node.parent;
  }
  return false;
}

/** Merge static meshes that share one material. Crane, truck, excavator, loader, and beacon stay separate. */
export function batchStatic(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const inverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<string, THREE.Mesh[]>();
  let before = 0;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible || (mesh as THREE.SkinnedMesh).isSkinnedMesh) return;
    if (animatedAncestor(mesh) || isVegetationNode(mesh)) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (materials.length !== 1 || !materials[0]) return;
    before += 1;
    const names = Object.keys(mesh.geometry.attributes).sort().join(",");
    const key = `${materials[0].uuid}|${names}${mesh.geometry.index ? ":i" : ":n"}`;
    const list = buckets.get(key) ?? [];
    list.push(mesh);
    buckets.set(key, list);
  });
  let after = 0;
  buckets.forEach((list) => {
    if (list.length < 6) {
      after += list.length;
      return;
    }
    const geometries: THREE.BufferGeometry[] = [];
    list.forEach((mesh) => {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
      geometries.push(geometry);
    });
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) {
      after += list.length;
      return;
    }
    const mesh = new THREE.Mesh(merged, list[0].material);
    mesh.name = `batch_${list[0].name || "mesh"}`;
    root.add(mesh);
    list.forEach((source) => {
      source.geometry.dispose();
      source.removeFromParent();
    });
    after += 1;
  });
  return { before, after };
}

export function disposeObjectTree(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!material || material.userData.keep) return;
      MAP_KEYS.forEach((key) => {
        const texture = (material as unknown as Record<string, THREE.Texture | null>)[key];
        if (texture) textures.add(texture);
      });
      material.dispose();
    });
  });
  textures.forEach((texture) => texture.dispose());
}
