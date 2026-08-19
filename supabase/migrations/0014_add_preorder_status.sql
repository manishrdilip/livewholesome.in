-- Pre-launch mode: orders taken before launch are tagged PREORDER instead
-- of CONFIRMED. Added as its own migration (run/committed on its own)
-- because ALTER TYPE ... ADD VALUE can't be used in the same transaction
-- as a later statement that references the new value — see 0015 for the
-- create_order()/daily_order_units_used() changes that use it.
alter type order_status add value if not exists 'PREORDER' before 'CONFIRMED';
