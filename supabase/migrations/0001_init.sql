-- WHOLESOME / PURNA — initial schema (Phase 1)
create extension if not exists pgcrypto;

create type order_status as enum (
  'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'
);
create type payment_status as enum ('UNPAID', 'PAID', 'REFUNDED');
create type payment_method as enum ('PENDING_GATEWAY', 'UPI_MANUAL', 'RAZORPAY');
create type invoice_type as enum ('PROFORMA', 'TAX_INVOICE', 'BILL_OF_SUPPLY');
create type notification_channel as enum ('EMAIL', 'WHATSAPP');
create type notification_status as enum ('QUEUED', 'SENT', 'FAILED');

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null unique,
  whatsapp_number text,
  whatsapp_opt_in boolean not null default true,
  email_opt_in boolean not null default true,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  country text not null default 'India',
  created_at timestamptz not null default now()
);
create index addresses_customer_id_idx on addresses(customer_id);

-- Sequential human-readable order numbers: WP10001, WP10002, ...
create sequence order_number_seq start 10001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references customers(id),
  address_id uuid not null references addresses(id),
  shipping_address_snapshot jsonb not null,
  customer_snapshot jsonb not null,
  status order_status not null default 'CONFIRMED',
  payment_status payment_status not null default 'UNPAID',
  payment_method payment_method not null default 'PENDING_GATEWAY',
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  tax_total numeric(10,2) not null default 0,
  grand_total numeric(10,2) not null,
  customer_note text,
  internal_note text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_id_idx on orders(customer_id);
create index orders_status_idx on orders(status);
create index orders_placed_at_idx on orders(placed_at desc);

create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'WP' || nextval('order_number_seq')::text;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger orders_set_order_number
  before insert on orders
  for each row execute function set_order_number();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  sku text not null,
  product_name text not null,
  hsn_code text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  tax_rate numeric(5,2) not null default 0,
  line_total numeric(10,2) not null
);
create index order_items_order_id_idx on order_items(order_id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  invoice_number text not null unique,
  invoice_type invoice_type not null,
  invoice_date date not null default current_date,
  storage_path text,
  total_amount numeric(10,2) not null,
  issued_at timestamptz not null default now()
);
create index invoices_order_id_idx on invoices(order_id);

create table shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  carrier text,
  awb_number text,
  tracking_url text,
  dispatched_at timestamptz,
  expected_delivery_date date,
  delivered_at timestamptz,
  weight_grams integer
);
create index shipments_order_id_idx on shipments(order_id);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  label text not null,
  note text,
  created_at timestamptz not null default now()
);
create index order_events_order_id_idx on order_events(order_id);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  channel notification_channel not null,
  template_key text,
  recipient text,
  status notification_status not null default 'QUEUED',
  provider_message_id text,
  error_message text,
  sent_at timestamptz
);
create index notifications_order_id_idx on notifications(order_id);

-- Single-row settings table
create table settings (
  id boolean primary key default true check (id),
  business_name text not null default 'WHOLESOME',
  registered_address text,
  gstin text,
  fssai_license text,
  support_phone text,
  support_email text,
  gst_registered boolean not null default false,
  gst_rate numeric(5,2) not null default 5,
  hsn_code text not null default '1904',
  invoice_prefix text not null default 'WP',
  shipping_fee numeric(10,2) not null default 0,
  logo_path text
);
insert into settings (id) values (true);

-- RLS: every table locked down, no anon/authenticated policies.
-- All access goes through server API routes using the service role key,
-- which bypasses RLS entirely — so no policies are defined here on purpose.
alter table customers enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table invoices enable row level security;
alter table shipments enable row level security;
alter table order_events enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;
