-- RYUX Knowledge sebagai reference intelligence: observations (apa yang terlihat di screen/flow)
-- dan patterns (pola lokal maupun umum, dengan kapan berguna, risikonya, dan di mana teramati).
-- Observations bukan catatan desainer: draft boleh dari AI (source 'ai'), manusia memutuskan saat
-- review. Catatan desainer tetap hanya ditulis manusia.

-- ── Observations ────────────────────────────────────────────────────────────────────────────
create type observation_dimension as enum (
  'layout', 'typography', 'spacing', 'color', 'components', 'hierarchy',
  'navigation', 'interaction', 'content', 'responsive'
);
create type observation_label as enum ('measured', 'observed', 'inferred');

create table observations (
  id text primary key,
  target_type content_target not null check (target_type in ('screen', 'flow')),
  target_id text not null,
  dimension observation_dimension not null,
  statement text not null,
  label observation_label not null default 'observed',
  source tag_source not null default 'ai',
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);
create index on observations (target_type, target_id);

alter table observations enable row level security;

-- Publik hanya melihat observasi published yang targetnya juga published.
create policy observations_public_read on observations for select using (
  status = 'published' and (
    (target_type = 'screen' and exists (select 1 from screens s where s.id = observations.target_id and s.status = 'published'))
    or (target_type = 'flow' and exists (select 1 from flows f where f.id = observations.target_id and f.status = 'published'))
  )
);
create policy observations_staff_all on observations for all using (public.is_staff ()) with check (public.is_staff ());

grant select on observations to anon, authenticated;
grant insert, update, delete on observations to authenticated;

-- ── Patterns (dulu local_patterns) ──────────────────────────────────────────────────────────
drop view if exists public.local_patterns_flat;

alter table local_patterns rename to patterns;
alter policy local_patterns_public_read on patterns rename to patterns_public_read;
alter policy local_patterns_staff_all on patterns rename to patterns_staff_all;

alter table patterns
  add column scope text not null default 'local' check (scope in ('local', 'general')),
  add column useful_when text,
  add column risk text,
  add column context text[] not null default '{}';

grant insert, update, delete on patterns to authenticated;

-- observed_in dihitung dari tag screen, bukan diketik: dengan security_invoker, anon hanya
-- menghitung screen published, jadi angkanya selalu sama dengan bukti yang bisa dibuka.
create view public.patterns_flat
with (security_invoker = true) as
select
  p.slug,
  p.name,
  p.scope,
  p.description,
  p.user_behavior_notes,
  p.useful_when,
  p.risk,
  p.context,
  coalesce(ev.screen_ids, '{}') as observed_in,
  coalesce(ev.apps, '{}') as observed_apps
from patterns p
left join lateral (
  select
    array_agg(distinct st.screen_id) as screen_ids,
    array_agg(distinct a.name) as apps
  from screen_tags st
  join tags t on t.id = st.tag_id and t.layer = 'pattern' and t.slug = p.slug
  join screens s on s.id = st.screen_id
  join flows f on f.id = s.flow_id
  join app_versions av on av.id = f.app_version_id
  join apps a on a.id = av.app_id
) ev on true;

-- Kompatibilitas: bentuk lama untuk klien yang masih membaca local_patterns_flat.
create view public.local_patterns_flat
with (security_invoker = true) as
select slug, name, description, user_behavior_notes, observed_in as example_screen_ids
from public.patterns_flat
where scope = 'local';

grant select on public.patterns_flat to anon, authenticated;
grant select on public.local_patterns_flat to anon, authenticated;

-- ── screens_flat: tambah platform dan observasi published ───────────────────────────────────
drop view if exists public.screens_flat;
create view public.screens_flat
with (security_invoker = true) as
select
  s.id as screen_id,
  a.name as app_name,
  a.category as app_category,
  a.platform as platform,
  av.version as version,
  av.captured_at as captured_at,
  f.id as flow_id,
  f.flow_type as flow_type,
  s.position as position,
  coalesce(
    (
      select array_agg(t.slug order by t.slug)
      from screen_tags st
      join tags t on t.id = st.tag_id
      where st.screen_id = s.id
    ),
    '{}'
  ) as tags,
  s.image_path as image_url,
  dn.why_it_works as why_it_works,
  dn.weaknesses as weaknesses,
  (s.status = 'published') as reviewed,
  s.ocr_text as ocr,
  coalesce(
    (
      select jsonb_agg(jsonb_build_object('dimension', o.dimension, 'label', o.label, 'statement', o.statement) order by o.dimension, o.id)
      from observations o
      where o.target_type = 'screen' and o.target_id = s.id
    ),
    '[]'
  ) as observations
from screens s
join flows f on f.id = s.flow_id
join app_versions av on av.id = f.app_version_id
join apps a on a.id = av.app_id
left join lateral (
  select why_it_works, weaknesses
  from designer_notes
  where target_type = 'screen' and target_id = s.id
  limit 1
) dn on true;

grant select on public.screens_flat to anon, authenticated;
