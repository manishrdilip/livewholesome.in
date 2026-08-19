import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Applied to every response. A nonce-based CSP script-src has been tried
// twice now (see git history) and reverted both times after it broke
// hydration in production — most recently confirmed directly: even with
// 'strict-dynamic', Next.js/Turbopack's own dynamically-created <script>
// chunks aren't reliably honored by the browser's nonce check (nonces set
// via JS after element creation aren't always treated the same as
// parse-time nonces), and several of Next's own inline RSC-streaming
// scripts ship with no nonce at all — so React never hydrates at all under
// a strict script-src on this Next.js version. Needs a deeper framework-
// level fix (or a Next.js upgrade that resolves it) before trying again —
// not a middleware-only change. The other headers below carry no such risk
// and stay on.
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
  // Deliberately omits default-src/script-src/style-src — see comment above.
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
