import { POST_launchToken } from "@/lib/platform/handlers";

export async function POST(req: Request) {
  return POST_launchToken(req);
}
