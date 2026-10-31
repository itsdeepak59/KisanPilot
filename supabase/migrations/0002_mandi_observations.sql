create table if not exists public.mandi_observations (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  district text not null,
  market text not null,
  commodity text not null,
  variety text,
  grade text,
  arrival_date text not null,
  min_price numeric,
  max_price numeric,
  modal_price numeric,
  observed_at timestamptz not null default now()
);

create index if not exists mandi_observations_lookup_idx
  on public.mandi_observations (state, district, commodity, observed_at desc);

alter table public.mandi_observations enable row level security;
