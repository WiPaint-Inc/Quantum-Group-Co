type ScrollApi = { scrollTo: (target: number, options?: { immediate?: boolean }) => void };

let api: ScrollApi | null = null;

export function registerScroll(next: ScrollApi | null) {
  api = next;
}

export function scrollToY(target: number) {
  if (api) api.scrollTo(target);
  else window.scrollTo({ top: target, behavior: "smooth" });
}
