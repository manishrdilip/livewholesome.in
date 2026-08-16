import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Applied to every response. script-src uses a per-request nonce (the
// correct way to allow Next.js's own hydration/runtime scripts under a
// strict CSP, rather than weakening it with 'unsafe-inline').
function securityHeaders(response: NextResponse, nonce: string) {
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://api.postalpincode.in https://nominatim.openstreetmap.org;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  const requestWithNonce = new Request(request.url, { headers: requestHeaders });

  const isAdminPublicRoute =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/reset-password");

  if (pathname.startsWith("/api/admin")) {
    const { supabase } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return securityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), nonce);
    }
    return securityHeaders(NextResponse.next({ request: requestWithNonce }), nonce);
  }

  if (pathname.startsWith("/admin") && !isAdminPublicRoute) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)), nonce);
    }
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      // Signed in, but as the wrong account — send them back to the login
      // form (with an explanatory message) instead of a dead-end 403, so
      // they can sign in again as the admin account.
      return securityHeaders(
        NextResponse.redirect(new URL("/admin/login?error=not_admin", request.url)),
        nonce
      );
    }
    return securityHeaders(response, nonce);
  }

  if (pathname.startsWith("/account")) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return securityHeaders(NextResponse.redirect(new URL("/login", request.url)), nonce);
    }
    return securityHeaders(response, nonce);
  }

  return securityHeaders(NextResponse.next({ request: requestWithNonce }), nonce);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
