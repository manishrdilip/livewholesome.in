-- Atomic order creation: upserts the customer, snapshots the address, and
-- inserts the order + items + first event in a single transaction (one
-- function call is one implicit transaction in Postgres).
create or replace function create_order(
  p_customer jsonb,
  p_address jsonb,
  p_items jsonb,
  p_totals jsonb,
  p_customer_note text
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
begin
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
    subtotal, discount, shipping_fee, tax_total, grand_total, customer_note
  )
  values (
    v_customer_id, v_address_id, p_address, p_customer,
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
  values (v_order_id, 'CONFIRMED', 'Order placed');

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number);
end;
$BODY$;
