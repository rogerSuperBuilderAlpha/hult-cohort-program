import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals and any path with a file extension (public assets).
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
