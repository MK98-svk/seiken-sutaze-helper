
CREATE POLICY "Coach can update member entries"
ON public.member_competition_entries
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Coach can delete member entries"
ON public.member_competition_entries
FOR DELETE
TO public
USING (has_role(auth.uid(), 'coach'::app_role));
