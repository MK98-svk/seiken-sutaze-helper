
-- 1. Owner can UPDATE their own individual results
CREATE POLICY "Owner can update results for own members"
ON public.competition_results
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = competition_results.member_id
      AND members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE members.id = competition_results.member_id
      AND members.user_id = auth.uid()
  )
);

-- 2. Registered members can INSERT team results (for competitions they're registered in)
CREATE POLICY "Member can insert team results for own competitions"
ON public.team_competition_results
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM member_competition_entries mce
    JOIN members m ON m.id = mce.member_id
    WHERE mce.competition_id = team_competition_results.competition_id
      AND m.user_id = auth.uid()
      AND mce.registered = true
  )
);

-- 3. Registered members can UPDATE team results (for competitions they're registered in)
CREATE POLICY "Member can update team results for own competitions"
ON public.team_competition_results
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM member_competition_entries mce
    JOIN members m ON m.id = mce.member_id
    WHERE mce.competition_id = team_competition_results.competition_id
      AND m.user_id = auth.uid()
      AND mce.registered = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM member_competition_entries mce
    JOIN members m ON m.id = mce.member_id
    WHERE mce.competition_id = team_competition_results.competition_id
      AND m.user_id = auth.uid()
      AND mce.registered = true
  )
);
