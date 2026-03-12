
-- Allow coach to insert results for any member
CREATE POLICY "Coach can insert results"
ON public.competition_results
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

-- Allow coach to delete results
CREATE POLICY "Coach can delete results"
ON public.competition_results
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'coach'::app_role));

-- Allow coach to insert team results
CREATE POLICY "Coach can insert team results"
ON public.team_competition_results
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

-- Allow coach to update team results
CREATE POLICY "Coach can update team results"
ON public.team_competition_results
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'coach'::app_role));

-- Allow coach to delete team results
CREATE POLICY "Coach can delete team results"
ON public.team_competition_results
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'coach'::app_role));
