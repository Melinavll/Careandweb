create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  status text check (
    status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')
  ),
  current_period_end timestamptz
);

create unique index subscriptions_business_id_idx on subscriptions (business_id);
create index subscriptions_stripe_customer_id_idx on subscriptions (stripe_customer_id);
create index subscriptions_stripe_subscription_id_idx on subscriptions (stripe_subscription_id);

alter table subscriptions enable row level security;

create policy "Owners can view their subscription"
  on subscriptions
  for select
  using (
    business_id in (select id from businesses where user_id = auth.uid())
  );
