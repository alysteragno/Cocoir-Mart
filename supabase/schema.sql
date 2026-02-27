-- Users are managed by Supabase Auth (auth.users)
-- Additional profile info
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  address text,
  mobile text,
  role text check (role in ('buyer','seller','admin')) default 'buyer',
  created_at timestamp with time zone default now()
);

-- Categories
create table if not exists public.categories (
  id bigserial primary key,
  name text not null,
  slug text unique not null,
  parent_id bigint references categories(id)
);

-- Products
create table if not exists public.products (
  id bigserial primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  sku text,
  category_id bigint references categories(id),
  is_featured boolean default false,
  is_new boolean default false,
  is_trending boolean default false,
  is_best_seller boolean default false,
  status text check (status in ('active','inactive')) default 'active',
  created_at timestamp with time zone default now()
);

-- Product images
create table if not exists public.product_images (
  id bigserial primary key,
  product_id bigint references products(id) on delete cascade,
  url text not null,
  alt text
);

-- Orders
create table if not exists public.orders (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  order_number text unique,
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method text,
  payment_status text check (payment_status in ('pending','paid','failed','refunded')) default 'pending',
  fulfillment_status text check (fulfillment_status in ('pending','packed','shipped','completed','cancelled')) default 'pending',
  delivery_method text check (delivery_method in ('pickup','delivery')) default 'delivery',
  shipping_address_json jsonb,
  placed_at timestamp with time zone default now()
);

-- Order items
create table if not exists public.order_items (
  id bigserial primary key,
  order_id bigint references orders(id) on delete cascade,
  product_id bigint references products(id),
  quantity integer not null default 1,
  unit_price_snapshot numeric(12,2) not null default 0
);

-- Inventory movements (audit trail)
create table if not exists public.inventory_movements (
  id bigserial primary key,
  product_id bigint references products(id),
  change integer not null,
  reason text,
  reference_type text,
  reference_id bigint,
  created_at timestamp with time zone default now()
);

-- Basic RLS setup (demo: keep open for read; tighten for production)
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public read policies (educational demo)
create policy if not exists "public read products" on public.products for select using (true);
create policy if not exists "public read product images" on public.product_images for select using (true);
create policy if not exists "public read categories" on public.categories for select using (true);

-- Insert/update policies should be added per authenticated role for production.
