-- WHOLESOME / PURNA — Phase 2: invoice numbering + storage

-- Atomic per-financial-year invoice counter. Bumped inside the same
-- transaction as the invoices insert (see create_invoice below), so a rolled
-- back invoice never burns a number — unlike a plain Postgres SEQUENCE,
-- whose nextval() advances are not transactional.
create table invoice_counters (
  financial_year text primary key,
  next_number integer not null default 1
);

create or replace function create_invoice(
  p_order_id uuid,
  p_invoice_type invoice_type,
  p_total numeric,
  p_prefix text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $BODY$
declare
  v_fy_start_year int;
  v_fy text;
  v_number int;
  v_invoice_number text;
  v_invoice_id uuid;
begin
  if extract(month from current_date) >= 4 then
    v_fy_start_year := extract(year from current_date)::int;
  else
    v_fy_start_year := extract(year from current_date)::int - 1;
  end if;
  v_fy := lpad((v_fy_start_year % 100)::text, 2, '0') || lpad(((v_fy_start_year + 1) % 100)::text, 2, '0');

  insert into invoice_counters (financial_year, next_number)
  values (v_fy, 2)
  on conflict (financial_year) do update set next_number = invoice_counters.next_number + 1
  returning next_number - 1 into v_number;

  v_invoice_number := p_prefix || '/' || v_fy || '/' || lpad(v_number::text, 4, '0');

  insert into invoices (order_id, invoice_number, invoice_type, total_amount)
  values (p_order_id, v_invoice_number, p_invoice_type, p_total)
  returning id into v_invoice_id;

  return jsonb_build_object('invoice_id', v_invoice_id, 'invoice_number', v_invoice_number);
end;
$BODY$;

create or replace function set_invoice_storage_path(p_invoice_id uuid, p_storage_path text)
returns void
language sql
security definer
set search_path = public
as $$
  update invoices set storage_path = p_storage_path where id = p_invoice_id;
$$;

alter table invoice_counters enable row level security;

-- Private bucket: invoices are only ever served via short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;
