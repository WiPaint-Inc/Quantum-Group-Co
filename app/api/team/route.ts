import { team } from "@/content/site";
import { apiOk } from "@/lib/http";

export function GET() {
  return apiOk({
    team: team
      .filter((member) => member.confirmed)
      .map((member) => ({ id: member.id, name: member.name, title: member.title, bio: member.bio })),
  });
}
