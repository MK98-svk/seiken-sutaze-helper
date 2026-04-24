-- 1. Move categories from duplicate Erdelský to original (skip if duplicate already exists)
INSERT INTO public.member_competition_categories (member_id, competition_id, discipline, category)
SELECT '9f5a9a6b-4008-48aa-9395-2a8dd6b02a14', competition_id, discipline, category
FROM public.member_competition_categories
WHERE member_id = 'e8e408db-a1ca-4777-b732-ec2afffa70c3'
ON CONFLICT DO NOTHING;

-- Move entries from duplicate Erdelský
INSERT INTO public.member_competition_entries (member_id, competition_id, registered)
SELECT '9f5a9a6b-4008-48aa-9395-2a8dd6b02a14', competition_id, registered
FROM public.member_competition_entries
WHERE member_id = 'e8e408db-a1ca-4777-b732-ec2afffa70c3'
ON CONFLICT DO NOTHING;

-- Delete duplicate Erdelský's children, then the member
DELETE FROM public.member_competition_categories WHERE member_id = 'e8e408db-a1ca-4777-b732-ec2afffa70c3';
DELETE FROM public.member_competition_entries WHERE member_id = 'e8e408db-a1ca-4777-b732-ec2afffa70c3';
DELETE FROM public.competition_results WHERE member_id = 'e8e408db-a1ca-4777-b732-ec2afffa70c3';
DELETE FROM public.members WHERE id = 'e8e408db-a1ca-4777-b732-ec2afffa70c3';

-- 2. Same for duplicate Lia Pizano
INSERT INTO public.member_competition_categories (member_id, competition_id, discipline, category)
SELECT '510a76b1-96a2-40c1-ac5f-292cde5003d6', competition_id, discipline, category
FROM public.member_competition_categories
WHERE member_id = '2dcd2e5d-9dee-48ff-9431-7c16b6ac5c12'
ON CONFLICT DO NOTHING;

INSERT INTO public.member_competition_entries (member_id, competition_id, registered)
SELECT '510a76b1-96a2-40c1-ac5f-292cde5003d6', competition_id, registered
FROM public.member_competition_entries
WHERE member_id = '2dcd2e5d-9dee-48ff-9431-7c16b6ac5c12'
ON CONFLICT DO NOTHING;

DELETE FROM public.member_competition_categories WHERE member_id = '2dcd2e5d-9dee-48ff-9431-7c16b6ac5c12';
DELETE FROM public.member_competition_entries WHERE member_id = '2dcd2e5d-9dee-48ff-9431-7c16b6ac5c12';
DELETE FROM public.competition_results WHERE member_id = '2dcd2e5d-9dee-48ff-9431-7c16b6ac5c12';
DELETE FROM public.members WHERE id = '2dcd2e5d-9dee-48ff-9431-7c16b6ac5c12';

-- 3. Add unique index to prevent future duplicates
-- Use lower() for case-insensitive matching, COALESCE for null DOB
CREATE UNIQUE INDEX IF NOT EXISTS members_unique_name_dob_idx
  ON public.members (
    lower(trim(meno)),
    lower(trim(priezvisko)),
    COALESCE(datum_narodenia, '1900-01-01'::date)
  );