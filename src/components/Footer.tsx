import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { T } from "@/components/T";
import type { Settings } from "@/lib/settings";

const QUICK_LINKS = [
  { href: "/", label: "Home", labelTa: "முகப்பு" },
  { href: "/ingredients", label: "Ingredients", labelTa: "பொருட்கள்" },
  { href: "/about", label: "Our Story", labelTa: "எங்கள் கதை" },
  { href: "#reviews", label: "Reviews", labelTa: "விமர்சனங்கள்" },
  { href: "#order", label: "Order", labelTa: "ஆர்டர்" },
  { href: "/faq", label: "FAQ", labelTa: "கேள்விகள்" },
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
              <T
                en="Sprouted multigrain health mix — the drink of kings. Crafted in Vellore, Tamil Nadu."
                ta="முளைகட்டிய பல தானிய ஹெல்த் மிக்ஸ் — அரசர்களின் பானம். வேலூர், தமிழ்நாட்டில் தயாரிக்கப்படுகிறது."
              />
            </p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-cream">
              <T en="Quick Links" ta="விரைவு இணைப்புகள்" />
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-gold">
                    <T en={link.label} ta={link.labelTa} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cream">
              <T en="Contact Us" ta="தொடர்பு கொள்ள" />
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
              {settings.registered_address && (
                <li className="text-cream/60">{settings.registered_address}</li>
              )}
            </ul>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-cream">
              <T en="Legal" ta="சட்டப்பூர்வ" />
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              <li>
                <Link href="/terms" className="hover:text-gold">
                  <T en="Terms and Conditions" ta="விதிமுறைகள் மற்றும் நிபந்தனைகள்" />
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold">
                  <T en="Privacy Policy" ta="தனியுரிமைக் கொள்கை" />
                </Link>
              </li>
              <li>
                <Link href="/shipping-delivery" className="hover:text-gold">
                  <T en="Shipping and Delivery" ta="ஷிப்பிங் மற்றும் டெலிவரி" />
                </Link>
              </li>
              <li>
                <Link href="/cancellation-refund" className="hover:text-gold">
                  <T en="Cancellation and Refund" ta="ரத்து மற்றும் பணத்திரும்பல்" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-cream">
              <T en="Begin your monthly plan" ta="மாத திட்டத்தை தொடங்குங்கள்" />
            </h3>
            <p className="mt-2 text-sm text-cream/60">
              <T
                en={`Subscribe & save ${settings.subscribe_discount_percent}% on every batch.`}
                ta={`சந்தா செய்து ஒவ்வொரு பேட்சிலும் ${settings.subscribe_discount_percent}% சேமிக்கவும்.`}
              />
            </p>
            <a
              href="#order"
              className="mt-3 block w-full rounded-full bg-gold py-2.5 text-center text-sm font-semibold text-ink"
            >
              <T en="Subscribe" ta="சந்தா செய்ய" />
            </a>

            {hasSocial && (
              <>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-cream">
                  <T en="Join Us" ta="எங்களுடன் இணையுங்கள்" />
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

        <div className="mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/70">
          <p>
            © {new Date().getFullYear()} LiveWholesome.in — <T en="All Rights Reserved" ta="அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை" />{" "}
            &middot;{" "}
            <Link href="/terms" className="hover:text-gold">
              <T en="Terms and Conditions" ta="விதிமுறைகள் மற்றும் நிபந்தனைகள்" />
            </Link>{" "}
            &middot;{" "}
            <Link href="/privacy" className="hover:text-gold">
              <T en="Privacy Policy" ta="தனியுரிமைக் கொள்கை" />
            </Link>{" "}
            &middot;{" "}
            <Link href="/shipping-delivery" className="hover:text-gold">
              <T en="Shipping and Delivery" ta="ஷிப்பிங் மற்றும் டெலிவரி" />
            </Link>{" "}
            &middot;{" "}
            <Link href="/cancellation-refund" className="hover:text-gold">
              <T en="Cancellation and Refund" ta="ரத்து மற்றும் பணத்திரும்பல்" />
            </Link>
          </p>
          {settings.fssai_license && (
            <p className="mt-3">
              <T en="FSSAI Licensed" ta="FSSAI உரிமம் பெற்றது" /> &middot; {settings.fssai_license}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
