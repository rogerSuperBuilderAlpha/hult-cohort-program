import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";
import { LUDWITT } from "@/lib/ludwitt";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/", LUDWITT.appBaseUrl));
}
