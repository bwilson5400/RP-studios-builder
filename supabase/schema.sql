-- RP Studios Builder initial schema draft
-- Run in Supabase SQL editor after reviewing.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('seller','admin','supervisor','owner')),
  theme_preference text default 'light',
  created_at timestamptz default now()
);

create table if not exists client_accounts (
  id uuid primary key default gen_random_uuid(),
  account_number text unique not null check (account_number ~ '^[0-9]{8}$'),
  business_name text not null,
  customer_name text not null,
  phone text not null,
  email text not null,
  industry text,
  account_pin_hash text,
  phone_verified boolean default false,
  email_verified boolean default false,
  assigned_seller_id uuid references users(id),
  status text not null default 'pending_setup',
  setup_fee_due_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  site_number text unique not null check (site_number ~ '^[0-9]{12}$'),
  account_id uuid not null references client_accounts(id) on delete cascade,
  site_name text not null,
  package_key text not null check (package_key in ('starter','business','pro','premium')),
  contract_term text not null check (contract_term in ('month_to_month','12_month','36_month')),
  status text not null default 'draft',
  preview_url text,
  live_url text,
  created_at timestamptz default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references client_accounts(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,
  contract_type text not null,
  term_months int,
  setup_fee numeric(10,2) default 0,
  monthly_total numeric(10,2) default 0,
  cancellation_fee numeric(10,2) default 350,
  buyer_remorse_fee numeric(10,2) default 50,
  buyer_remorse_deadline timestamptz,
  terms_json jsonb not null default '{}',
  acknowledged_by text,
  acknowledged_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz default now()
);

create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references client_accounts(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,
  domain text not null,
  status text not null default 'available',
  monthly_price numeric(10,2) default 10,
  setup_fee numeric(10,2) default 0,
  contract_months int default 12,
  cancellation_fee numeric(10,2) default 35,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references client_accounts(id) on delete set null,
  site_id uuid references sites(id) on delete set null,
  amount numeric(10,2) not null,
  transaction_type text not null,
  status text not null,
  processor_reference text,
  created_at timestamptz default now()
);

create table if not exists account_notes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references client_accounts(id) on delete cascade,
  working_user_id uuid references users(id),
  site_id uuid references sites(id) on delete set null,
  action_type text not null,
  result text not null check (result in ('green','red')),
  note text not null,
  immutable boolean default true,
  created_at timestamptz default now()
);

create table if not exists seller_action_records (
  id uuid primary key default gen_random_uuid(),
  working_user_id uuid references users(id),
  working_username text not null,
  role text not null,
  account_number text,
  site_number text,
  action_type text not null,
  result text not null check (result in ('green','red')),
  description text not null,
  preview_mode boolean default false,
  session_id text,
  device_info text,
  created_at timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  assigned_seller_id uuid references users(id),
  business_name text not null,
  industry text,
  business_link text,
  contact_name text,
  phone text,
  email text,
  status text default 'new',
  ai_score int,
  ai_reason text,
  next_follow_up_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists draft_transactions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references users(id),
  account_id uuid references client_accounts(id) on delete cascade,
  current_step text not null,
  draft_json jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
