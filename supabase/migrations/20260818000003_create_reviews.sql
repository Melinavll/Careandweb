create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  review_request_id uuid references review_requests (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  customer_name text,
  customer_email text,
  redirected_to_google boolean not null default false,
  created_at timestamptz not null default now()
);

create index reviews_business_id_idx on reviews (business_id);
create index reviews_review_request_id_idx on reviews (review_request_id);

alter table reviews enable row level security;

create policy "Owners can manage their reviews"
  on reviews
  for all
  using (
    business_id in (select id from businesses where user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where user_id = auth.uid())
  );
