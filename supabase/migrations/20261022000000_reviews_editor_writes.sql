-- Editor: the personal-data check per screen is a row in reviews (target_type 'screen',
-- decision 'pii_checked', reviewer, reviewed_at). reviews is staff-only, so who checked a screen is
-- never readable by the public, unlike a column on screens. The CLI kept this check in review.md.
--
-- The pipeline and the editor write as the signed-in editor, not the service role: open the table
-- for authenticated; RLS reviews_staff_all still limits every row to staff (public.is_staff).
grant insert, update, delete on reviews to authenticated;
