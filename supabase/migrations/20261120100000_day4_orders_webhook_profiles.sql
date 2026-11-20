-- ============================================================================
-- 1. PROFILES TABLE & AUTO-CREATE TRIGGER
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger function to create a profile automatically on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any existing auth.users
insert into public.profiles (id, full_name, phone, role)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', ''),
  coalesce(raw_user_meta_data->>'phone', ''),
  'customer'
from auth.users
on conflict (id) do nothing;

-- ============================================================================
-- 2. UPGRADE ORDERS & ORDER_ITEMS FOR SNAPSHOTS AND STRICT STATUSES
-- ============================================================================
alter table public.orders
  add column if not exists shipping_address jsonb,
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled'));

-- Ensure stripe_session_id is strictly unique for webhook idempotency
create unique index if not exists idx_orders_stripe_session_id_unique
  on public.orders(stripe_session_id)
  where stripe_session_id is not null;

-- Store product name at time of purchase in order_items
alter table public.order_items
  add column if not exists name text not null default '';

-- Backfill name on any existing order_items from products
update public.order_items oi
set name = p.name
from public.products p
where oi.product_id = p.id
  and oi.name = '';

-- ============================================================================
-- 3. ATOMIC RPC FUNCTION CALLED BY STRIPE WEBHOOK
-- ============================================================================
AAAAAAAAzzzzzzzzzzzzzzzzzzzzzzzzzzcreate or replace function public.handle_stripe_checkout_completed(
  p_user_id uuid,
  p_address_id uuid,
  p_stripe_session_id text,
  p_delivery_charge integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_order_id uuid;XV
  v_order_id uuid;
  v_subtotal integer := 0;
  v_total integer := 0;
  v_shipping_snapshot jsonb;
  v_item record;
begin
  -- 1. Idempotency check: if this Stripe session already created an order, return it immediately
  select id into v_existing_order_id
  from public.orders
  where stripe_session_id = p_stripe_session_id
  limit 1;

  if v_existing_order_id is not null then
    return v_existing_order_id;
  end if;

  -- 2. Snapshot the shipping address at purchase time
  select jsonb_build_object(
    'name', a.name,
    'phone', a.phone,
    'address', a.address,
    'city', a.city,
    'area', a.area
  )
  into v_shipping_snapshot
  from public.addresses a
  where a.id = p_address_id
    and a.user_id = p_user_id;

  if v_shipping_snapshot is null then
    raise exception 'Address not found for user';
  end if;

  -- 3. Calculate subtotal from cart_items joined with live products (locking product rows)
  for v_item in
    select
      ci.product_id,
      ci.quantity,
      p.name as product_name,
      p.price as unit_price,
      p.stock as current_stock
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.user_id = p_user_id
    for update of p
  loop
    if v_item.current_stock < v_item.quantity then
      raise exception 'Insufficient stock for product %', v_item.product_name;
    end if;

    v_subtotal := v_subtotal + (v_item.unit_price * v_item.quantity);
  end loop;

  if v_subtotal = 0 then
    raise exception 'Cart is empty for user %', p_user_id;
  end if;

  v_total := v_subtotal + coalesce(p_delivery_charge, 0);

  -- 4. Insert the paid order
  insert into public.orders (
    user_id,
    address_id,
    shipping_address,
    status,
    subtotal,
    delivery_charge,
    total,
    stripe_session_id
  )
  values (
    p_user_id,
    p_address_id,
    v_shipping_snapshot,
    'paid',
    v_subtotal,
    coalesce(p_delivery_charge, 0),
    v_total,
    p_stripe_session_id
  )
  returning id into v_order_id;

  -- 5. Insert order_items snapshots & decrement product stock
  for v_item in
    select
      ci.product_id,
      ci.quantity,
      p.name as product_name,
      p.price as unit_price
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.user_id = p_user_id
  loop
    insert into public.order_items (
      order_id,
      product_id,
      name,
      quantity,
      unit_price
    )
    values (
      v_order_id,
      v_item.product_id,
      v_item.product_name,
      v_item.quantity,
      v_item.unit_price
    );

    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;
  end loop;

  -- 6. Clear user's cart
  delete from public.cart_items
  where user_id = p_user_id;

  return v_order_id;
end;
$$;

-- Restrict RPC execution to service_role (called by our verified Stripe webhook)
revoke all on function public.handle_stripe_checkout_completed(uuid, uuid, text, integer) from public;
revoke all on function public.handle_stripe_checkout_completed(uuid, uuid, text, integer) from authenticated;
grant execute on function public.handle_stripe_checkout_completed(uuid, uuid, text, integer) to service_role;q