import { POST_register } from "@/lib/platform/handlers";

export async function POST(req: Request) {
  return POST_register(req);
}
