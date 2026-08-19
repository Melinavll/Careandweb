create table review_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  customer_name text,
  customer_email text,
  customer_phone text,
  unique_token text not null default gen_random_uuid()::text unique,
  status text not null default 'pending' check (status in ('pending', 'sent', 'completed', 'expired')),
  created_at timestamptz not null default now()
);

create index review_requests_business_id_idx on review_requests (business_id);
create index review_requests_unique_token_idx on review_requests (unique_token);

alter table review_requests enable row level security;

create policy "Owners can manage their review requests"
  on review_requests
  for all
  using (
    business_id in (select id from businesses where user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where user_id = auth.uid())
  );
