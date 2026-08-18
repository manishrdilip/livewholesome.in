import Link from "next/link";
import { T } from "@/components/T";
import { HumanFillFigure } from "@/components/HumanFillFigure";
import { createServiceClient } from "@/lib/supabase/server";

type ReviewMedia = { type: "image" | "video"; storage_path: string };

export async function ReviewsSection() {
  const supabase = createServiceClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, body, media, source, fullness_percent, days_tried, created_at")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(9);

  return (
    <section id="reviews" className="scroll-mt-20 bg-emerald-deep/5 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">
          <T en="Reviews" ta="விமர்சனங்கள்" />
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          <T en="What customers are saying" ta="வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்" />
        </h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          <T en="Real feedback from people who've tried Wholesome Purna." ta="Wholesome Purna-வை முயற்சித்தவர்களின் உண்மையான கருத்துகள்." />{" "}
          <Link href="/account" className="text-emerald hover:underline">
            <T en="Write a review" ta="ஒரு விமர்சனம் எழுத" />
          </Link>{" "}
          <T en="after logging in." ta="உள்நுழைந்த பிறகு." />
        </p>

        {reviews?.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => {
              const media = (review.media ?? []) as ReviewMedia[];
              const isEarlyTester = review.source === "early_tester" && review.fullness_percent != null;
              return (
                <div key={review.id} className="rounded-2xl bg-white p-5">
                  {isEarlyTester ? (
                    <div className="flex items-center gap-3">
                      <HumanFillFigure percent={review.fullness_percent!} className="h-9 w-9 shrink-0 text-emerald" />
                      <div>
                        <div className="text-sm font-semibold text-emerald">{review.fullness_percent}%</div>
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                          <T en="Early Tester" ta="ஆரம்ப சோதனையாளர்" />
                        </span>
                      </div>
                      {review.days_tried != null && (
                        <span className="ml-auto text-xs text-ink/50">
                          <T
                            en={`Tried for ${review.days_tried} day${review.days_tried === 1 ? "" : "s"}`}
                            ta={`${review.days_tried} நாட்கள் முயற்சி`}
                          />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-gold">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  )}
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
          <p className="mt-8 text-sm text-ink/50">
            <T en="No reviews yet — be the first to write one." ta="இன்னும் விமர்சனங்கள் இல்லை — முதலில் நீங்கள் எழுதுங்கள்." />
          </p>
        )}
      </div>
    </section>
  );
}
