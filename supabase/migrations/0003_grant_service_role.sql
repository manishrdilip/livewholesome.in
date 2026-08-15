-- "Automatically expose new tables" was disabled at project creation (intentionally,
-- to avoid exposing tables to anon/authenticated by default) but that same toggle also
-- withholds grants from service_role, which our server-side API routes need — RLS with
-- no policies already blocks anon/authenticated regardless, so granting service_role
-- table access here does not weaken that.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
