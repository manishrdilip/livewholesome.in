import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { getCustomerForUser } from "@/lib/customer-account";
import { AccountSignOutButton } from "@/components/account/SignOutButton";
import { AddAddressForm } from "@/components/account/AddAddressForm";
import { reviewSchema } from "@/lib/validation";

const MAX_ADDRESSES = 3;
const MAX_REVIEW_FILES = 4;
const ALLOWED_REVIEW_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export default async function AccountPage() {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const customer = await getCustomerForUser(user.id);
  if (!customer) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-ink/70">
          We couldn&apos;t find your account details. Please contact support.
        </p>
      </div>
    );
  }

  const service = createServiceClient();
  const [{ data: addresses }, { data: orders }, { data: reviews }] = await Promise.all([
    service
      .from("saved_addresses")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at"),
    service
      .from("orders")
      .select("order_number, status, grand_total, placed_at")
      .eq("customer_id", customer.id)
      .order("placed_at", { ascending: false }),
    service
      .from("reviews")
      .select("id, rating, body, status, created_at")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false }),
  ]);

  async function deleteAddress(formData: FormData) {
    "use server";
    const addressId = formData.get("addressId");
    if (typeof addressId !== "string") return;

    const supabase = await createServerAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const customer = await getCustomerForUser(user.id);
    if (!customer) return;

    const service = createServiceClient();
    // Scoped by customer_id, not just id — a customer can only ever delete their own row.
    await service
      .from("saved_addresses")
      .delete()
      .eq("id", addressId)
      .eq("customer_id", customer.id);
    revalidatePath("/account");
  }

  async function submitReview(formData: FormData) {
    "use server";
    const parsed = reviewSchema.safeParse({
      rating: formData.get("rating"),
      body: formData.get("body") ?? "",
    });
    if (!parsed.success) return;

    const supabase = await createServerAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const customer = await getCustomerForUser(user.id);
    if (!customer) return;

    const files = formData
      .getAll("media")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_REVIEW_FILES)
      .filter((f) => ALLOWED_REVIEW_MIME.has(f.type));

    const service = createServiceClient();
    const { data: review, error } = await service
      .from("reviews")
      .insert({
        customer_id: customer.id,
        reviewer_name: customer.name,
        rating: parsed.data.rating,
        body: parsed.data.body || null,
      })
      .select("id")
      .single();
    if (error || !review) return;

    const media: { type: "image" | "video"; storage_path: string }[] = [];
    for (const [i, file] of files.entries()) {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${review.id}/${i}-${Date.now()}.${ext}`;
      const { error: uploadError } = await service.storage
        .from("reviews")
        .upload(path, file, { contentType: file.type });
      if (!uploadError) {
        media.push({ type: file.type.startsWith("video") ? "video" : "image", storage_path: path });
      }
    }

    if (media.length) {
      await service.from("reviews").update({ media }).eq("id", review.id);
    }
    revalidatePath("/account");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">My Account</h1>
          <p className="text-sm text-ink/60">
            {customer.name} · {customer.email}
          </p>
        </div>
        <AccountSignOutButton />
      </div>

      <section className="mt-8 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Saved addresses</h2>
        <p className="text-sm text-ink/50">Up to {MAX_ADDRESSES} addresses.</p>
        <ul className="mt-3 space-y-3">
          {addresses?.map((a) => (
            <li key={a.id} className="flex items-start justify-between rounded-lg border border-ink/10 p-3 text-sm">
              <div>
                {a.label && <div className="font-medium">{a.label}</div>}
                <div className="text-ink/70">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  {a.landmark ? `, ${a.landmark}` : ""}
                  <br />
                  {a.city}, {a.state} — {a.pincode}
                </div>
                {a.latitude && a.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald hover:underline"
                  >
                    📍 View pinned location
                  </a>
                )}
              </div>
              <form action={deleteAddress}>
                <input type="hidden" name="addressId" value={a.id} />
                <button type="submit" className="text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {!addresses?.length && <p className="text-sm text-ink/50">No saved addresses yet.</p>}
        </ul>

        {(addresses?.length ?? 0) < MAX_ADDRESSES && <AddAddressForm />}
      </section>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Order history</h2>
        <ul className="mt-2 divide-y divide-ink/10 text-sm">
          {orders?.map((o) => (
            <li key={o.order_number} className="flex justify-between py-2">
              <span>
                {o.order_number} — {new Date(o.placed_at).toLocaleDateString("en-IN")}
              </span>
              <span className="text-ink/50">
                {o.status} · ₹{o.grand_total}
              </span>
            </li>
          ))}
          {!orders?.length && <p className="text-sm text-ink/50">No orders yet.</p>}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Write a review</h2>
        <form action={submitReview} className="mt-3 space-y-3 text-sm">
          <div>
            <label className="text-ink/60">Rating</label>
            <select name="rating" required defaultValue="5" className="input">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <textarea name="body" placeholder="Tell us what you think" className="input" rows={3} />
          <div>
            <label className="text-ink/60">
              Photos or videos (optional, up to {MAX_REVIEW_FILES})
            </label>
            <input type="file" name="media" accept="image/*,video/*" multiple className="input" />
          </div>
          <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
            Submit review
          </button>
          <p className="text-xs text-ink/50">
            Reviews are checked before they appear publicly on the site.
          </p>
        </form>

        {!!reviews?.length && (
          <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
            {reviews.map((r) => (
              <li key={r.id} className="text-sm">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)} — <span className="text-ink/50">{r.status}</span>
                {r.body && <p className="text-ink/70">{r.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/" className="mt-8 inline-block text-emerald hover:underline">
        ← Back to shop
      </Link>
    </div>
  );
}
