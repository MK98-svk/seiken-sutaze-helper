-- Remove coach DELETE on competition_results
DROP POLICY IF EXISTS "Coach can delete results" ON public.competition_results;

-- Remove coach INSERT/UPDATE/DELETE on member_competition_entries
DROP POLICY IF EXISTS "Coach can insert member entries" ON public.member_competition_entries;
DROP POLICY IF EXISTS "Coach can update member entries" ON public.member_competition_entries;
DROP POLICY IF EXISTS "Coach can delete member entries" ON public.member_competition_entries;

-- Remove coach UPDATE/DELETE on team_competition_results (keep INSERT)
DROP POLICY IF EXISTS "Coach can update team results" ON public.team_competition_results;
DROP POLICY IF EXISTS "Coach can delete team results" ON public.team_competition_results;

-- Remove coach INSERT on members
DROP POLICY IF EXISTS "Coach can insert members" ON public.members;