-- Coach can delete individual results
CREATE POLICY "Coach can delete results"
ON public.competition_results
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'coach'::app_role));

-- Coach can delete team results
CREATE POLICY "Coach can delete team results"
ON public.team_competition_results
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'coach'::app_role));