import { buildLive } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    ...buildLive,
    app: {
      status: "not-launched",
      note: "The private project app is part of the offer. It is not built yet. Launch timing and platform are still to be confirmed.",
    },
  });
}
