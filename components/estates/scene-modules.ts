import type { ComponentType } from "react";

/**
 * Shared with the homepage fly-in. The module loads the CAD glTF when it is present
 * and the placeholder massing until then. See docs/ESTATES.md and docs/JOURNEY_SPEC.md.
 */
export const estateSceneModules: Record<string, () => Promise<{ default: ComponentType }>> = {
  "mega-estate": () => import("./scenes/mega-estate"),
  cliffside: () => import("./scenes/cliffside"),
};
