-- ryux — waitlist (Tahap 2 PRD: "Formulir waitlist menyimpan email").
-- RLS aktif sejak tabel dibuat: siapa pun boleh mendaftar (insert), tidak ada baca publik.
-- Email peserta bukan konsumsi publik; hanya staff yang boleh membacanya.

create table waitlist (
  id uuid primary key default gen_random_uuid (),
  email text not null unique,
  source text,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

alter table waitlist enable row level security;

-- Pendaftaran publik: boleh insert, tidak boleh select (cegah enumerasi email).
create policy waitlist_public_insert on waitlist for insert
with
  check (true);

create policy waitlist_staff_read on waitlist for
select
  using (public.is_staff ());

grant insert on waitlist to anon,
authenticated;
