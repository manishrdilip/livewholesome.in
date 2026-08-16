import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { getCustomerForUser } from "@/lib/customer-account";
import { savedAddressSchema } from "@/lib/validation";

const MAX_ADDRESSES = 3;

export async function POST(request: Request) {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const customer = await getCustomerForUser(user.id);
  if (!customer) return NextResponse.json({ error: "No customer account found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = savedAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const service = createServiceClient();
  const { count } = await service
    .from("saved_addresses")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customer.id);
  if ((count ?? 0) >= MAX_ADDRESSES) {
    return NextResponse.json(
      { error: `You can only save up to ${MAX_ADDRESSES} addresses` },
      { status: 400 }
    );
  }

  const { error } = await service.from("saved_addresses").insert({
    customer_id: customer.id,
    label: parsed.data.label || null,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    landmark: parsed.data.landmark || null,
    city: parsed.data.city,
    state: parsed.data.state,
    pincode: parsed.data.pincode,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}
