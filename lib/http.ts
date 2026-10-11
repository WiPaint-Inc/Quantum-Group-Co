export type ApiErrorCode =
  | "not_found"
  | "unauthorized"
  | "unconfigured"
  | "invalid_request";

export function apiOk<T>(data: T, status = 200, cache = "public, max-age=300") {
  return Response.json(
    { ok: true as const, placeholder: true as const, data },
    { status, headers: { "cache-control": cache } },
  );
}

export function apiError(code: ApiErrorCode, message: string, status: number) {
  return Response.json(
    { ok: false as const, error: { code, message } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
