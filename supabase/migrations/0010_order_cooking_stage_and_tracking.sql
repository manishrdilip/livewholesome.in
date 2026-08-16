-- Adds a COOKING stage between order-received (CONFIRMED) and packing
-- (PACKED), so the admin can walk an order through the real small-batch
-- process: received -> cooking -> packing -> shipping -> delivered.
alter type order_status add value if not exists 'COOKING' after 'CONFIRMED';

-- One tracking record per order — the admin enters carrier + tracking number
-- once, upserted by order_id, and the customer sees it on their order.
-- shipments already has an order_id index; this adds the uniqueness upsert
-- needs without dropping it.
alter table shipments add constraint shipments_order_id_key unique (order_id);
