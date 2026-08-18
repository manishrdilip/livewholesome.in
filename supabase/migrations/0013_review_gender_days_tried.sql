-- Extra optional context on early-tester reviews: gender (for internal
-- demographic sense-making, never shown publicly) and how many days they'd
-- actually tried the product before reviewing (shown publicly — adds
-- credibility, e.g. "Tried for 5 days").

alter table reviews
  add column gender text check (gender in ('male', 'female', 'other'));

alter table reviews
  add column days_tried smallint check (days_tried >= 0);
