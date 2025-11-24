-- =============================================
-- 01_create_types.sql
-- Create custom enum types
-- =============================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'auth_provider') then
    create type public.auth_provider as enum (
      'credentials',
      'google',
      'github'
    );
  end if;
end$$;