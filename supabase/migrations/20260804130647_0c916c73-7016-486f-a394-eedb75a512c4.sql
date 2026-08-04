-- Restrict public reads to authenticated users
DROP POLICY IF EXISTS "Anyone can read members" ON public.members;
CREATE POLICY "Authenticated can read members" ON public.members
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read member entries" ON public.member_competition_entries;
CREATE POLICY "Authenticated can read member entries" ON public.member_competition_entries
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read team results" ON public.team_competition_results;
CREATE POLICY "Authenticated can read team results" ON public.team_competition_results
  FOR SELECT TO authenticated USING (true);

-- Scope coach policies to authenticated role
DROP POLICY IF EXISTS "Coach can update member entries" ON public.member_competition_entries;
CREATE POLICY "Coach can update member entries" ON public.member_competition_entries
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));

DROP POLICY IF EXISTS "Coach can delete member entries" ON public.member_competition_entries;
CREATE POLICY "Coach can delete member entries" ON public.member_competition_entries
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'coach'::app_role));

-- Remove anon SELECT grants where no anon policy remains
REVOKE SELECT ON public.members FROM anon;
REVOKE SELECT ON public.member_competition_entries FROM anon;
REVOKE SELECT ON public.team_competition_results FROM anon;

-- SECURITY DEFINER functions should not be callable from the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_member_medals() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_intent_to_entry() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
