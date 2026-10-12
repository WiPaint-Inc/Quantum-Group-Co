import type { ComponentType } from "react";

/**
 * Self-contained estate scenes. A module's default export is rendered inside the canvas.
 * Leave this empty until CAD registers one. See docs/ESTATES.md.
 */
export const estateSceneModules: Record<string, () => Promise<{ default: ComponentType }>> = {};
