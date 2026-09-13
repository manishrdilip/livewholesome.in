# Wholesome Purna — CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Keep this file current.** Whenever a change adds a new feature, path, table, or convention — not just a bug fix — update the relevant section of this file as part of that same change, before considering the task done. Stale docs here are worse than no docs, since future sessions trust this file over rediscovering the codebase.

## What this is

**Wholesome Purna** (livewholesome.in) — an e-commerce site for a sprouted-multigrain health mix, run by a small family business (Vellore, Tamil Nadu). Next.js 16 (App Router) + TypeScript + Supabase (Postgres/Auth/Storage) + Tailwind v4, deployed on Vercel with auto-deploy on push to `main`.

@AGENTS.md

## Commands

```bash
npm run dev      # local dev server, http://localhost:3000
npm run build    # production build — run before shipping any change
npx tsc --noEmit -p tsconfig.json   # type-check (no separate "typecheck" script)
npx eslint <files>                  # lint (or bare `npm run lint` for everything)
```

There is no test suite (no test script in `package.json`, no test files) — correctness is verified via `tsc` + `eslint` + `npm run build` + manual verification in a browser (local dev server, then the live site after deploy).

**Path alias**: `@/*` → `./src/*`.

## Database migrations — not automated

SQL files in `supabase/migrations/*.sql` are numbered sequentially (`0001_...` → `0013_...` and up) but **nothing applies them automatically**. There is no CI/CD migration runner. After writing a migration file, it must be manually pasted into the Supabase SQL Editor (dashboard → SQL Editor → run) against the production database before the corresponding code will work. Always write the migration file first (so it's in git history), then run it by hand.

## Deploy flow

`git push origin main` → Vercel auto-deploys (~60–75s). There's no staging environment — pushing to `main` ships to the live site directly. Standard sequence for a change: build clean locally → commit → push → wait for deploy → verify on the live URL.

## Claude: ship every site change all the way to production

Dilip doesn't run terminal or git commands himself — when he asks for a change to the site, the job isn't done until the code is committed to `main`, any migration has actually been run against production Supabase, Vercel has deployed it, and the live site has been checked to confirm it. Don't stop at "here's a patch file" or "here's the SQL, please run it" — those are handoffs, not completions, and he has no way to act on them himself.

If this session's `git push` to this repo is blocked (a Cowork git-proxy restriction that's independent of GitHub-side permissions and has recurred across sessions), commit directly through GitHub's web file editor instead, driven by browser automation (`https://github.com/manishrdilip/livewholesome.in/edit/main/<path>`):
- Full-file replacement: click into the CodeMirror editor, `ctrl+a` → `Delete` → verify the editor actually went empty (a combined select-and-paste can silently no-op), then paste (OS-level clipboard paste beats simulated typing for anything more than a line or two) and check the *start, middle, and end* of the result — a single line can silently vanish from the middle of a large paste with no error shown.
- Small, targeted edit: it's more reliable to click straight to the insertion point and type the new text directly than to paste the whole file.
- Verify what actually landed via `https://raw.githubusercontent.com/manishrdilip/livewholesome.in/main/<path>` before moving on to the next file — GitHub's own blob/edit view can render stale cached content immediately after a commit.
- Put the commit message in the "Commit message" field and the required attribution trailers in "Extended description".

For a migration, run the SQL directly against the production project in the Supabase SQL Editor (one statement at a time if its autocomplete starts swallowing newlines), with a `SELECT` before and after to confirm the actual state — don't hand back a `.sql` file as the deliverable.

After deploying, confirm on the live site itself — a plain fetch of the production URL works and needs no browser/device connection, which matters because Vercel's own dashboard needs the browser bridge and that connection can drop mid-task.

## Repository & hosting

- **GitHub**: https://github.com/manishrdilip/livewholesome.in — `main` is the deploy branch (see Deploy flow above).
- **Vercel**: auto-deploys `main` to the production domain `livewholesome.in` (see `CNAME`). Project settings, environment variables, and domain config live in the Vercel dashboard, not in this repo.
- **Supabase**: one project provides Postgres + Auth + Storage for both local dev and production — there is no separate local/staging database (see Verification workflow at the bottom of this file). Connection details (`NEXT_PUBLIC_SUPABASE_URL`, anon key, service-role key) live in `.env.local` (gitignored) and in Vercel's env vars, not committed here since the service-role key is a secret.

## Access control (`src/proxy.ts`)

Global middleware, not per-route guards:
- `/api/admin/*` — requires a Supabase session whose email is in the `ADMIN_EMAILS` env var (comma-separated); otherwise 401 JSON.
- `/admin/*` (except `/admin/login`, `/admin/reset-password`) — same admin-email check; redirects to `/admin/login` if unauthenticated, or back with `?error=not_admin` if logged in as the wrong account.
- `/account/*` — requires any authenticated Supabase session.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are applied to every response here. `script-src` is a host allowlist (`'self' 'unsafe-inline'` + the exact external origins the app loads scripts from — Cashfree, Razorpay's checkout.js *and* its `cdn.razorpay.com` risk-detection bundle, GA4), deliberately *not* nonce-based — a nonce-based `script-src` was tried twice and reverted both times because Next.js/Turbopack's own dynamically-created and RSC-streaming `<script>` chunks aren't reliably nonce-compliant, breaking hydration in production in a way that didn't reproduce in dev. `style-src`/`default-src` are still omitted. See the comment in `proxy.ts` before re-attempting a nonce policy, and when adding a new external script origin, check whether it also loads secondary scripts from a *different* origin at runtime (as Razorpay's checkout.js does) — a silently CSP-blocked secondary script won't throw where the customer can see it, only in devtools.

## Data layer

Every Supabase table has RLS **enabled with zero policies** — this is intentional, not incomplete. Nothing is reachable via the anon/authenticated client keys. All reads/writes go through server-side code using `createServiceClient()` (`src/lib/supabase/server.ts`, service-role key), which bypasses RLS and manually scopes every query to the right customer/order. Never add RLS policies as a way to let client code query directly — keep the service-role-only pattern.

Key tables (see `supabase/migrations/0001_init.sql` for the full initial schema): `customers`, `addresses`, `orders` (+ `order_items`, `order_events`, `invoices`, `shipments`, `notifications` — all `on delete cascade` from `orders`), `settings` (single-row table, admin-configurable business config — price overrides, GST, shipping fee, daily order cap, social links; read via `src/lib/settings.ts`), `reviews`, `rate_limits`.

Order creation goes through the `create_order()` Postgres function (`0002_create_order_fn.sql`, extended by `0011_daily_order_cap.sql`) rather than a plain insert — it atomically checks the admin-configured daily unit cap and creates the order in one transaction, which matters because this runs on Vercel's serverless functions (no shared in-memory state across instances). The same reasoning applies to `check_rate_limit()` (`0008_rate_limits.sql`), a DB-backed rate limiter reused by every public unauthenticated endpoint (`/api/orders`, `/api/support/track-order`, `/api/early-tester-review`) instead of an in-memory counter.

## i18n (English/Tamil)

Site-wide bilingual toggle, not a routing-based i18n setup:
- `src/components/LanguageProvider.tsx` + `src/lib/language-storage.ts` — React context backed by `localStorage` via `useSyncExternalStore` (mirrors the same pattern `CartProvider`/`src/lib/cart.ts` uses for cart state, specifically to avoid the `react-hooks/set-state-in-effect` lint error).
- `<T en="..." ta="..." />` (`src/components/T.tsx`) — a client-boundary leaf component usable directly inside server components for static bilingual strings.
- Client components that need the current language for logic (not just static text) call `useLanguage()` directly and branch on `lang === "ta"`.

## Reviews — three independent paths

1. **Customer reviews** (`src/app/account/page.tsx`) — logged-in customers only, star rating (1–5), goes into `PENDING` status and needs admin approval on `/admin/reviews` before showing on the homepage.
2. **Early-tester reviews** (`/early-tester`, `src/components/EarlyTesterForm.tsx` → `/api/early-tester-review`) — a public, unauthenticated, unlisted page (not linked in nav, `noindex`) for people given free samples outside the order flow. No login, just name + phone/email. Rated via a "fullness" slider (0–100%) rendered through `HumanFillFigure` instead of stars — ties back to the brand tagline ("Complete. Whole. Full."). Publishes instantly (`status: 'APPROVED'` on insert, no moderation queue) since the unlisted link itself is the trust gate; admin can still delete after the fact. Distinguished from customer reviews by a `source` column and an "Early Tester" badge on `ReviewsSection`.
3. **WhatsApp-relayed reviews** — a customer sends a review over WhatsApp chat instead of using the site; admin types it into "Log a review received on WhatsApp" on `/admin/reviews` (`src/app/admin/reviews/page.tsx`), which inserts with `source: 'whatsapp'` and goes into the normal `PENDING` moderation queue like a customer review. Shows a "via WhatsApp" badge on `ReviewsSection` once approved. `source` is constrained by `supabase/migrations/0017_whatsapp_review_source.sql` (`customer` | `early_tester` | `whatsapp`).

All three share the same `reviews` table and the same Supabase Storage bucket (`reviews`) for photo/video attachments.

## Product Costing (`/admin/costing`)

Internal cost/profit tracking, unrelated to the customer-facing site. "1 unit" is always **1 finished pouch** (`PRODUCT.weightGrams` = 500g). All math lives in `src/lib/costing.ts` (pure functions, reused by every tab and the summary) — don't duplicate the formulas inline in the page. Every tab (including Raw Material) renders as an HTML `<table>` with a totals row; row editing happens through `src/components/admin/EditPopup.tsx`, a `<dialog>`-based popup (the only modal pattern in the admin — reuse it rather than inventing another) wrapping the same upsert server action used for both "Edit" and "+ Add".

- **`raw_materials`** table — one row per ingredient (seeded with the 20 real ingredients from `src/lib/content.ts` `INGREDIENTS`). Admin sets a price for a given weight (e.g. "₹180 per 1kg") and `usage_per_packet_grams` — how many grams of it go into **one finished packet** (not per kg of product — renamed/simplified in `0019_cost_tracking_expansion.sql`). Formula: `pricePerKg = price / weightInKg`, then `costPerPouch = pricePerKg * (usage_per_packet_grams/1000)`. The seeded `usage_per_packet_grams` values are estimates to make the tool usable immediately, not the verified real recipe — flagged as such in the UI, editable via the same popup as price.
- **`cost_items`** table — one homogeneous table (via a `category` column) for the other seven cost categories: machine, packing, ads, website, courier, labour, testing. Formula: `costPerPouch = amount * (1 + tax_percent/100) / allocation_quantity`, where `allocation_quantity` is however many pouches the amount should be spread over (a machine's expected lifetime output, a month's pouch volume for ads/labour/website, or `1` if the amount is already a per-pouch cost like packing). Seeded with real machines (Dryer, Roasting Machine, Pulverizer, Packing Machine, Expiry Date Printer, Packing Label Printer 4×6), packing consumables (Pouch, O2 Absorber Packet, Courier Box, Tape), ad platforms, courier options, and lab tests — see `0019_cost_tracking_expansion.sql`.
  - **Courier is the one category where rows are alternatives, not additive** — three couriers are seeded side by side for comparison (with researched market rates and delivery-speed notes) but only one (`Delhivery`) defaults `is_active = true`; the other two are `false` so the Summary doesn't triple-count shipping. If you change which courier you actually ship with, flip `is_active` accordingly rather than leaving more than one on.
- The Summary tab (`getCostSummary()`) sums raw-material cost + all seven category totals into a total cost/pouch, compares it against the selling price (`settings.product_price ?? PRODUCT.unitPrice`) to show profit/margin per pouch, and shows `suggestedPriceForMargin()` — the price needed to hit 30/40/50% margin at the current cost.
- Both tables are `id uuid default gen_random_uuid()` + RLS-enabled-zero-policies, matching every other table (see Data layer above) — `supabase/migrations/0018_cost_tracking.sql` + `0019_cost_tracking_expansion.sql`.
- **Nothing keeps `raw_materials.name` and `src/lib/content.ts` `INGREDIENTS` in sync automatically** — they're two independent copies of the same 20-ingredient list. When a formula ingredient changes (e.g. the Palmyra Palm Candy → Date Sugar sweetener pivot, `0020_date_sugar_and_gst.sql`), update both in the same change: the `content.ts` entry (name, icon, Tamil name, nutrition copy) and a migration renaming the matching `raw_materials` row — a plain rename, not a delete+insert, so the admin's entered price/usage isn't lost (though a changed ingredient usually does need its price re-entered).

## Shipping label print size

The shipping label (`src/components/admin/ShippingLabelCard.tsx`, printed from `/admin/orders/[orderNumber]/label` and `/admin/orders/labels-bulk` via `PrintButton`'s `window.print()`) prints at the standard courier label size, `@page { size: 4in 6in; margin: 0.2in; }` in `src/app/globals.css`. That's the only print-styled flow in the app, so the `@page` rule is global rather than scoped. If another print flow is added later, scope it (e.g. CSS named pages) instead of changing this rule.

## WhatsApp

- **Support number**: `settings.support_phone` (admin-editable at `/admin/settings`) is the single source of truth — it drives the floating support widget's WhatsApp button (`src/components/support/SupportWidget.tsx`), the FAQ page's "Chat on WhatsApp" button, the footer `tel:` link, and the "Order via WhatsApp instead" button in `OrderBox`. `src/lib/whatsapp.ts` (`buildWhatsAppLink`) builds the `wa.me` deep link from it.
- **`/order`** (`src/app/order/page.tsx`) — a standalone, marketing-free order page meant to be handed out as one clean link (e.g. pasted into the WhatsApp Business app's profile "Website" field, or a social bio), as opposed to the full homepage.
- **Admin-side manual relay**: "+ Log WhatsApp order" on `/admin` (`src/app/admin/orders/new/page.tsx`) and the `POST /api/webhooks/izap` webhook (next bullet) both call the same `src/lib/orders/createWhatsAppOrder()` — real `create_order()` RPC (same daily cap, invoice, confirmation email, shipping pipeline) plus a real Razorpay payment link (`createRazorpayPaymentLink()` in `src/lib/payment/razorpay.ts`, distinct from the Orders API used by live checkout — this one returns a shareable `short_url` since there's no live checkout session to open). The order's `internal_note` records which path created it. "Log a review received on WhatsApp" on `/admin/reviews` does the equivalent for reviews by hand.
- **`POST /api/webhooks/izap`** (`src/app/api/webhooks/izap/route.ts`) — bearer-authenticated (`IZAP_WEBHOOK_SECRET`, must be set in Vercel's env too, and given to whatever calls this endpoint as the `Authorization: Bearer` value) webhook that lets an external system (the iZap WhatsApp AI assistant, if it supports calling a webhook when it finishes collecting an order/review in chat — not confirmed as of this writing, since iZap's own dashboard for that isn't visible from this codebase) create a **real** order (via `createWhatsAppOrder()` — real order number, invoice, payment link) or queue a **real** review (`reviews` table, `source: 'whatsapp'`, `status: 'PENDING'`, same moderation queue as every other review) from `{ type: "order" | "review", data: {...} }`. Deliberately never lets a caller supply a price, order number, or payment link directly — those only ever come from the real pipeline. This is the receiving half of automation; nothing in this codebase makes iZap (or anything else) call it yet.
- **WhatsApp Cloud API is not wired up.** `.env.local` has placeholder vars (`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_API_VERSION`) from earlier planning, but they're empty and no code reads them. A phone number's Meta webhook subscription can only be owned by one system at a time — since iZap already owns the connected number's webhook (that's how its AI reads/replies to messages), wiring these vars up directly would mean disconnecting iZap for that number, not running alongside it.
- **`POST /api/webhooks/razorpay`** (`src/app/api/webhooks/razorpay/route.ts`, signature-verified via `RAZORPAY_WEBHOOK_SECRET` / `verifyRazorpayWebhookSignature()`) — the only thing that flips a WhatsApp order's `payment_status` to `PAID` once its Razorpay Payment Link is actually paid. A Payment Link never round-trips through the checkout page, so `razorpay/verify`'s client-driven flow (used by real Standard Checkout) never fires for it; this webhook is Payment Links' equivalent of that. Must be registered in Razorpay Dashboard → Settings → Webhooks pointing at this URL (events: `payment_link.paid`, `payment_link.cancelled`, `payment.captured`, `payment.failed`) — not automatic just because the route exists in code.
- **Review content flags** (`src/lib/reviewModeration.ts`, `detectReviewFlags()`) — regex-based check for phone numbers, emails, payment/account-detail keywords, and a short profanity list, run on WhatsApp-relayed reviews (both `/admin/reviews`' manual "Log a WhatsApp review" and the `izap` webhook's review path) and stored as a prefix on `moderated_note`, shown as a warning banner on the admin review card. Never auto-rejects — every review still needs manual approval regardless — this only makes the *why to look closer* visible before an admin approves one.

## Brand constraints (non-negotiable — from explicit user instruction)

- **5-colour palette only**, defined in `src/app/globals.css` (`--emerald #2d5a2d`, `--emerald-deep #1a3a1a`, `--gold #a67c00`, `--cream #f8f2e3`, `--ink #1c1a14`). Don't introduce other colors into site UI.
- **Never change the logo** (`src/components/LogoMark.tsx`) or the core tagline "பூர்ணா — Complete. Whole. Full."
- Preserve the Tamil-English bilingual identity across any new page/feature — new user-facing strings need both languages via `<T>` or `lang ===`.
- Avoid decorative emoji in the storefront UI (a whole pass was done to remove these); the admin dashboard is the one place plain glyphs/pins are acceptable since it's an internal tool, not customer-facing.

## Business identity (for outbound correspondence and GST-facing documents)

Pulled from the live `settings` table (`/admin/settings`) — these fields are admin-editable and can drift, so re-check `/admin/settings` or query `settings` rather than assuming this snapshot is current:
- **Brand/company**: WHOLESOME — legal entity is a proprietorship registered under Vijaya Ravi, trade name "Wholesome".
- **Sender email**: `info@livewholesome.in` (Zoho — see Supplier email below).
- **Phone**: +91 94890 00614.
- **Registered address**: 744B, 4th Cross Street, Radhakrishnan Nagar, Vellore 632006, Tamil Nadu. Note: the GST registration certificate lists the locality as "Kangeyanallur" for this same building/street/city/PIN — the two names likely refer to the same area, but reconcile which one to print before it matters for a GST-facing document (invoice, packaging).
- **GST**: registered effective 12 Sep 2026 (certificate issued 13 Sep 2026, Regular scheme). GSTIN 33AWWPR3584Q1ZA. `settings.gst_registered` / `settings.gstin` gate Tax Invoice vs. Bill of Supply in `src/lib/invoice/InvoiceDocument.tsx` and are surfaced on the storefront footer and homepage structured data (`src/components/Footer.tsx`, `src/app/page.tsx`) — turned on for real orders by `supabase/migrations/0020_date_sugar_and_gst.sql`, which also corrects `hsn_code` to `2106 90 99` (Tamil Nadu AAR precedent, Krishna Bhavan Foods, is the basis for that code and the 5% rate — confirm both with a CA before relying on them for real orders, per the warning already on `/admin/settings`).
- **No named individual contact.** Correspondence signs as the company (`Team WHOLESOME`), not a person — don't invent a contact-person name or designation for outbound emails.

## Supplier email (Zoho Mail via Claude)

`scripts/send-supplier-email.mjs` sends one-off emails to suppliers (raw materials, packing, couriers, etc.) through Zoho Mail SMTP. This is separate from the app's customer-facing transactional email (Resend, `RESEND_API_KEY`) — it's an ad-hoc channel for the business owner (or Claude, on the owner's behalf) to contact suppliers directly from the terminal, not code the Next.js app calls.

**Setup (one-time, done by the owner, not Claude):**
1. In Zoho Mail, go to Settings → Security → App Passwords and generate an app-specific password (not the account login password).
2. Add to `.env.local` (never commit): `ZOHO_SMTP_USER` (full mailbox address) and `ZOHO_SMTP_PASS` (the app password).
3. **SMTP host is account-specific — don't assume `smtp.zoho.com`/`.in`.** This business's mailbox (`info@livewholesome.in`) lives on Zoho's Canada data center: `ZOHO_SMTP_HOST=smtp.zohocloud.ca`, port 465. Zoho's public docs only list `.com`/`.eu`/`.in`/`.com.au`/`.com.cn` — Canada isn't documented there. The authoritative source for any Zoho account's real host is **Zoho Mail → Settings → Mail Accounts → [account] → SMTP tab** (shows exact host/port for that specific account). If SMTP auth ever starts failing with `535 Authentication Failed`, re-check that tab before assuming the app password is wrong — a wrong *host* produces the identical error to a wrong *password*, and repeated failed attempts risk a temporary account lockout, so verify the host from that settings tab rather than trial-and-erroring across data centers.

**Usage:**
```bash
npm run email:supplier -- --to="supplier@example.com" --subject="Subject line" --body="Email body text"
```
`--cc`, `--bcc`, `--reply-to` are supported; use `--body-file=path.txt` instead of `--body` for longer emails; `--dry-run` prints the fully composed email (headers + signature) instead of sending — use this to show the user the exact email before they approve it.

**Signature is the company, never a person.** Every email gets `-- \nTeam WHOLESOME\nlivewholesome.in` appended automatically (override via `SUPPLIER_EMAIL_SIGNATURE` in `.env.local`; suppress with `--no-signature`), and the `From` header displays as `"WHOLESOME" <info@livewholesome.in>`. Don't sign supplier emails with an individual's name.

**Rule for Claude: sending email always requires the user's explicit go-ahead in chat, every time.** Draft the to/subject/body, show it to the user verbatim (a `--dry-run` is the easiest way), and only run the real send after they confirm — never chain straight from "email the supplier about X" to running the send command. This applies regardless of how routine the email seems.

## Verification workflow used throughout this repo's history

For any change: `npx tsc --noEmit -p tsconfig.json` → `npx eslint <changed files>` → `npm run build` → check the change in a real browser (local dev server; after deploy, the live site) — screenshots/DOM reads, not just "it compiles." Migrations get applied to Supabase (SQL Editor) *before* the corresponding code is tested locally, since local dev points at the same production Supabase project (there is no separate local/staging database).

## A known, usually-harmless flaky build error

Vercel builds have intermittently failed with `Error: Settings row is missing — run the Phase 1 migrations.` (thrown from `src/lib/settings.ts`, during static export of `/account`), with the underlying cause `PGRST303: "JWT issued at future"`. That's a transient clock-skew hiccup between Vercel's build environment and Supabase's PostgREST server validating the service-role JWT — not a missing settings row and not a code bug. Confirm it's transient rather than real by redeploying (or just pushing the next change) and checking whether an identical build succeeds; it's only worth investigating further if it fails on every attempt.
