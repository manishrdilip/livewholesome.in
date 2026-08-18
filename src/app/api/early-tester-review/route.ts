import { NextResponse, type NextRequest } from "next/server";
import { earlyTesterReviewSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/server";

const MAX_REVIEW_FILES = 4;
const ALLOWED_REVIEW_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const supabase = createServiceClient();

  // Public, unauthenticated form (the link itself is the trust gate) —
  // same DB-backed limiter pattern as /api/orders and track-order.
  const { data: withinLimit } = await supabase.rpc("check_rate_limit", {
    p_key: `early-tester-review:${ip}`,
    p_max: 5,
    p_window_seconds: 60 * 60,
  });
  if (withinLimit === false) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const gender = formData.get("gender");
  const daysTried = formData.get("daysTried");
  const parsed = earlyTesterReviewSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    fullness: formData.get("fullness"),
    body: formData.get("body"),
    gender: gender ? gender : undefined,
    daysTried: daysTried ? daysTried : undefined,
    companyWebsite: formData.get("companyWebsite") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 }
    );
  }
  // Honeypot tripped — pretend success so a bot doesn't learn to skip the field.
  if (parsed.data.companyWebsite) {
    return NextResponse.json({ success: true });
  }

  const rating = Math.min(5, Math.max(1, Math.round(parsed.data.fullness / 20)));

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      source: "early_tester",
      reviewer_name: parsed.data.name,
      reviewer_contact: parsed.data.contact,
      rating,
      fullness_percent: parsed.data.fullness,
      body: parsed.data.body,
      gender: parsed.data.gender ?? null,
      days_tried: parsed.data.daysTried ?? null,
      status: "APPROVED",
    })
    .select("id")
    .single();
  if (error || !review) {
    console.error("early-tester review insert failed", error?.message);
    return NextResponse.json({ error: "Couldn't save your review. Please try again." }, { status: 500 });
  }

  const files = formData
    .getAll("media")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_REVIEW_FILES)
    .filter((f) => ALLOWED_REVIEW_MIME.has(f.type));

  const media: { type: "image" | "video"; storage_path: string }[] = [];
  for (const [i, file] of files.entries()) {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${review.id}/${i}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("reviews")
      .upload(path, file, { contentType: file.type });
    if (!uploadError) {
      media.push({ type: file.type.startsWith("video") ? "video" : "image", storage_path: path });
    }
  }
  if (media.length) {
    await supabase.from("reviews").update({ media }).eq("id", review.id);
  }

  return NextResponse.json({ success: true });
}
