create extension if not exists pgcrypto;

create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  google_review_link text,
  facebook_review_link text,
  logo_url text,
  review_threshold smallint not null default 4 check (review_threshold between 1 and 5),
  created_at timestamptz not null default now()
);

create index businesses_user_id_idx on businesses (user_id);

alter table businesses enable row level security;

create policy "Owners can manage their businesses"
  on businesses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
