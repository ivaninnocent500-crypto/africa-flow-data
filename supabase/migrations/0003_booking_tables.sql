create table if not exists public.booking_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  listing_type text not null check (listing_type in ('itinerary','guide','accommodation')),
  listing_id uuid not null,
  start_date date,
  end_date date,
  travelers int not null default 2,
  rooms int not null default 1,
  room_preference text,
  pickup_info text,
  special_requests text,
  nationality text,
  budget_range text,
  contact_name text,
  contact_email citext,
  contact_phone text,
  status text not null default 'draft' check (status in ('draft','submitted','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.booking_drafts(id) on delete set null,
  user_id uuid not null,
  booking_reference text not null unique,
  listing_type text not null check (listing_type in ('itinerary','guide','accommodation')),
  listing_id uuid not null,
  operator_id uuid references public.operators(id) on delete set null,
  booking_choice text not null check (booking_choice in ('request_payment','reserve_booking')),
  status text not null default 'pending' check (status in ('pending','awaiting_availability','awaiting_payment','confirmed','cancelled','expired')),
  quoted_amount numeric(12,2),
  currency char(3) not null default 'USD',
  start_date date,
  end_date date,
  travelers int not null default 2,
  rooms int not null default 1,
  contact_name text not null,
  contact_email citext not null,
  contact_phone text,
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservation_holds (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  hold_reference text not null unique,
  status text not null default 'active' check (status in ('active','expired','converted','cancelled')),
  expires_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  payment_reference text not null unique,
  amount numeric(12,2) not null,
  currency char(3) not null default 'USD',
  payment_method text not null default 'card',
  status text not null default 'pending' check (status in ('pending','sent','paid','failed','cancelled','expired')),
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
