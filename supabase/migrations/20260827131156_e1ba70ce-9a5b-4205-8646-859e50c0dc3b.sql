CREATE POLICY "Owner or staff can update plans" ON public.workout_plans
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coach'::app_role) OR EXISTS (
    SELECT 1 FROM public.members m WHERE m.id = workout_plans.member_id AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coach'::app_role) OR EXISTS (
    SELECT 1 FROM public.members m WHERE m.id = workout_plans.member_id AND m.user_id = auth.uid()
  )
);