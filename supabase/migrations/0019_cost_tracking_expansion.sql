-- Expands the Product Costing module (see 0018_cost_tracking.sql):
--   1. Redefines raw_materials' recipe field from "grams per kg of finished
--      product" to "grams per finished packet" (PRODUCT.weightGrams = 500g)
--      — simpler for an admin who thinks in "one packet", not "per kg".
--   2. Seeds starting recipe quantities for the 20 ingredients. These are
--      ESTIMATES to get the tool usable immediately, not the verified real
--      recipe — correct them in /admin/costing to match reality.
--   3. Seeds machines, packing consumables, ad platforms, courier options,
--      and lab tests requested for the module, with amount=0 (except
--      courier, seeded with researched market rates — see notes on each
--      row) for the admin to fill in with real numbers.

alter table raw_materials rename column usage_per_kg_grams to usage_per_packet_grams;

update raw_materials set usage_per_packet_grams = 55 where name = 'Sprouted Foxtail Millet';
update raw_materials set usage_per_packet_grams = 45 where name = 'Sprouted Green Gram';
update raw_materials set usage_per_packet_grams = 35 where name = 'Roasted Gram';
update raw_materials set usage_per_packet_grams = 55 where name = 'Sprouted Ragi';
update raw_materials set usage_per_packet_grams = 45 where name = 'Sprouted Red Rice';
update raw_materials set usage_per_packet_grams = 20 where name = 'Amaranth Seeds';
update raw_materials set usage_per_packet_grams = 15 where name = 'Sesame';
update raw_materials set usage_per_packet_grams = 35 where name = 'Sprouted Masoor';
update raw_materials set usage_per_packet_grams = 15 where name = 'Almond';
update raw_materials set usage_per_packet_grams = 35 where name = 'Sprouted Chickpea';
update raw_materials set usage_per_packet_grams = 15 where name = 'Pumpkin Seed';
update raw_materials set usage_per_packet_grams = 35 where name = 'Sprouted Bajra';
update raw_materials set usage_per_packet_grams = 10 where name = 'Watermelon Seed';
update raw_materials set usage_per_packet_grams = 20 where name = 'Palmyra Palm Candy';
update raw_materials set usage_per_packet_grams = 27 where name = 'Sprouted Horse Gram';
update raw_materials set usage_per_packet_grams = 15 where name = 'Dried Coconut';
update raw_materials set usage_per_packet_grams = 10 where name = 'Amla';
update raw_materials set usage_per_packet_grams = 3  where name = 'Cardamom';
update raw_materials set usage_per_packet_grams = 5  where name = 'Fennel';
update raw_materials set usage_per_packet_grams = 5  where name = 'Dry Ginger';

insert into cost_items (category, name, amount, notes, sort_order, is_active) values
  ('machine', 'Dryer', 0, null, 0, true),
  ('machine', 'Roasting Machine', 0, null, 1, true),
  ('machine', 'Pulverizer', 0, null, 2, true),
  ('machine', 'Packing Machine', 0, null, 3, true),
  ('machine', 'Expiry Date Printer', 0, null, 4, true),
  ('machine', 'Packing Label Printer (4x6)', 0, null, 5, true),

  ('packing', 'Packing Pouch', 0, null, 0, true),
  ('packing', 'O2 Absorber Packet', 0, null, 1, true),
  ('packing', 'Courier Box', 0, null, 2, true),
  ('packing', 'Tape', 0, null, 3, true),

  ('ads', 'Meta Ads (Facebook + Instagram)', 0,
    'Best fit for hyperlocal reach — precise radius targeting around Vellore/Chennai plus age, gender, and interest targeting (moms, health food). Facebook skews better for 35+ audiences, Instagram Reels/Stories for younger urban moms.',
    0, true),
  ('ads', 'Google Ads (Search + Retargeting)', 0,
    'Captures people already searching for sprouted/health mix products, and retargets past site visitors — retargeting converts far higher than cold traffic. Common split for D2C brands is ~60% Meta (discovery) / 40% Google (intent + retargeting).',
    1, true),
  ('ads', 'ShareChat / Lokal (regional)', 0,
    'Regional-language ad platforms with strong Tamil Nadu reach and high engagement in Tier-2/3 areas — worth testing once Meta/Google are established.',
    2, false),

  ('courier', 'Delhivery', 48,
    'Researched Jan 2026 market rate: ~₹40-55 per 500g depending on zone/volume, 2-4 day delivery, wide pincode coverage. Good default for Chennai/Vellore + pan-India. Confirm your actual negotiated rate.',
    0, true),
  ('courier', 'Shipping Aggregator (Shiprocket/NimbusPost)', 24,
    'Cheapest option for most D2C parcels — routes each shipment across 27+ courier partners automatically. ~₹20-26 per 500g, 3-5 days. Good if order volume is still low and irregular.',
    1, false),
  ('courier', 'India Post Speed Post', 80,
    'Cheapest for remote/rural pincodes and the widest reach in Tamil Nadu''s smaller towns, ~₹70-93 per 500g incl. GST, but slowest at 3-6 days.',
    2, false),

  ('testing', 'Microbiological Testing (TPC, E. coli, Salmonella)', 0, 'Basic food-safety panel, typically per batch.', 0, true),
  ('testing', 'Heavy Metals & Pesticide Residue', 0, null, 1, true),
  ('testing', 'Aflatoxin Testing', 0, 'Important for grains/millets — fungal toxin risk.', 2, true),
  ('testing', 'Nutritional / Label Claim Analysis', 0, 'Needed to support the nutrition facts printed on the pack.', 3, true),
  ('testing', 'Shelf-Life Stability Testing', 0, null, 4, true);
