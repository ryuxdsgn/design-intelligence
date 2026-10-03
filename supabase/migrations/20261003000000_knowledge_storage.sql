-- Ryux Knowledge storage, plus a fix for account self-updates.
--
-- 1. Screen captures live in a private bucket. Staff (admin/reviewer, see public.is_staff) manage
--    objects; everyone else can only read objects that belong to a published screen, which is what
--    createSignedUrl needs. Drafts stay private.
-- 2. accounts_self_update let any signed-in user update their own row, including `role`, so a user
--    could make themselves admin. Users have no column they need to edit, so the policy and the
--    UPDATE grant are removed. Staff manage accounts through the dashboard.

insert into storage.buckets (id, name, public)
values ('screens', 'screens', false)
on conflict (id) do nothing;

create policy screens_objects_staff_all on storage.objects
  for all
  using (bucket_id = 'screens' and public.is_staff ())
  with check (bucket_id = 'screens' and public.is_staff ());

create policy screens_objects_published_read on storage.objects
  for select
  using (
    bucket_id = 'screens'
    and exists (
      select 1
      from public.screens s
      where s.image_path = storage.objects.name
        and s.status = 'published'
    )
  );

drop policy if exists accounts_self_update on public.accounts;
revoke update on public.accounts from authenticated, anon;

-- Pipeline Knowledge menulis sebagai editor (Supabase Auth), bukan service role.
-- GRANT membuka tabel untuk authenticated; RLS *_staff_all tetap membatasi tulis ke staff.
grant insert, update, delete on tags, apps, app_versions, flows, screens, screen_tags, designer_notes
  to authenticated;
