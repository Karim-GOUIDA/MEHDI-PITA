create table if not exists public.site_data (
  id integer primary key check (id = 1),
  platforms jsonb not null,
  videos jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_data enable row level security;

revoke all on public.site_data from anon, authenticated;
