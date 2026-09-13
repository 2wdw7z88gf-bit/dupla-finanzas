-- Fixes the 4 function-related warnings from Supabase's Security Advisor:
-- pin each function's search_path, and stop letting the "public" role
-- (anyone, even unauthenticated requests using the publishable key) call
-- them — only signed-in users should be able to.

alter function current_household_ids() set search_path = public;

revoke execute on function current_household_ids() from public;
grant execute on function current_household_ids() to authenticated;

revoke execute on function bootstrap_household(text) from public;
grant execute on function bootstrap_household(text) to authenticated;
