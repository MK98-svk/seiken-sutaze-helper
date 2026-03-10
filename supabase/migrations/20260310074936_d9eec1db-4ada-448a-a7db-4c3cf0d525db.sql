
-- Allow users to insert results for their own members
CREATE POLICY "Owner can insert results for own members"
ON public.competition_results
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = member_id
    AND members.user_id = auth.uid()
  )
);

-- Allow users to delete results they created for their own members
CREATE POLICY "Owner can delete results for own members"
ON public.competition_results
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = member_id
    AND members.user_id = auth.uid()
  )
);
