-- Allow coaches to update existing team results (needed for filling placement/competitors in pre-created team rows)
DROP POLICY IF EXISTS "Coach can update team results" ON public.team_competition_results;

CREATE POLICY "Coach can update team results"
ON public.team_competition_results
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'coach'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'coach'::public.app_role));