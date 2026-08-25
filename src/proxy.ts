import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Applied to every response. A nonce-based CSP script-src has been tried
// twice (see git history) and reverted both times after it broke hydration
// in production — even with 'strict-dynamic', Next.js/Turbopack's own
// dynamically-created <script> chunks aren't reliably honored by the
// browser's nonce check, and several of Next's own inline RSC-streaming
// scripts ship with no nonce at all. That path needs a deeper framework
// fix (or a Next.js upgrade), not a middleware-only change.
//
// This is the safer middle ground instead: a host+'unsafe-inline' policy
// that doesn't touch the nonce machinery Next's internals depend on at
// all, so it can't hit that failure mode. 'self' + the Cashfree SDK origin
// (the only external script this app loads, in loadCashfreeSdk.ts) blocks
// the most common XSS payload delivery method — a script tag pointing at
// attacker-controlled infrastructure — which 'unsafe-inline' does not
// re-open, since that only concerns *inline* script content, not *source*
// origin. It doesn't stop inline-script XSS the way a nonce policy would,
// but it's real, verified-safe hardening over having no script-src at all.
// https://checkout.razorpay.com is the Razorpay Standard Checkout SDK
// (loadRazorpaySdk.ts), added the same way as the Cashfree entry above.
// https://www.googletagmanager.com is the GA4 gtag.js loader
// (GoogleAnalytics.tsx), added the same way.
function securityHeaders(response: NextResponse) {
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
  response.headers.set(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' https://sdk.cashfree.com https://checkout.razorpay.com https://www.googletagmanager.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPublicRoute =
    pathname.startsWith("/admin/login") || pathname.startsWith("/admin/reset-password");

  if (pathname.startsWith("/api/admin")) {
    const { supabase } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return securityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    return securityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/admin") && !isAdminPublicRoute) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      // Signed in, but as the wrong account — send them back to the login
      // form (with an explanatory message) instead of a dead-end 403, so
      // they can sign in again as the admin account.
      return securityHeaders(
        NextResponse.redirect(new URL("/admin/login?error=not_admin", request.url))
      );
    }
    return securityHeaders(response);
  }

  if (pathname.startsWith("/account")) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return securityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }
    return securityHeaders(response);
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
