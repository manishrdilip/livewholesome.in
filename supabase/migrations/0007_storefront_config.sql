-- WHOLESOME / PURNA — admin-editable storefront config: price, offers,
-- subscribe & save, social links. Editable in /admin/settings — no code
-- change or redeploy needed to update any of these.

alter table settings add column product_price numeric(10, 2);
alter table settings add column discount_percent numeric(5, 2) not null default 0;
alter table settings add column subscribe_discount_percent numeric(5, 2) not null default 10;
alter table settings add column facebook_url text;
alter table settings add column instagram_url text;
alter table settings add column youtube_url text;

comment on column settings.product_price is 'Overrides PRODUCT.unitPrice when set; null falls back to the code default.';
comment on column settings.discount_percent is 'Sitewide offer, applied on top of product_price. 0 = no offer.';
comment on column settings.subscribe_discount_percent is 'Extra % off when a customer chooses the monthly Subscribe & Save option.';
