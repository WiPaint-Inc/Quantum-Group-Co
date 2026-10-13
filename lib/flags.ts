/** Server-side flags. Client UI receives them as props so secrets never ship to the browser. */

export function paymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === "true";
}

export function roboticsEnabled(): boolean {
  return process.env.ROBOTICS_ENABLED === "true";
}

/** Concept photographs, Estates plates, conceptRenders, and /concept/demo-villa. Off unless the env var is exactly "true". */
export function draftContentEnabled(): boolean {
  return process.env.DRAFT_CONTENT === "true";
}

export function aiFeaturesEnabled(): boolean {
  return process.env.AI_FEATURES_ENABLED === "true";
}

export function agentApiEnabled(): boolean {
  return process.env.AGENT_API_ENABLED === "true";
}

/** Product-line name on the materials service. Set SHOW_VIVID_PRODUCT_LINES=false to remove it. */
export function showVividProductLines(): boolean {
  return process.env.SHOW_VIVID_PRODUCT_LINES !== "false";
}

/** Bracket notes render in development and in explicit preview builds, not in production HTML. */
export function showInternalNotes(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "true";
}
