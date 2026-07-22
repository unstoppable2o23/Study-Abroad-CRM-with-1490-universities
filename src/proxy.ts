import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { combinedMiddleware } from "@/lib/middleware";

export async function proxy(request: NextRequest) {
  return combinedMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};