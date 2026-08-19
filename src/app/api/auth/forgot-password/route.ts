import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// The customer-facing "Forgot password?" flow must never be able to trigger
// (or confirm the existence of) a password reset for an admin account.
// Supabase Auth has a single users table — our ADMIN_EMAILS allowlist is
// only an app-level authorization check, not a separate account type — so
// without this guard, resetting an admin's password via the public /login
// page and this route's shared underlying Supabase call would grant a live
// admin session in whatever browser completes it. Admin password resets
// stay on the dedicated /admin/login flow only.
//
// The response is identical whether the email is an admin account, a real
// customer, or doesn't exist at all, so this can't be used to enumerate
// which addresses have accounts.
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const supabase = createServiceClient();

  // Same DB-backed limiter pattern as /api/orders — without it this route
  // could be hammered to spam arbitrary email addresses with reset emails.
  const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
    "check_rate_limit",
    { p_key: `forgot-password:${ip}`, p_max: 5, p_window_seconds: 60 * 60 }
  );
  if (rateLimitError) {
    console.error("check_rate_limit failed", rateLimitError.message);
  } else if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body as { email?: unknown }).email;
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  if (!ADMIN_EMAILS.includes(normalizedEmail)) {
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: "https://livewholesome.in/auth/callback?next=/reset-password",
    });
    if (error) {
      console.error("resetPasswordForEmail failed", error.message);
    }
  }

  return NextResponse.json({ ok: true });
}
