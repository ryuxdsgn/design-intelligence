-- View datar untuk dikonsumsi tool MCP. security_invoker = true agar RLS tabel dasar tetap
-- berlaku (anon hanya melihat konten 'published'). Bentuknya mencerminkan tipe Screen/LocalPattern
-- di @ryux/core.

create view public.screens_flat
with (security_invoker = true) as
select
  s.id as screen_id,
  a.name as app_name,
  a.category as app_category,
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
  s.ocr_text as ocr
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

create view public.local_patterns_flat
with (security_invoker = true) as
select
  lp.slug as slug,
  lp.name as name,
  lp.description as description,
  lp.user_behavior_notes as user_behavior_notes,
  coalesce(
    (
      select array_agg(distinct st.screen_id)
      from screen_tags st
      join tags t on t.id = st.tag_id
      where t.slug = lp.slug
    ),
    '{}'
  ) as example_screen_ids
from local_patterns lp;

grant select on public.screens_flat to anon, authenticated;
grant select on public.local_patterns_flat to anon, authenticated;
