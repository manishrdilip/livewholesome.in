-- Product Costing module: tracks raw-material and overhead costs per finished
-- pouch (500g, PRODUCT.weightGrams) so admin can see cost/profit/margin
-- against the selling price (settings.product_price ?? PRODUCT.unitPrice).
-- See src/lib/costing.ts for the calculation logic and CLAUDE.md for the
-- formula writeup.

create table raw_materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_weight_value numeric not null default 1,
  default_weight_unit text not null default 'kg' check (default_weight_unit in ('kg', 'g')),
  price numeric not null default 0,
  usage_per_kg_grams numeric not null default 0,
  notes text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger raw_materials_set_updated_at
  before update on raw_materials
  for each row execute function set_updated_at();

create table cost_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in
    ('machine', 'packing', 'ads', 'website', 'courier', 'labour', 'testing')),
  name text not null,
  amount numeric not null default 0,
  tax_percent numeric not null default 0,
  allocation_quantity numeric not null default 1,
  notes text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cost_items_set_updated_at
  before update on cost_items
  for each row execute function set_updated_at();

create index cost_items_category_idx on cost_items(category);

alter table raw_materials enable row level security;
alter table cost_items enable row level security;

-- Seed the 20 real ingredients (src/lib/content.ts INGREDIENTS). Price and
-- recipe usage are left at 0 for the admin to fill in with real numbers.
insert into raw_materials (name, sort_order) values
  ('Sprouted Foxtail Millet', 0),
  ('Sprouted Green Gram', 1),
  ('Roasted Gram', 2),
  ('Sprouted Ragi', 3),
  ('Sprouted Red Rice', 4),
  ('Amaranth Seeds', 5),
  ('Sesame', 6),
  ('Sprouted Masoor', 7),
  ('Almond', 8),
  ('Sprouted Chickpea', 9),
  ('Pumpkin Seed', 10),
  ('Sprouted Bajra', 11),
  ('Watermelon Seed', 12),
  ('Palmyra Palm Candy', 13),
  ('Sprouted Horse Gram', 14),
  ('Dried Coconut', 15),
  ('Amla', 16),
  ('Cardamom', 17),
  ('Fennel', 18),
  ('Dry Ginger', 19);
