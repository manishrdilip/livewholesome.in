-- WHOLESOME / PURNA — customer accounts, saved addresses, reviews
--
-- Access pattern matches every other table in this schema (see 0001's RLS
-- comment): RLS is enabled with zero policies, so anon/authenticated have no
-- direct table access. Customer-facing pages authenticate via Supabase Auth
-- (identity only) then read/write through server-side service-role code that
-- manually scopes queries to that customer's own id — never through
-- client-supplied ids and never through RLS policies a customer's own
-- session could exploit if written wrong.

alter table customers
  add column auth_user_id uuid unique references auth.users(id) on delete set null;
create index customers_auth_user_id_idx on customers(auth_user_id);

-- Reusable address book (up to 3 per customer), separate from `addresses`,
-- which snapshots one shipping address per order and must keep accumulating
-- freely for repeat guest checkouts.
create table saved_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  country text not null default 'India',
  created_at timestamptz not null default now()
);
create index saved_addresses_customer_id_idx on saved_addresses(customer_id);

-- Hard backstop on the 3-address cap — the app checks and gives a friendly
-- error first, this just guarantees it can never be bypassed by a race or a
-- future bug.
create or replace function enforce_saved_address_limit()
returns trigger as $$
begin
  if (select count(*) from saved_addresses where customer_id = new.customer_id) >= 3 then
    raise exception 'A customer may have at most 3 saved addresses';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger saved_addresses_limit
  before insert on saved_addresses
  for each row execute function enforce_saved_address_limit();

create type review_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  -- Snapshot so a review keeps its byline even if the customer is later deleted.
  reviewer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text,
  -- [{ "type": "image" | "video", "storage_path": "..." }, ...]
  media jsonb not null default '[]',
  status review_status not null default 'PENDING',
  moderated_at timestamptz,
  moderated_note text,
  created_at timestamptz not null default now()
);
create index reviews_customer_id_idx on reviews(customer_id);
create index reviews_status_idx on reviews(status);

alter table saved_addresses enable row level security;
alter table reviews enable row level security;

-- Public bucket: approved review media is meant to be shown on the site.
-- Size/type limits guard against abuse of an otherwise-open upload target.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reviews',
  'reviews',
  true,
  26214400, -- 25MB
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;
