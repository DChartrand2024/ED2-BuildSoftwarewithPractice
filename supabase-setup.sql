-- Run this in your Supabase project: SQL Editor → New query → Run

create table movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year integer,
  genre text,
  status text not null default 'to_watch' check (status in ('to_watch', 'watched')),
  rating integer check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

-- Row Level Security must be enabled, but since this app has no login,
-- the policies below allow anyone with your anon key to read/write.
-- That's expected for a no-auth class project — just don't put
-- sensitive data in this table.
alter table movies enable row level security;

create policy "Public can view movies"
  on movies for select
  using (true);

create policy "Public can insert movies"
  on movies for insert
  with check (true);

create policy "Public can update movies"
  on movies for update
  using (true);

create policy "Public can delete movies"
  on movies for delete
  using (true);
