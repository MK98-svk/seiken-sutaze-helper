DROP POLICY IF EXISTS "Anyone can read team results" ON public.team_competition_results;

CREATE POLICY "Anyone can read team results"
ON public.team_competition_results
FOR SELECT
TO public
USING (true);