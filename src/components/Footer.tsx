import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import type { Settings } from "@/lib/settings";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "Our Story" },
  { href: "#reviews", label: "Reviews" },
  { href: "#order", label: "Order" },
  { href: "/faq", label: "FAQ" },
];

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream transition hover:border-gold hover:text-gold"
    >
      {children}
    </a>
  );
}

export function Footer({ settings }: { settings: Settings }) {
  const hasSocial = settings.facebook_url || settings.instagram_url || settings.youtube_url;

  return (
    <footer className="bg-emerald-deep text-cream">
      <div className="mx-auto max-w-7xl px-8 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <LogoMark size={48} />
              <span className="font-serif text-3xl font-black tracking-tight">
                <span className="italic text-gold">W</span>holesome
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              Sprouted multigrain health mix — the drink of kings. Crafted in Vellore, Tamil
              Nadu.
            </p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gold">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-gold">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
              Contact Us
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              {settings.support_email && (
                <li>
                  <a
                    href={`mailto:${settings.support_email.toLowerCase()}`}
                    className="hover:text-gold"
                  >
                    {settings.support_email.toLowerCase()}
                  </a>
                </li>
              )}
              {settings.support_phone && (
                <li>
                  <a href={`tel:${settings.support_phone}`} className="hover:text-gold">
                    {settings.support_phone}
                  </a>
                </li>
              )}
            </ul>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gold">
              Legal
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              <li>
                <Link href="/terms" className="hover:text-gold">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-delivery" className="hover:text-gold">
                  Shipping and Delivery
                </Link>
              </li>
              <li>
                <Link href="/cancellation-refund" className="hover:text-gold">
                  Cancellation and Refund
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
              Begin your monthly plan
            </h3>
            <p className="mt-2 text-sm text-cream/60">
              Subscribe &amp; save {settings.subscribe_discount_percent}% on every batch.
            </p>
            <a
              href="#order"
              className="mt-3 block w-full rounded-full bg-gold py-2.5 text-center text-sm font-semibold text-emerald-deep"
            >
              Subscribe
            </a>

            {hasSocial && (
              <>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gold">
                  Join Us
                </h3>
                <div className="mt-3 flex gap-3">
                  {settings.instagram_url && (
                    <SocialIcon href={settings.instagram_url} label="Instagram">
                      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </SocialIcon>
                  )}
                  {settings.youtube_url && (
                    <SocialIcon href={settings.youtube_url} label="YouTube">
                      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                        <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
                      </svg>
                    </SocialIcon>
                  )}
                  {settings.facebook_url && (
                    <SocialIcon href={settings.facebook_url} label="Facebook">
                      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <circle cx="12" cy="12" r="9.5" />
                        <path d="M14 8.5h-1.5A1.5 1.5 0 0 0 11 10v2H9v2.5h2V19h2.5v-4.5H15l.5-2.5h-2V10c0-.3.2-.5.5-.5H15V8.5h-1z" fill="currentColor" stroke="none" />
                      </svg>
                    </SocialIcon>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} LiveWholesome.in — All Rights Reserved &middot;{" "}
            <Link href="/terms" className="hover:text-gold">
              Terms and Conditions
            </Link>{" "}
            &middot;{" "}
            <Link href="/privacy" className="hover:text-gold">
              Privacy Policy
            </Link>{" "}
            &middot;{" "}
            <Link href="/shipping-delivery" className="hover:text-gold">
              Shipping and Delivery
            </Link>{" "}
            &middot;{" "}
            <Link href="/cancellation-refund" className="hover:text-gold">
              Cancellation and Refund
            </Link>
          </p>
          {settings.fssai_license && (
            <p className="mt-3">FSSAI Licensed &middot; {settings.fssai_license}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
