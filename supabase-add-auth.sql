-- Run this AFTER you've already run supabase-setup.sql once before.
-- It adds per-user ownership to the movies table so each account
-- only sees their own list.
--
-- NOTE: this deletes any existing rows, since they don't belong to
-- any user yet. That's expected for a class project — if you have
-- movies you want to keep, add them again after logging in.

delete from movies;

alter table movies add column user_id uuid references auth.users(id) not null default auth.uid();

-- Replace the old "anyone can do anything" policies with ones scoped
-- to the logged-in user.
drop policy if exists "Public can view movies" on movies;
drop policy if exists "Public can insert movies" on movies;
drop policy if exists "Public can update movies" on movies;
drop policy if exists "Public can delete movies" on movies;

create policy "Users can view own movies"
  on movies for select
  using (auth.uid() = user_id);

create policy "Users can insert own movies"
  on movies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own movies"
  on movies for update
  using (auth.uid() = user_id);

create policy "Users can delete own movies"
  on movies for delete
  using (auth.uid() = user_id);
