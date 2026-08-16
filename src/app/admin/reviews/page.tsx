import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

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

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Reviews</h1>
      <div className="mt-6 space-y-4">
        {(reviews ?? []).map((review) => {
          const media = (review.media ?? []) as ReviewMedia[];
          return (
            <div key={review.id} className="rounded-xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{review.reviewer_name}</span>{" "}
                  <span className="text-gold">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
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
              {review.status === "PENDING" && (
                <div className="mt-3 flex gap-3">
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
                </div>
              )}
            </div>
          );
        })}
        {!reviews?.length && <p className="text-sm text-ink/50">No reviews yet.</p>}
      </div>
    </div>
  );
}
