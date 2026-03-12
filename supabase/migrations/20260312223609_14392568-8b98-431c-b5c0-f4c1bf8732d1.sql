-- Allow coach to insert members (for creating unmatched members during import)
CREATE POLICY "Coach can insert members"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'coach'::app_role));
