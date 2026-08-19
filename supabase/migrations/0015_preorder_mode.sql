-- Pre-launch mode, part 2 (needs PREORDER committed by 0014 first):
--
-- - create_order() takes an explicit p_status so /api/orders can mark every
--   order placed while pre-launch as PREORDER instead of CONFIRMED, reusing
--   the same customer/address/order/order_items pipeline.
-- - Pre-orders skip the daily production-cap check entirely (nothing is
--   being cooked yet) and are excluded from daily_order_units_used() so
--   they never count against the kitchen's per-day capacity once real
--   orders resume.
-- - Bumps the launch price to 399 (was 400).

create or replace function daily_order_units_used()
returns integer
language sql
stable
as $$
  select coalesce(sum(oi.quantity), 0)::integer
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.status not in ('CANCELLED', 'RETURNED', 'PREORDER')
    and (o.placed_at at time zone 'Asia/Kolkata')::date = (now() at time zone 'Asia/Kolkata')::date;
$$;

create or replace function create_order(
  p_customer jsonb,
  p_address jsonb,
  p_items jsonb,
  p_totals jsonb,
  p_customer_note text,
  p_status order_status default 'CONFIRMED'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $BODY$
declare
  v_customer_id uuid;
  v_address_id uuid;
  v_order_id uuid;
  v_order_number text;
  item jsonb;
  v_limit integer;
  v_used integer;
  v_requested integer;
begin
  if p_status <> 'PREORDER' then
    select daily_order_limit_units into v_limit from settings limit 1;
    v_used := daily_order_units_used();
    select coalesce(sum((req_item->>'quantity')::integer), 0)
    into v_requested
    from jsonb_array_elements(p_items) req_item;

    if v_limit is not null and v_used + v_requested > v_limit then
      raise exception 'DAILY_LIMIT_REACHED' using errcode = 'P0001';
    end if;
  end if;

  insert into customers (name, email, phone, whatsapp_number, whatsapp_opt_in, email_opt_in)
  values (
    p_customer->>'name',
    p_customer->>'email',
    p_customer->>'phone',
    nullif(p_customer->>'whatsapp_number', ''),
    coalesce((p_customer->>'whatsapp_opt_in')::boolean, true),
    coalesce((p_customer->>'email_opt_in')::boolean, true)
  )
  on conflict (phone) do update set
    name = excluded.name,
    email = excluded.email,
    whatsapp_number = coalesce(excluded.whatsapp_number, customers.whatsapp_number)
  returning id into v_customer_id;

  insert into addresses (customer_id, line1, line2, landmark, city, state, pincode, country)
  values (
    v_customer_id,
    p_address->>'line1',
    nullif(p_address->>'line2', ''),
    nullif(p_address->>'landmark', ''),
    p_address->>'city',
    p_address->>'state',
    p_address->>'pincode',
    coalesce(p_address->>'country', 'India')
  )
  returning id into v_address_id;

  insert into orders (
    customer_id, address_id, shipping_address_snapshot, customer_snapshot,
    status, subtotal, discount, shipping_fee, tax_total, grand_total, customer_note
  )
  values (
    v_customer_id, v_address_id, p_address, p_customer,
    p_status,
    (p_totals->>'subtotal')::numeric,
    (p_totals->>'discount')::numeric,
    (p_totals->>'shipping_fee')::numeric,
    (p_totals->>'tax_total')::numeric,
    (p_totals->>'grand_total')::numeric,
    p_customer_note
  )
  returning id, order_number into v_order_id, v_order_number;

  for item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (order_id, sku, product_name, hsn_code, quantity, unit_price, tax_rate, line_total)
    values (
      v_order_id,
      item->>'sku',
      item->>'product_name',
      item->>'hsn_code',
      (item->>'quantity')::integer,
      (item->>'unit_price')::numeric,
      (item->>'tax_rate')::numeric,
      (item->>'line_total')::numeric
    );
  end loop;

  insert into order_events (order_id, status, label)
  values (
    v_order_id,
    p_status::text,
    case when p_status = 'PREORDER' then 'Pre-order placed' else 'Order placed' end
  );

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
end;
$BODY$;

update settings set product_price = 399;
