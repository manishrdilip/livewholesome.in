import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware-client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !isAdminPublicRoute) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      // Signed in, but as the wrong account — send them back to the login
      // form (with an explanatory message) instead of a dead-end 403, so
      // they can sign in again as the admin account.
      return NextResponse.redirect(new URL("/admin/login?error=not_admin", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/account")) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/api/admin/:path*"],
};
