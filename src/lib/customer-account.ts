import "server-only";
import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

// Links (or creates) the `customers` row for a freshly-verified auth user.
// Matches on phone (the table's unique, reliable key) so a customer who
// already checked out as a guest with this number gets their order history
// attached to the new account instead of a duplicate row.
export async function linkOrCreateCustomer(
  user: User,
  profile: { name: string; phone: string }
): Promise<CustomerRecord> {
  const supabase = createServiceClient();
  const email = user.email!;
  const phone = profile.phone;

  const { data: existing } = await supabase
    .from("customers")
    .select("id, name, email, phone")
    .eq("phone", phone)
    .maybeSingle<CustomerRecord>();

  if (existing) {
    await supabase.from("customers").update({ auth_user_id: user.id }).eq("id", existing.id);
    return existing;
  }

  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      name: profile.name,
      email,
      phone,
      auth_user_id: user.id,
    })
    .select("id, name, email, phone")
    .single<CustomerRecord>();
  if (error || !created) throw new Error(`Could not create customer record: ${error?.message}`);
  return created;
}

export async function getCustomerForUser(userId: string): Promise<CustomerRecord | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, email, phone")
    .eq("auth_user_id", userId)
    .maybeSingle<CustomerRecord>();
  return data;
}
