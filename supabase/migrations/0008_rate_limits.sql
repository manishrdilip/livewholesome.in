-- Atomic, DB-backed rate limiting for /api/orders.
--
-- The previous limiter was an in-memory Map inside the route handler.
-- On Vercel's serverless functions that resets on every cold start and
-- isn't shared across concurrent instances, so a burst of requests
-- landing on different instances could each see an "empty" counter and
-- all pass — the limit was per-warm-instance, not per-IP. This table +
-- function make the check atomic and global across instances.

create table if not exists rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table rate_limits enable row level security;

create or replace function check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  insert into rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case
      when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        then 1
      else rate_limits.count + 1
    end,
    window_start = case
      when rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        then now()
      else rate_limits.window_start
    end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

grant execute on function check_rate_limit(text, int, int) to service_role;
