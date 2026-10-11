const PRICE = /(?:\$\s?\d)|(?:\b\d[\d,]*(?:\.\d+)?\s?(?:USD|US\$|dollars)\b)/i;
const URL = /https?:\/\//i;

export function assertNoPricesOrExternalUrls(value: unknown, label = "content"): void {
  const problems: string[] = [];
  walk(value, label, problems);
  if (problems.length > 0) {
    throw new Error(`Public copy failed the publication check:\n${problems.join("\n")}`);
  }
}

function walk(value: unknown, path: string, problems: string[]) {
  if (typeof value === "string") {
    if (PRICE.test(value)) problems.push(`${path} contains a price`);
    if (URL.test(value)) problems.push(`${path} contains an external URL`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, problems));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "src" || key === "file") continue;
      walk(child, `${path}.${key}`, problems);
    }
  }
}
