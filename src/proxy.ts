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

  if (pathname.startsWith("/admin") && !isAdminPublicRoute) {
    const { supabase, response } = createMiddlewareClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return new NextResponse("Forbidden", { status: 403 });
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
  matcher: ["/admin/:path*", "/account/:path*"],
};
