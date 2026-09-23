-- ryux — migrasi awal (skema penuh PRD). RLS aktif untuk SETIAP tabel sejak migrasi pertama.
-- Prinsip: publik/agent hanya membaca konten berstatus 'published'. Tabel billing hanya
-- dibaca pemiliknya; penulisannya lewat service role (bypass RLS).

-- ── Enum ─────────────────────────────────────────────────────────────────────
create type content_status as enum ('draft', 'in_review', 'published');
create type content_target as enum ('app', 'flow', 'screen');
create type tag_layer as enum ('category', 'flow_type', 'pattern', 'component');
create type tag_source as enum ('ai', 'human');
create type account_role as enum ('user', 'reviewer', 'admin');

-- ── Content library ──────────────────────────────────────────────────────────
create table apps (
  id text primary key,
  name text not null,
  category text not null,
  platform text,
  publisher text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table app_versions (
  id text primary key,
  app_id text not null references apps (id) on delete cascade,
  version text not null,
  captured_at date,
  device text,
  created_at timestamptz not null default now()
);

create table flows (
  id text primary key,
  app_version_id text not null references app_versions (id) on delete cascade,
  flow_type text not null,
  title text,
  step_count int,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table screens (
  id text primary key,
  flow_id text not null references flows (id) on delete cascade,
  position int not null,
  image_path text,
  width int,
  height int,
  ocr_text text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table tags (
  id text primary key,
  layer tag_layer not null,
  slug text not null,
  label text,
  unique (layer, slug)
);

create table screen_tags (
  screen_id text not null references screens (id) on delete cascade,
  tag_id text not null references tags (id) on delete cascade,
  source tag_source not null default 'human',
  confidence numeric,
  primary key (screen_id, tag_id)
);

create table designer_notes (
  id text primary key,
  target_type content_target not null,
  target_id text not null,
  why_it_works text,
  weaknesses text,
  local_context text,
  author text,
  created_at timestamptz not null default now()
);

create table local_patterns (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  user_behavior_notes text,
  created_at timestamptz not null default now()
);

create table reviews (
  id text primary key,
  target_type content_target not null,
  target_id text not null,
  reviewer uuid,
  decision text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table takedown_requests (
  id text primary key,
  requester text,
  app_id text references apps (id) on delete set null,
  reason text,
  status text not null default 'open',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Akun & billing ───────────────────────────────────────────────────────────
create table plans (
  id text primary key,
  slug text not null unique,
  monthly_credits int not null default 0,
  price_idr int,
  active boolean not null default false
);

create table plan_features (
  plan_id text not null references plans (id) on delete cascade,
  feature_key text not null,
  limit_value text,
  primary key (plan_id, feature_key)
);

create table accounts (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan_id text references plans (id),
  role account_role not null default 'user',
  early_adopter boolean not null default false,
  created_at timestamptz not null default now()
);

create table credit_ledger (
  id text primary key,
  account_id uuid not null references accounts (id) on delete cascade,
  delta int not null,
  reason text,
  ref_event_id text,
  created_at timestamptz not null default now()
);

create table usage_events (
  id text primary key,
  account_id uuid not null references accounts (id) on delete cascade,
  tool text not null,
  credits int not null default 0,
  status text,
  latency_ms int,
  created_at timestamptz not null default now()
);

create table api_clients (
  id text primary key,
  account_id uuid not null references accounts (id) on delete cascade,
  client_name text,
  oauth_client_id text,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id text primary key,
  account_id uuid not null references accounts (id) on delete cascade,
  provider text,
  provider_ref text,
  status text,
  period_end timestamptz,
  created_at timestamptz not null default now()
);

create table invoices (
  id text primary key,
  account_id uuid not null references accounts (id) on delete cascade,
  amount_idr int,
  status text,
  provider_ref text,
  created_at timestamptz not null default now()
);

create table data_reports (
  id text primary key,
  account_id uuid references accounts (id) on delete set null,
  target_type content_target not null,
  target_id text not null,
  reason text,
  note text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- ── Indeks ───────────────────────────────────────────────────────────────────
create index on app_versions (app_id);
create index on flows (app_version_id);
create index on screens (flow_id);
create index on screen_tags (tag_id);
create index on designer_notes (target_type, target_id);
create index on credit_ledger (account_id);
create index on usage_events (account_id);

-- ── Fungsi bantu (security definer agar tidak memicu rekursi RLS) ─────────────
create or replace function public.is_staff ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'reviewer') from public.accounts where user_id = auth.uid() limit 1),
    false
  );
$$;

create or replace function public.my_account_ids ()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.accounts where user_id = auth.uid();
$$;

-- ── RLS: aktifkan di SEMUA tabel ─────────────────────────────────────────────
alter table apps enable row level security;
alter table app_versions enable row level security;
alter table flows enable row level security;
alter table screens enable row level security;
alter table tags enable row level security;
alter table screen_tags enable row level security;
alter table designer_notes enable row level security;
alter table local_patterns enable row level security;
alter table reviews enable row level security;
alter table takedown_requests enable row level security;
alter table plans enable row level security;
alter table plan_features enable row level security;
alter table accounts enable row level security;
alter table credit_ledger enable row level security;
alter table usage_events enable row level security;
alter table api_clients enable row level security;
alter table subscriptions enable row level security;
alter table invoices enable row level security;
alter table data_reports enable row level security;

-- Content: publik baca hanya 'published'; staff (admin/reviewer) baca & kelola semua.
create policy apps_public_read on apps for select using (status = 'published');
create policy apps_staff_all on apps for all using (public.is_staff ()) with check (public.is_staff ());

create policy app_versions_public_read on app_versions for select using (
  exists (select 1 from apps a where a.id = app_versions.app_id and a.status = 'published')
);
create policy app_versions_staff_all on app_versions for all using (public.is_staff ()) with check (public.is_staff ());

create policy flows_public_read on flows for select using (status = 'published');
create policy flows_staff_all on flows for all using (public.is_staff ()) with check (public.is_staff ());

create policy screens_public_read on screens for select using (status = 'published');
create policy screens_staff_all on screens for all using (public.is_staff ()) with check (public.is_staff ());

create policy screen_tags_public_read on screen_tags for select using (
  exists (select 1 from screens s where s.id = screen_tags.screen_id and s.status = 'published')
);
create policy screen_tags_staff_all on screen_tags for all using (public.is_staff ()) with check (public.is_staff ());

create policy designer_notes_public_read on designer_notes for select using (
  (target_type = 'flow' and exists (select 1 from flows f where f.id = designer_notes.target_id and f.status = 'published'))
  or (target_type = 'screen' and exists (select 1 from screens s where s.id = designer_notes.target_id and s.status = 'published'))
);
create policy designer_notes_staff_all on designer_notes for all using (public.is_staff ()) with check (public.is_staff ());

-- Kosakata referensi: publik baca; staff kelola.
create policy tags_public_read on tags for select using (true);
create policy tags_staff_all on tags for all using (public.is_staff ()) with check (public.is_staff ());

create policy local_patterns_public_read on local_patterns for select using (true);
create policy local_patterns_staff_all on local_patterns for all using (public.is_staff ()) with check (public.is_staff ());

-- Reviews: hanya staff.
create policy reviews_staff_all on reviews for all using (public.is_staff ()) with check (public.is_staff ());

-- Takedown: siapa saja boleh mengajukan; hanya staff yang membaca/mengelola.
create policy takedown_insert on takedown_requests for insert with check (true);
create policy takedown_staff_all on takedown_requests for all using (public.is_staff ()) with check (public.is_staff ());

-- Plans: publik baca (info harga); staff kelola.
create policy plans_public_read on plans for select using (true);
create policy plans_staff_all on plans for all using (public.is_staff ()) with check (public.is_staff ());
create policy plan_features_public_read on plan_features for select using (true);
create policy plan_features_staff_all on plan_features for all using (public.is_staff ()) with check (public.is_staff ());

-- Accounts: pemilik baca & perbarui dirinya; staff baca semua.
create policy accounts_self_read on accounts for select using (user_id = auth.uid ());
create policy accounts_self_update on accounts for update using (user_id = auth.uid ()) with check (user_id = auth.uid ());
create policy accounts_staff_read on accounts for select using (public.is_staff ());

-- Ledger & usage: pemilik baca; penulisan lewat service role (tanpa policy write).
create policy credit_ledger_owner_read on credit_ledger for select using (account_id in (select public.my_account_ids ()));
create policy usage_events_owner_read on usage_events for select using (account_id in (select public.my_account_ids ()));

-- Klien API: pemilik baca & cabut.
create policy api_clients_owner_read on api_clients for select using (account_id in (select public.my_account_ids ()));
create policy api_clients_owner_update on api_clients for update using (account_id in (select public.my_account_ids ())) with check (account_id in (select public.my_account_ids ()));

-- Billing: pemilik baca (kosong selama gratis).
create policy subscriptions_owner_read on subscriptions for select using (account_id in (select public.my_account_ids ()));
create policy invoices_owner_read on invoices for select using (account_id in (select public.my_account_ids ()));

-- Laporan data: pemilik boleh mengajukan & membaca miliknya; staff membaca semua.
create policy data_reports_insert on data_reports for insert with check (account_id in (select public.my_account_ids ()));
create policy data_reports_owner_read on data_reports for select using (account_id in (select public.my_account_ids ()));
create policy data_reports_staff_all on data_reports for all using (public.is_staff ()) with check (public.is_staff ());

-- ── Hak akses peran Supabase (RLS tetap menyaring baris) ─────────────────────
grant usage on schema public to anon, authenticated;
grant execute on function public.is_staff () to anon, authenticated;
grant execute on function public.my_account_ids () to anon, authenticated;

-- Publik/agent: konten, kosakata, dan info paket.
grant select on apps, app_versions, flows, screens, screen_tags, designer_notes, tags, local_patterns, plans, plan_features
  to anon, authenticated;
grant insert on takedown_requests to anon, authenticated;

-- Pengguna login: tabel akun & billing (RLS membatasi ke pemilik).
grant select on accounts, credit_ledger, usage_events, api_clients, subscriptions, invoices, reviews, takedown_requests, data_reports
  to authenticated;
grant insert on data_reports to authenticated;
grant update on accounts, api_clients to authenticated;

-- Service role: penuh (pipeline, meter usage & ledger). Service role mem-bypass RLS.
grant all on all tables in schema public to service_role;
