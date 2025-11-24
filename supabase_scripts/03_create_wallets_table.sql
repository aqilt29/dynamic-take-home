-- =============================================
-- 03_create_wallets_table.sql
-- Create wallets table for cryptocurrency wallet management
-- =============================================
create table
  if not exists public.wallets (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    wallet_id text not null,
    account_address text not null,
    public_key_hex text not null,
    raw_public_key jsonb not null,
    external_server_key_shares jsonb not null,
    created_at timestamp
    with
      time zone not null default now (),
      updated_at timestamp
    with
      time zone not null default now (),
      constraint wallets_pkey primary key (id),
      constraint wallets_account_address_key unique (account_address),
      constraint wallets_user_id_key unique (user_id),
      constraint wallets_wallet_id_key unique (wallet_id),
      constraint wallets_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade,
      constraint wallets_wallet_id_check check (length (wallet_id) > 0),
      constraint wallets_account_address_check check (length (account_address) > 0)
  );

-- Create indexes
create index if not exists wallets_user_id_idx on public.wallets using btree (user_id);

create index if not exists wallets_wallet_id_idx on public.wallets using btree (wallet_id);

create index if not exists wallets_account_address_idx on public.wallets using btree (account_address);

create index if not exists wallets_created_at_idx on public.wallets using btree (created_at desc);

-- Add comments for documentation
comment on table public.wallets is 'Cryptocurrency wallets associated with user accounts';

comment on column public.wallets.wallet_id is 'Unique identifier for the wallet';

comment on column public.wallets.account_address is 'Blockchain account address';

comment on column public.wallets.raw_public_key is 'Raw public key data in JSON format';

comment on column public.wallets.external_server_key_shares is 'Encrypted key shares stored externally';