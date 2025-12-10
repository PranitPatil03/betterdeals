-- Core schema for the price tracker app.
create extension if not exists "uuid-ossp";

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  name text not null,
  current_price numeric(10,2) not null,
  currency text not null default 'USD',
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists price_history (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  price numeric(10,2) not null,
  currency text not null,
  checked_at timestamp with time zone default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_user_url_unique'
  ) then
    alter table products
      add constraint products_user_url_unique unique (user_id, url);
  end if;
end
$$;

alter table products enable row level security;
alter table price_history enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Users can view their own products'
  ) then
    create policy "Users can view their own products"
      on products for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Users can insert their own products'
  ) then
    create policy "Users can insert their own products"
      on products for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Users can update their own products'
  ) then
    create policy "Users can update their own products"
      on products for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Users can delete their own products'
  ) then
    create policy "Users can delete their own products"
      on products for delete
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'price_history'
      and policyname = 'Users can view price history for their products'
  ) then
    create policy "Users can view price history for their products"
      on price_history for select
      using (
        exists (
          select 1 from products
          where products.id = price_history.product_id
            and products.user_id = auth.uid()
        )
      );
  end if;
end
$$;

create index if not exists products_user_id_idx on products(user_id);
create index if not exists price_history_product_id_idx on price_history(product_id);
create index if not exists price_history_checked_at_idx on price_history(checked_at desc);
