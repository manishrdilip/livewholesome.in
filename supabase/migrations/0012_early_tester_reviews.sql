-- Early-tester reviews: a public, unauthenticated review path for people
-- given free samples outside the real order flow (friends & family in the
-- test phase), shared via one unlisted link rather than tied to an order.
-- These publish immediately (status inserted as APPROVED) instead of
-- going through the PENDING moderation queue that customer_id reviews use,
-- since the link itself is the trust gate — admin can still delete after
-- the fact via /admin/reviews.

alter table reviews
  add column source text not null default 'customer' check (source in ('customer', 'early_tester'));

-- Informal contact for an early tester (phone or email, free text) — no
-- customer_id exists for these since there's no account or order.
alter table reviews
  add column reviewer_contact text;

-- The "how full/complete did it feel" gauge early testers use instead of
-- a 1-5 star pick. `rating` stays populated too (derived from this) so it
-- keeps satisfying its existing not-null/1-5 check and any code that reads
-- it, but display should prefer this column when it's present.
alter table reviews
  add column fullness_percent smallint check (fullness_percent between 0 and 100);

create index reviews_source_idx on reviews(source);
