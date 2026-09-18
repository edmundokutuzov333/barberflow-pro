create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type app_role           as enum ('owner','manager','barber');
create type shop_status        as enum ('trial','active','suspended','cancelled');
create type appointment_status as enum ('pending','confirmed','in_progress','completed','cancelled','no_show');
create type deposit_state      as enum ('not_required','awaiting','paid','failed','refunded');
create type booking_source     as enum ('online','manual','waitlist');
create type block_reason       as enum ('lunch','day_off','holiday','meeting','maintenance','absence','other');
create type waitlist_status    as enum ('waiting','offered','converted','expired','cancelled');
create type notif_channel      as enum ('whatsapp','email');
create type notif_status       as enum ('queued','sent','failed','skipped');
create type payment_provider   as enum ('mpesa','emola');
create type payment_state      as enum ('pending','paid','failed','refunded');
create type cancellation_rule  as enum ('flex_2h','moderate_6h','strict_24h','contact_only');
create type deposit_mode       as enum ('percent','fixed');

create table public.profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text, phone text, avatar_url text,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

create table public.plans(
  id uuid primary key default gen_random_uuid(),
  code text unique not null, name text not null,
  price_cents int not null default 0, max_barbers int not null default 3,
  features jsonb not null default '{}'::jsonb, is_active boolean not null default true);
grant select on public.plans to anon, authenticated;
grant all on public.plans to service_role;

create table public.barbershops(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null, description text,
  logo_url text, cover_url text, theme_key text not null default 'violet-noir',
  phone text, whatsapp text, instagram text,
  address text, maps_url text, lat numeric, lng numeric,
  timezone text not null default 'Africa/Maputo',
  slot_interval_min int not null default 15,
  min_lead_time_min int not null default 30,
  max_advance_days int not null default 30,
  cancellation_rule cancellation_rule not null default 'flex_2h',
  deposit_enabled boolean not null default false,
  deposit_mode deposit_mode not null default 'percent',
  deposit_value int not null default 20,
  deposit_hold_min int not null default 10,
  status shop_status not null default 'trial',
  plan_id uuid references public.plans,
  created_at timestamptz not null default now());
grant select on public.barbershops to anon;
grant select, insert, update, delete on public.barbershops to authenticated;
grant all on public.barbershops to service_role;

create table public.barbershop_members(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(barbershop_id,user_id));
grant select, insert, update, delete on public.barbershop_members to authenticated;
grant all on public.barbershop_members to service_role;

create table public.barbers(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  user_id uuid references auth.users on delete set null,
  display_name text not null, photo_url text, bio text,
  years_experience int not null default 0,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  is_active boolean not null default true, sort_order int not null default 0);
grant select on public.barbers to anon;
grant select, insert, update, delete on public.barbers to authenticated;
grant all on public.barbers to service_role;

create table public.services(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  name text not null, price_cents int not null check(price_cents>=0),
  duration_min int not null check(duration_min between 5 and 480),
  requires_deposit boolean not null default false,
  is_active boolean not null default true, sort_order int not null default 0);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;

create table public.barber_services(
  barber_id uuid not null references public.barbers on delete cascade,
  service_id uuid not null references public.services on delete cascade,
  primary key(barber_id,service_id));
grant select on public.barber_services to anon;
grant select, insert, update, delete on public.barber_services to authenticated;
grant all on public.barber_services to service_role;

create table public.haircuts(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  service_id uuid references public.services on delete set null,
  name text not null, description text, photo_url text,
  price_cents int, duration_min int,
  is_active boolean not null default true, sort_order int not null default 0);
grant select on public.haircuts to anon;
grant select, insert, update, delete on public.haircuts to authenticated;
grant all on public.haircuts to service_role;

create table public.working_hours(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  barber_id uuid references public.barbers on delete cascade,
  weekday int not null check(weekday between 0 and 6),
  opens_at time not null, closes_at time not null,
  is_closed boolean not null default false,
  check (is_closed or closes_at > opens_at));
grant select on public.working_hours to anon;
grant select, insert, update, delete on public.working_hours to authenticated;
grant all on public.working_hours to service_role;

create table public.time_blocks(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  barber_id uuid references public.barbers on delete cascade,
  starts_at timestamptz not null, ends_at timestamptz not null,
  reason block_reason not null default 'other', note text,
  check(ends_at>starts_at));
grant select, insert, update, delete on public.time_blocks to authenticated;
grant all on public.time_blocks to service_role;

create table public.customers(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  name text not null, phone text not null, email text,
  notes text, preferences jsonb not null default '{}'::jsonb,
  visits_count int not null default 0,
  no_show_count int not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique(barbershop_id,phone));
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;

create table public.appointments(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  barber_id uuid not null references public.barbers on delete restrict,
  service_id uuid not null references public.services on delete restrict,
  haircut_id uuid references public.haircuts on delete set null,
  customer_id uuid not null references public.customers on delete restrict,
  starts_at timestamptz not null, ends_at timestamptz not null,
  duration_min int not null, price_cents int not null,
  status appointment_status not null default 'pending',
  deposit_status deposit_state not null default 'not_required',
  deposit_cents int not null default 0,
  hold_expires_at timestamptz,
  manage_token uuid not null unique default gen_random_uuid(),
  source booking_source not null default 'online',
  internal_note text, created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz, started_at timestamptz, completed_at timestamptz,
  cancelled_at timestamptz, cancel_reason text, no_show_at timestamptz,
  check(ends_at>starts_at));
grant select, insert, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;

alter table public.appointments add constraint appointments_no_overlap
exclude using gist (
  barber_id with =,
  tstzrange(starts_at,ends_at,'[)') with &&
) where (status in ('pending','confirmed','in_progress'));

create index on public.appointments(barbershop_id,starts_at);
create index on public.appointments(barber_id,starts_at);
create index on public.time_blocks(barbershop_id,starts_at);

create table public.waitlist_entries(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  service_id uuid not null references public.services on delete cascade,
  haircut_id uuid references public.haircuts on delete set null,
  barber_id uuid references public.barbers on delete set null,
  customer_name text not null, phone text not null, email text,
  date_from date, date_to date,
  period text not null default 'any' check(period in ('morning','afternoon','evening','any')),
  status waitlist_status not null default 'waiting',
  offer_token uuid, offer_slot_start timestamptz, offer_barber_id uuid,
  offer_expires_at timestamptz,
  created_at timestamptz not null default now());
grant select, insert, update, delete on public.waitlist_entries to authenticated;
grant all on public.waitlist_entries to service_role;

create table public.reviews(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  barber_id uuid references public.barbers on delete set null,
  appointment_id uuid not null unique references public.appointments on delete cascade,
  rating int not null check(rating between 1 and 5),
  comment text, is_published boolean not null default true,
  created_at timestamptz not null default now());
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;

create table public.payments(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  appointment_id uuid references public.appointments on delete set null,
  provider payment_provider not null, amount_cents int not null,
  msisdn text, status payment_state not null default 'pending',
  provider_ref text, raw jsonb, created_at timestamptz not null default now());
grant select on public.payments to authenticated;
grant all on public.payments to service_role;

create table public.notifications(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops on delete cascade,
  appointment_id uuid references public.appointments on delete cascade,
  waitlist_entry_id uuid references public.waitlist_entries on delete cascade,
  channel notif_channel not null, template_key text not null,
  recipient text not null, payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz not null default now(),
  status notif_status not null default 'queued',
  sent_at timestamptz, error text);
create index on public.notifications(status,scheduled_for);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;

create table public.audit_logs(
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid references public.barbershops on delete cascade,
  actor_id uuid references auth.users, action text not null,
  entity text, entity_id uuid, diff jsonb,
  created_at timestamptz not null default now());
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;