-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered'
);

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends auth.users 1-to-1
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  phone         text,
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  postal_code   text,
  country       text default 'US',
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- products
create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  description   text,
  price_cents   integer not null,
  images        text[] default '{}',
  category      text,
  stock_qty     integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- orders
create table public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references public.profiles(id) on delete set null,
  guest_email          text,
  shipping_name        text not null,
  shipping_email       text not null,
  shipping_line1       text not null,
  shipping_line2       text,
  shipping_city        text not null,
  shipping_state       text not null,
  shipping_postal      text not null,
  shipping_country     text not null default 'US',
  subtotal_cents       integer not null,
  shipping_cents       integer not null default 0,
  total_cents          integer not null,
  stripe_session_id    text unique,
  stripe_payment_intent text,
  status               order_status not null default 'pending',
  tracking_number      text,
  carrier              text,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- order_items
create table public.order_items (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  product_name     text not null,
  product_image    text,
  unit_price_cents integer not null,
  quantity         integer not null check (quantity > 0),
  created_at       timestamptz not null default now()
);

-- shipping_updates: audit log of every status change
create table public.shipping_updates (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  status          order_status not null,
  message         text,
  tracking_number text,
  updated_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_orders_user_id        on public.orders(user_id);
create index idx_orders_status         on public.orders(status);
create index idx_orders_stripe_session on public.orders(stripe_session_id);
create index idx_order_items_order_id  on public.order_items(order_id);
create index idx_shipping_order_id     on public.shipping_updates(order_id);
create index idx_products_slug         on public.products(slug);
create index idx_products_active       on public.products(is_active);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUTO-CREATE profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.products         enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.shipping_updates enable row level security;

-- Admin helper function
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles
create policy "users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "admins read all profiles"
  on public.profiles for select using (public.is_admin());

-- products (public read for active)
create policy "public read active products"
  on public.products for select using (is_active = true);

create policy "admins full access products"
  on public.products for all using (public.is_admin());

-- orders
create policy "users read own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "admins full access orders"
  on public.orders for all using (public.is_admin());

-- order_items
create policy "users read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "admins full access order items"
  on public.order_items for all using (public.is_admin());

-- shipping_updates
create policy "users read own shipping updates"
  on public.shipping_updates for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "admins full access shipping updates"
  on public.shipping_updates for all using (public.is_admin());
