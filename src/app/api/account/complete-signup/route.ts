import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { linkOrCreateCustomer } from "@/lib/customer-account";

// Called right after OTP verification, once the browser client has a
// session. Reads that session from cookies server-side rather than trusting
// any client-supplied identity, then links/creates the customer row from the
// name+phone stashed in user_metadata at signup.
export async function POST() {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const name = typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
  if (!name || !phone) {
    return NextResponse.json({ error: "Missing signup profile data" }, { status: 400 });
  }

  await linkOrCreateCustomer(user, { name, phone });
  return NextResponse.json({ ok: true });
}
