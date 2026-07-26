import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Delegates to the Supabase session handler, which refreshes the session and
// enforces the auth gate — or passes through untouched when Supabase isn't
// configured (mock mode).
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/feed/:path*",
    "/portfolio/:path*",
    "/agent/:path*",
    "/builder/:path*",
    "/research/:path*",
    "/settings/:path*",
    "/login",
  ],
};
