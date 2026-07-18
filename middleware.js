import { NextResponse } from "next/server";

// Locks the API when MC_API_KEY is set (recommended for hosted deploys).
// Agents authenticate with `Authorization: Bearer <key>` or `x-api-key: <key>`;
// the web UI stores the key in a cookie after you enter it once.
// With MC_API_KEY unset (local dev), everything stays open.

export const config = { matcher: "/api/:path*" };

export function middleware(req) {
  const key = process.env.MC_API_KEY;
  if (!key) return NextResponse.next();

  if (req.nextUrl.pathname === "/api/openapi.json") return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerKey = req.headers.get("x-api-key");
  const cookieKey = req.cookies.get("mc_key")?.value;

  if (bearer === key || headerKey === key || cookieKey === key) {
    return NextResponse.next();
  }
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
