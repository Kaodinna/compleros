-- ============================================================
-- Compleros — Full Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to re-run: uses IF NOT EXISTS + DROP POLICY IF EXISTS
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id                        uuid        primary key references auth.users(id) on delete cascade,
  full_name                 text,
  org_type                  text,
  plan_type                 text        not null default 'free',
  onboarding_complete       boolean     not null default false,
  upgrade_banner_dismissed  timestamptz,
  email_digest_enabled      boolean     not null default true,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);
-- Patch any pre-existing profiles table that is missing columns
alter table public.profiles add column if not exists org_type                 text;
alter table public.profiles add column if not exists plan_type                text        not null default 'free';
alter table public.profiles add column if not exists onboarding_complete      boolean     not null default false;
alter table public.profiles add column if not exists upgrade_banner_dismissed timestamptz;
alter table public.profiles add column if not exists email_digest_enabled     boolean     not null default true;
alter table public.profiles add column if not exists updated_at               timestamptz default now();
alter table public.profiles enable row level security;
drop policy if exists "Users view own profile"   on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, org_type)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'org_type')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Programs ─────────────────────────────────────────────────
create table if not exists public.programs (
  id               uuid        default gen_random_uuid() primary key,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  name             text        not null,
  type             text        not null,
  county           text        not null,
  enrollment_range text,
  created_at       timestamptz default now()
);
alter table public.programs enable row level security;
drop policy if exists "Users manage own programs" on public.programs;
create policy "Users manage own programs" on public.programs for all using (auth.uid() = user_id);

-- ── Waitlist ─────────────────────────────────────────────────
create table if not exists public.waitlist (
  id         uuid        default gen_random_uuid() primary key,
  email      text        unique not null,
  created_at timestamptz default now()
);
alter table public.waitlist enable row level security;

-- ── Contacts ─────────────────────────────────────────────────
create table if not exists public.contacts (
  id         uuid        default gen_random_uuid() primary key,
  name       text        not null,
  email      text        not null,
  subject    text        not null default 'General Inquiry',
  message    text        not null,
  created_at timestamptz default now()
);
alter table public.contacts enable row level security;

-- ── Licenses ─────────────────────────────────────────────────
create table if not exists public.licenses (
  id             uuid        default gen_random_uuid() primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  program_id     uuid        references public.programs(id) on delete set null,
  license_type   text        not null,
  license_number text,
  issuing_agency text,
  issued_at      date,
  expires_at     date        not null,
  renewal_notes  text,
  created_at     timestamptz default now()
);
-- Patch any pre-existing licenses table that is missing columns
alter table public.licenses add column if not exists program_id     uuid references public.programs(id) on delete set null;
alter table public.licenses add column if not exists license_number text;
alter table public.licenses add column if not exists issuing_agency text;
alter table public.licenses add column if not exists issued_at      date;
alter table public.licenses add column if not exists renewal_notes  text;
-- Drop NOT NULL from legacy 'name' column if it exists from an older schema version
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'licenses' and column_name = 'name'
  ) then
    alter table public.licenses alter column name drop not null;
  end if;
end $$;
alter table public.licenses enable row level security;
drop policy if exists "Users manage own licenses" on public.licenses;
create policy "Users manage own licenses" on public.licenses for all using (auth.uid() = user_id);

-- ── Staff ────────────────────────────────────────────────────
create table if not exists public.staff (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  first_name text        not null,
  last_name  text        not null,
  role       text        not null,
  email      text,
  phone      text,
  start_date date,
  notes      text,
  created_at timestamptz default now()
);
-- Patch any pre-existing staff table that is missing columns
alter table public.staff add column if not exists first_name text;
alter table public.staff add column if not exists last_name  text;
alter table public.staff add column if not exists role       text;
alter table public.staff add column if not exists email      text;
alter table public.staff add column if not exists phone      text;
alter table public.staff add column if not exists start_date date;
alter table public.staff add column if not exists notes      text;
-- Drop NOT NULL from legacy columns if they exist from an older schema version
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'staff' and column_name = 'name'
  ) then
    alter table public.staff alter column name drop not null;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'staff' and column_name = 'full_name'
  ) then
    alter table public.staff alter column full_name drop not null;
  end if;
end $$;
alter table public.staff enable row level security;
drop policy if exists "Users manage own staff" on public.staff;
create policy "Users manage own staff" on public.staff for all using (auth.uid() = user_id);

-- ── Documents ────────────────────────────────────────────────
create table if not exists public.documents (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null,
  folder       text        not null default 'Other',
  storage_path text        not null,
  size_bytes   bigint      not null default 0,
  expires_at   date,
  created_at   timestamptz default now()
);
-- Patch any pre-existing documents table that is missing columns
alter table public.documents add column if not exists folder      text    not null default 'Other';
alter table public.documents add column if not exists size_bytes  bigint  not null default 0;
alter table public.documents add column if not exists expires_at  date;
alter table public.documents enable row level security;
drop policy if exists "Users manage own documents" on public.documents;
create policy "Users manage own documents" on public.documents for all using (auth.uid() = user_id);

-- ── Regulatory Updates ───────────────────────────────────────
create table if not exists public.regulatory_updates (
  id             uuid        default gen_random_uuid() primary key,
  title          text        not null,
  summary        text        not null,
  source_agency  text        not null,
  update_type    text        not null,
  published_date date        not null,
  external_url   text,
  is_legislative boolean     not null default false,
  created_at     timestamptz default now()
);
alter table public.regulatory_updates enable row level security;
drop policy if exists "Public can read updates" on public.regulatory_updates;
create policy "Public can read updates" on public.regulatory_updates for select using (true);

-- ── Checklist Items ──────────────────────────────────────────
create table if not exists public.checklist_items (
  id            uuid    default gen_random_uuid() primary key,
  category      text    not null,
  item_text     text    not null,
  display_order integer not null unique,
  tier_required text    not null default 'free'
);
alter table public.checklist_items add column if not exists tier_required text not null default 'free';
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.checklist_items'::regclass and contype = 'u' and conname = 'checklist_items_display_order_key'
  ) then
    alter table public.checklist_items add constraint checklist_items_display_order_key unique (display_order);
  end if;
end $$;
alter table public.checklist_items enable row level security;
drop policy if exists "Public can read checklist items" on public.checklist_items;
create policy "Public can read checklist items" on public.checklist_items for select using (true);

-- ── Checklist Completions ────────────────────────────────────
create table if not exists public.checklist_completions (
  id                uuid        default gen_random_uuid() primary key,
  user_id           uuid        not null references auth.users(id) on delete cascade,
  checklist_item_id uuid        not null references public.checklist_items(id) on delete cascade,
  is_completed      boolean     not null default false,
  completed_at      timestamptz,
  unique(user_id, checklist_item_id)
);
alter table public.checklist_completions enable row level security;
drop policy if exists "Users manage own completions" on public.checklist_completions;
create policy "Users manage own completions" on public.checklist_completions for all using (auth.uid() = user_id);

-- ── Activity Log ─────────────────────────────────────────────
create table if not exists public.activity_log (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  icon        text        not null default '📌',
  description text        not null,
  created_at  timestamptz default now()
);
alter table public.activity_log enable row level security;
drop policy if exists "Users manage own activity" on public.activity_log;
create policy "Users manage own activity" on public.activity_log for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.regulatory_updates (title, summary, source_agency, update_type, published_date, is_legislative) values
  ('DCF Updates Background Screening Requirements for Childcare Workers', 'Effective April 1, 2026, all childcare facility employees must complete updated Level 2 background screening through the Care Provider Background Screening Clearinghouse. Existing employees must rescreen by June 30, 2026.', 'DCF', 'Rule Change', '2026-03-15', false),
  ('New Health Screening Protocols for Early Learning Programs', 'The Florida Department of Health has released updated daily health screening protocols for childcare facilities, including revised symptom checklists and reporting requirements for communicable disease.', 'DOH', 'Guidance', '2026-03-12', false),
  ('OEL Announces New Quality Standards for VPK Providers', 'Florida''s Office of Early Learning published new quality standards affecting VPK provider evaluations beginning in the 2026–2027 program year. Providers should review Section 4 requirements.', 'OEL', 'Advisory', '2026-03-08', false),
  ('Fire Safety Inspection Frequency Change for Small Facilities', 'Small childcare facilities under 25 children may qualify for biennial fire safety inspections under the revised Florida Fire Prevention Code effective July 1, 2026.', 'Fire Marshal', 'Rule Change', '2026-02-28', false),
  ('SB 218: Childcare Workforce Compensation Act', 'Senate Bill 218 proposes increased state funding for childcare worker wages and updated licensing requirements for facilities receiving state subsidies. Currently in committee.', 'Florida Legislature', 'Advisory', '2026-02-14', true)
on conflict do nothing;

insert into public.checklist_items (category, item_text, display_order, tier_required) values
  ('Facility Safety', 'Fire extinguisher inspected and current', 1, 'free'),
  ('Facility Safety', 'Emergency exits clearly marked and unobstructed', 2, 'free'),
  ('Facility Safety', 'First aid kit fully stocked and accessible', 3, 'free'),
  ('Facility Safety', 'Smoke detectors tested and functional', 4, 'free'),
  ('Staff Records', 'Background screenings on file for all staff', 5, 'free'),
  ('Staff Records', 'CPR/First Aid certifications current', 6, 'free'),
  ('Staff Records', 'Staff-to-child ratios posted in each room', 7, 'free'),
  ('Staff Records', 'Training hours documented per staff member', 8, 'free'),
  ('Child Records', 'Enrollment forms complete for all children', 9, 'free'),
  ('Child Records', 'Immunization records on file and current', 10, 'free'),
  ('Child Records', 'Emergency contacts current for all families', 11, 'free'),
  ('Child Records', 'Daily attendance records maintained', 12, 'free'),
  ('Health & Sanitation', 'Handwashing procedures posted at all sinks', 13, 'free'),
  ('Health & Sanitation', 'Cleaning and sanitation schedule maintained', 14, 'free'),
  ('Health & Sanitation', 'Food handling permits current', 15, 'free'),
  ('Health & Sanitation', 'Medication administration log up to date', 16, 'free'),
  ('Program Operations', 'Daily schedule posted in each classroom', 17, 'free'),
  ('Program Operations', 'Transportation records current (if applicable)', 18, 'free'),
  ('Program Operations', 'Field trip permissions on file', 19, 'free'),
  ('Program Operations', 'Incident/accident reports properly filed', 20, 'free')
on conflict (display_order) do nothing;
