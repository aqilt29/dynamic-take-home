-- =============================================
-- 02_create_users_table.sql
-- Create users table with authentication support
-- =============================================

create table if not exists public.users (
  id uuid not null default gen_random_uuid(),
  email text not null,
  name text null,
  image text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  auth_provider public.auth_provider not null default 'credentials'::auth_provider,
  hashed_password text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_email_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
create index if not exists users_email_idx on public.users using btree (email);
create index if not exists users_created_at_idx on public.users using btree (created_at desc);
create index if not exists users_auth_provider_idx on public.users using btree (auth_provider);

-- Add comments for documentation
comment on table public.users is 'User accounts with multi-provider authentication support';
comment on column public.users.auth_provider is 'Authentication method used for this account';
comment on column public.users.hashed_password is 'Only populated for credentials-based auth';