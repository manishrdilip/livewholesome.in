import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Applied to every response. A nonce-based CSP script-src was tried here
// and reverted: it silently broke a lazily-loaded client chunk in the
// production build (CartProvider's storefront-config fetch stopped
// applying) in a way that didn't reproduce in local dev testing —
// getting Next.js's own chunk-loading nonce propagation exactly right
// needs more careful, production-tested work before turning it back on.
// The other headers below carry no such risk and stay on.
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
  // Deliberately omits default-src/script-src/style-src: a nonce-based
  // script-src was tried before and broke a production-only client chunk
  // (see git history). These four directives are additive-only — they
  // don't gate scripts/styles at all, so they carry none of that risk.
  response.headers.set(
    "Content-Security-Policy",
    "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
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
