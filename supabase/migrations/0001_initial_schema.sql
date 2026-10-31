create extension if not exists pgcrypto;

create table if not exists public.farmers (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique check (char_length(device_id) between 1 and 128),
  language text not null default 'en' check (language in ('en', 'hi')),
  lat double precision,
  lon double precision,
  place_name text,
  state text,
  district text,
  crops text[] not null default '{}',
  telegram_chat_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.advisories (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.farmers(id) on delete cascade,
  question text not null,
  answer text not null,
  tool_trace jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.api_cache (
  key text primary key,
  source text not null,
  payload jsonb not null,
  fetched_at timestamptz not null,
  ttl_seconds integer not null check (ttl_seconds > 0)
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references public.farmers(id) on delete cascade,
  kind text not null,
  message text not null,
  sent_at timestamptz not null default now(),
  delivered boolean not null default false
);

alter table public.farmers enable row level security;
alter table public.advisories enable row level security;
alter table public.api_cache enable row level security;
alter table public.alerts enable row level security;
