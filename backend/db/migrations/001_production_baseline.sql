-- Production baseline schema for Gigs Mtaani (Supabase / Postgres)
-- Run with Supabase SQL editor or migration tooling.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.app_users (
  id uuid primary key,
  campus_email text not null unique,
  phone_e164 text not null unique,
  password_hash text not null,
  role text not null check (role in ('STUDENT', 'ADMIN')),
  status text not null check (status in ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DELETED')),
  display_name text not null,
  campus_id text not null,
  mfa_enabled boolean not null default false,
  failed_login_attempts integer not null default 0,
  lockout_until timestamptz null,
  email_verified_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auth_refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  family_id uuid not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  replaced_by_token_hash text null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  theme text not null default 'light',
  remember_me boolean not null default false,
  notifications jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  pay_amount numeric(12,2) not null check (pay_amount >= 0),
  currency text not null default 'KES',
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null check (radius_meters between 100 and 50000),
  starts_at timestamptz not null,
  status text not null default 'OPEN',
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(category, '')), 'C')
  ) stored,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id bigserial primary key,
  user_id uuid null references public.app_users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  request_id text null,
  ip_hash text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_app_users_email on public.app_users(campus_email);
create index if not exists idx_app_users_phone on public.app_users(phone_e164);
create index if not exists idx_refresh_tokens_user on public.auth_refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_family on public.auth_refresh_tokens(family_id);
create index if not exists idx_reset_tokens_user on public.password_reset_tokens(user_id);
create index if not exists idx_verify_tokens_user on public.email_verification_tokens(user_id);
create index if not exists idx_gigs_status_created on public.gigs(status, created_at desc);
create index if not exists idx_gigs_search_vector on public.gigs using gin(search_vector);
create index if not exists idx_gigs_geo on public.gigs(latitude, longitude);
create index if not exists idx_activity_logs_user_created on public.activity_logs(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

drop trigger if exists trg_gigs_updated_at on public.gigs;
create trigger trg_gigs_updated_at
before update on public.gigs
for each row execute function public.set_updated_at();

create or replace function public.audit_app_users_changes()
returns trigger
language plpgsql
as $$
begin
  insert into public.activity_logs(user_id, action, metadata)
  values (
    coalesce(new.id, old.id),
    tg_op || '_APP_USER',
    jsonb_build_object(
      'old', to_jsonb(old),
      'new', to_jsonb(new)
    )
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_app_users_changes on public.app_users;
create trigger trg_audit_app_users_changes
after insert or update or delete on public.app_users
for each row execute function public.audit_app_users_changes();

-- Row level security
alter table public.app_users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.gigs enable row level security;
alter table public.activity_logs enable row level security;

-- Users can read/update their own profile
drop policy if exists app_users_self_select on public.app_users;
create policy app_users_self_select
on public.app_users
for select
using (auth.uid() = id);

drop policy if exists app_users_self_update on public.app_users;
create policy app_users_self_update
on public.app_users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Public can read open gigs
drop policy if exists gigs_public_read on public.gigs;
create policy gigs_public_read
on public.gigs
for select
using (status = 'OPEN');

-- Authenticated users can create their own gigs
drop policy if exists gigs_owner_insert on public.gigs;
create policy gigs_owner_insert
on public.gigs
for insert
with check (auth.uid() = poster_id);

drop policy if exists gigs_owner_update on public.gigs;
create policy gigs_owner_update
on public.gigs
for update
using (auth.uid() = poster_id)
with check (auth.uid() = poster_id);
