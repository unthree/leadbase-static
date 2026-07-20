import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Phase 4 (P4-T3) replaces this stub with the Supabase auth gate.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/feed/:path*", "/portfolio/:path*", "/agent/:path*", "/builder/:path*", "/research/:path*", "/settings/:path*"],
};
