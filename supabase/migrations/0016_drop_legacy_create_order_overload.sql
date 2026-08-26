-- 0015 added a 6th parameter (p_status, with a default) to create_order().
-- In Postgres, adding a parameter changes a function's signature, so
-- `create or replace function create_order(... 6 params ...)` created a
-- NEW overload alongside the original 5-parameter one from 0002/0011 rather
-- than replacing it. The two coexisted harmlessly as long as every caller
-- passed all 6 args explicitly (as pre-order mode's checkout always did,
-- since exactly-6-args only matches one candidate) — but the moment a
-- caller passes exactly 5 args relying on p_status's default (as normal,
-- non-pre-order checkout does), Postgres can no longer tell whether to use
-- the 5-arg function or the 6-arg one falling back to its default, and
-- errors with "Could not choose the best candidate function". This is what
-- broke checkout after reverting pre-order mode.

drop function if exists create_order(jsonb, jsonb, jsonb, jsonb, text);
