import Link from "next/link";
import type { ReactNode } from "react";

export function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← Back to shop
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-xs text-ink/50">Last updated {updated}</p>
      <div className="policy-content mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        {children}
      </div>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
