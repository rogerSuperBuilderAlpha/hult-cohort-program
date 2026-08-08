import { NextResponse } from "next/server";

import { destroySession } from "@/lib/ludwitt/session";

export async function POST(request: Request) {
  await destroySession();
  const url = new URL("/", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url));
}
