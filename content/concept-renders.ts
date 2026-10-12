/**
 * Test studies made from anonymous sample floor plans.
 *
 * Empty until a draft preview needs a plate. Each entry is a study, not a
 * client project and not completed work. Do not add these to the Partner
 * Portfolio, the sitemap, or JSON-LD. Remove them, or replace them with
 * approved images, before go-live.
 *
 * They are shown only when DRAFT_CONTENT=true. The published list is empty
 * whenever that flag is off.
 */
export type ConceptRender = {
  id: string;
  src: string;
  width: number;
  height: number;
};

export const conceptRenders: readonly ConceptRender[] = [];

export function visibleConceptRenders(draft: boolean): readonly ConceptRender[] {
  if (!draft) return [];
  return conceptRenders;
}
