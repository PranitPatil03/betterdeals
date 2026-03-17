-- Stripe subscription state per user.
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table subscriptions enable row level security;

create policy "Users can read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscription"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscription"
  on subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists subscriptions_customer_idx on subscriptions(stripe_customer_id);
create index if not exists subscriptions_subscription_idx on subscriptions(stripe_subscription_id);
