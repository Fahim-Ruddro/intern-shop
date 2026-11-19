-- 1. CART ITEMS TABLE
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);

alter table public.cart_items enable row level security;

create policy "Users can view their own cart items"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cart items"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own cart items"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- 2. ADDRESSES TABLE
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  address text not null,
  city text not null,
  area text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);

alter table public.addresses enable row level security;

create policy "Users can view their own addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- 3. ORDERS & ORDER ITEMS TABLES (stores server-calculated totals & Stripe session reference)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address_id uuid references public.addresses(id) on delete set null,
  status text not null default 'pending',
  subtotal integer not null check (subtotal >= 0),
  delivery_charge integer not null check (delivery_charge >= 0),
  total integer not null check (total >= 0),
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

alter table public.order_items enable row level security;

create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert their own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );