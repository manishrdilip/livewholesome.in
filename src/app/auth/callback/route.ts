import { NextResponse, type NextRequest } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { linkOrCreateCustomer } from "@/lib/customer-account";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Shared by both auth flows: admin magic-link sign-in, and a customer
// clicking the "Confirm your email" link Supabase sends on signup (Supabase's
// default templates can't show a typed OTP code without custom SMTP, so the
// emailed link is the working path until that's configured — see /verify for
// the code-entry flow that's ready for when it is).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerAuthClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data?.user;

    if (user) {
      const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
      const phone =
        typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;
      if (name && phone) {
        await linkOrCreateCustomer(user, { name, phone }).catch((err) =>
          console.error("linkOrCreateCustomer failed in auth callback", err)
        );
      }

      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}/account`);
    }
  }

  return NextResponse.redirect(`${origin}/admin`);
}
