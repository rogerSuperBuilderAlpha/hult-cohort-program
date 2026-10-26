import { NextResponse } from "next/server";
import { clearSession } from "@/lib/ludwitt/session";
import { ludwitt } from "@/lib/config";

async function logout() {
  await clearSession();
  return NextResponse.redirect(ludwitt.appUrl);
}

export async function POST() {
  return logout();
}

export async function GET() {
  return logout();
}
