import { buildLive } from "@/content/site";
import { aiFeaturesEnabled } from "@/lib/flags";
import { apiOk } from "@/lib/http";

export function GET() {
  const { avatar, markerKeys, ...live } = buildLive;
  return apiOk({
    ...live,
    markerKeys: aiFeaturesEnabled() ? markerKeys : markerKeys.filter((key) => key !== "avatar-launch"),
    app: {
      status: "not-launched",
      note: "The private project app is part of the offer. It is not built yet. Launch timing and platform are still to be confirmed.",
    },
    representative: buildLive.representative,
    ...(aiFeaturesEnabled() ? { avatar: { status: "coming_soon" as const, copy: avatar.copy } } : {}),
  });
}
