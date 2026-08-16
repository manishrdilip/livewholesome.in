import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

type ReviewMedia = { type: "image" | "video"; storage_path: string };

export async function ReviewsSection() {
  const supabase = createServiceClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, body, media, created_at")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(9);

  return (
    <section id="reviews" className="scroll-mt-20 bg-emerald-deep/5 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">Reviews</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">What customers are saying</h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          Real feedback from people who&apos;ve tried Wholesome Purna.{" "}
          <Link href="/account" className="text-emerald hover:underline">
            Write a review
          </Link>{" "}
          after logging in.
        </p>

        {reviews?.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => {
              const media = (review.media ?? []) as ReviewMedia[];
              return (
                <div key={review.id} className="rounded-2xl bg-white p-5">
                  <div className="text-gold">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  {review.body && <p className="mt-2 text-sm text-ink/70">{review.body}</p>}
                  {!!media.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {media.map((m, i) => {
                        const url = supabase.storage.from("reviews").getPublicUrl(m.storage_path)
                          .data.publicUrl;
                        return m.type === "video" ? (
                          <video key={i} src={url} controls className="h-20 rounded-lg" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={url}
                            alt={`Photo shared by ${review.reviewer_name}`}
                            className="h-20 rounded-lg object-cover"
                          />
                        );
                      })}
                    </div>
                  )}
                  <p className="mt-3 text-xs font-medium text-ink/50">{review.reviewer_name}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink/50">No reviews yet — be the first to write one.</p>
        )}
      </div>
    </section>
  );
}
