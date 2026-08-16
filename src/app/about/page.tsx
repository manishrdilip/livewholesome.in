import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | Wholesome Purna",
  description:
    "How a mother's kitchen in Vellore, started in 2004 to feed her own children, grew into Wholesome Purna.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← Back to shop
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">Our Story</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">A Mother&apos;s Kitchen</h1>
      <p className="mt-3 text-ink/70">பூர்ணா — Complete. Whole. Full.</p>

      <div className="mt-8 space-y-6 text-ink/80">
        <p>
          Wholesome Purna didn&apos;t start as a business. It started in 2004, in a kitchen in
          Vellore, with a mother soaking and sprouting grains to feed her own children — the same
          twenty ingredients, soaked, germinated, sun-dried, roasted, and stone-ground by hand,
          long before it had a name or a label.
        </p>
        <p>
          Neighbours noticed. What she made for her own family, she began making for a few more —
          then a few more after that. For years, Purna stayed exactly that size: a small kitchen,
          serving the local community in Vellore, one batch at a time.
        </p>
        <p>
          Today, her son is helping take that same recipe further — building the systems, the
          website, the order tracking, so more people outside Vellore can get what used to be
          available only to neighbours and family. The kitchen hasn&apos;t changed. The process
          hasn&apos;t changed. We&apos;re just now able to ship it to your door.
        </p>
        <p>
          We&apos;re honest about where we are: we&apos;re still small, and we deliberately cap
          how much we make each day rather than cut corners to meet demand we can&apos;t yet
          handle well. As we grow, that daily capacity will grow too — carefully, batch by batch,
          the same way it has since 2004.
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-emerald-deep px-6 py-10 text-center text-cream">
        <h2 className="font-serif text-2xl font-bold">Taste What Started It All</h2>
        <Link
          href="/#order"
          className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-emerald-deep"
        >
          Order Now
        </Link>
      </div>
    </div>
  );
}
