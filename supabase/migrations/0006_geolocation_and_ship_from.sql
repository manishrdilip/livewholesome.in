-- WHOLESOME / PURNA — saved address geolocation + configurable ship-from address

alter table saved_addresses add column latitude numeric(9,6);
alter table saved_addresses add column longitude numeric(9,6);

-- Editable in /admin/settings — no code change needed to fix it later.
alter table settings add column ship_from_address text;
