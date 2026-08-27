-- WhatsApp-sourced reviews: admin manually logs a review a customer sent via
-- WhatsApp chat (see /admin/reviews "Log a WhatsApp review"), tagged
-- distinctly from on-site customer reviews and the early-tester path so
-- ReviewsSection can badge it "via WhatsApp".
alter table reviews drop constraint reviews_source_check;
alter table reviews add constraint reviews_source_check
  check (source in ('customer', 'early_tester', 'whatsapp'));
