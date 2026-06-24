import { NextRequest, NextResponse } from "next/server";

/**
 * DEV-ONLY login bypass.
 *
 * Sets a signed-ish cookie that the middleware and auth-guard recognise
 * in development. This route is completely unreachable in production because
 * it throws a 404 before doing anything else.
 *
 * Usage:  GET /api/dev-login?role=admin   → redirects to /admin
 *         GET /api/dev-login?role=user    → redirects to /
 */
export async function GET(request: NextRequest) {
  // Hard gate — never run in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = request.nextUrl.searchParams.get("role");
  if (role !== "admin" && role !== "user") {
    return NextResponse.json(
      { error: "role must be 'admin' or 'user'" },
      { status: 400 }
    );
  }

  const destination = role === "admin" ? "/admin" : "/";
  const response = NextResponse.redirect(new URL(destination, request.url));

  // Set a session-scoped cookie (no maxAge → gone when browser closes).
  response.cookies.set("x-dev-bypass", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // No `secure` flag — we're on HTTP locally.
  });

  return response;
}
