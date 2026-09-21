CREATE POLICY "Member can insert own entry" ON public.member_competition_entries
FOR INSERT TO authenticated
WITH CHECK (
  private.has_role(auth.uid(), 'coach'::app_role)
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
);

CREATE POLICY "Member can update own entry" ON public.member_competition_entries
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
);