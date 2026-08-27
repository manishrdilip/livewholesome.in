import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

type ReviewMedia = { type: "image" | "video"; storage_path: string };

export default async function AdminReviewsPage() {
  const supabase = createServiceClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  async function moderate(formData: FormData) {
    "use server";
    const reviewId = formData.get("reviewId");
    const decision = formData.get("decision");
    if (typeof reviewId !== "string") return;
    if (decision !== "APPROVED" && decision !== "REJECTED") return;

    const supabase = createServiceClient();
    await supabase
      .from("reviews")
      .update({ status: decision, moderated_at: new Date().toISOString() })
      .eq("id", reviewId);
    revalidatePath("/admin/reviews");
  }

  async function logWhatsAppReview(formData: FormData) {
    "use server";
    const reviewerName = String(formData.get("reviewerName") ?? "").trim();
    const rating = Number(formData.get("rating"));
    const body = String(formData.get("body") ?? "").trim();
    const reviewerContact = String(formData.get("reviewerContact") ?? "").trim();
    if (!reviewerName || !Number.isInteger(rating) || rating < 1 || rating > 5) return;

    const supabase = createServiceClient();
    await supabase.from("reviews").insert({
      reviewer_name: reviewerName,
      rating,
      body: body || null,
      reviewer_contact: reviewerContact || null,
      source: "whatsapp",
      status: "PENDING",
    });
    revalidatePath("/admin/reviews");
  }

  async function deleteReview(formData: FormData) {
    "use server";
    const reviewId = formData.get("reviewId");
    if (typeof reviewId !== "string") return;

    const supabase = createServiceClient();
    const { data: review } = await supabase
      .from("reviews")
      .select("media")
      .eq("id", reviewId)
      .single();
    const media = (review?.media ?? []) as ReviewMedia[];
    if (media.length) {
      await supabase.storage.from("reviews").remove(media.map((m) => m.storage_path));
    }
    await supabase.from("reviews").delete().eq("id", reviewId);
    revalidatePath("/admin/reviews");
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Reviews</h1>

      <details className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <summary className="cursor-pointer font-semibold">Log a review received on WhatsApp</summary>
        <form action={logWhatsAppReview} className="mt-4 max-w-md space-y-3 text-sm">
          <label className="block">
            <span className="font-medium">Reviewer name</span>
            <input name="reviewerName" required className="input mt-1" />
          </label>
          <label className="block">
            <span className="font-medium">Rating (1–5)</span>
            <select name="rating" required defaultValue="5" className="input mt-1 w-auto">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-medium">What they said</span>
            <textarea name="body" rows={3} className="input mt-1" />
          </label>
          <label className="block">
            <span className="font-medium">Their phone (optional)</span>
            <input name="reviewerContact" className="input mt-1" />
          </label>
          <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
            Add for approval
          </button>
        </form>
      </details>

      <div className="mt-6 space-y-4">
        {(reviews ?? []).map((review) => {
          const media = (review.media ?? []) as ReviewMedia[];
          return (
            <div key={review.id} className="rounded-xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{review.reviewer_name}</span>{" "}
                  {review.source === "early_tester" ? (
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                      Early Tester · {review.fullness_percent}% full
                    </span>
                  ) : (
                    <span className="text-gold">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  )}
                  {review.source === "whatsapp" && (
                    <span className="ml-2 rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-semibold text-emerald">
                      via WhatsApp
                    </span>
                  )}
                  {review.reviewer_contact && (
                    <span className="ml-2 text-xs text-ink/40">{review.reviewer_contact}</span>
                  )}
                  {review.gender && (
                    <span className="ml-2 text-xs text-ink/40">{review.gender}</span>
                  )}
                  {review.days_tried != null && (
                    <span className="ml-2 text-xs text-ink/40">
                      tried {review.days_tried}d
                    </span>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    review.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : review.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {review.status}
                </span>
              </div>
              {review.body && <p className="mt-2 text-sm text-ink/70">{review.body}</p>}
              {!!media.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {media.map((m, i) => {
                    const url = supabase.storage.from("reviews").getPublicUrl(m.storage_path)
                      .data.publicUrl;
                    return m.type === "video" ? (
                      <video key={i} src={url} controls className="h-24 rounded-lg" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="h-24 rounded-lg object-cover" />
                    );
                  })}
                </div>
              )}
              <p className="mt-2 text-xs text-ink/50">
                {new Date(review.created_at).toLocaleString("en-IN")}
              </p>
              <div className="mt-3 flex gap-3">
                {review.status === "PENDING" && (
                  <>
                    <form action={moderate}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="decision" value="APPROVED" />
                      <button
                        type="submit"
                        className="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={moderate}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="decision" value="REJECTED" />
                      <button
                        type="submit"
                        className="rounded-full border border-red-600 px-4 py-1.5 text-sm text-red-600"
                      >
                        Reject
                      </button>
                    </form>
                  </>
                )}
                <form action={deleteReview}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <ConfirmSubmitButton
                    confirmText="Delete this review permanently? This can't be undone."
                    className="text-sm text-ink/40 hover:text-red-600"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          );
        })}
        {!reviews?.length && <p className="text-sm text-ink/50">No reviews yet.</p>}
      </div>
    </div>
  );
}
