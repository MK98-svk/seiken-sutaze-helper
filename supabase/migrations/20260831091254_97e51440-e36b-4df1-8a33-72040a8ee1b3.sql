CREATE TABLE public.exercise_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, exercise_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_notes TO authenticated;
GRANT ALL ON public.exercise_notes TO service_role;

ALTER TABLE public.exercise_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or staff can read exercise notes" ON public.exercise_notes
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(),'admin'::app_role) OR private.has_role(auth.uid(),'coach'::app_role) OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = exercise_notes.member_id AND m.user_id = auth.uid()));

CREATE POLICY "Owner or staff can insert exercise notes" ON public.exercise_notes
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(),'admin'::app_role) OR private.has_role(auth.uid(),'coach'::app_role) OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = exercise_notes.member_id AND m.user_id = auth.uid()));

CREATE POLICY "Owner or staff can update exercise notes" ON public.exercise_notes
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(),'admin'::app_role) OR private.has_role(auth.uid(),'coach'::app_role) OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = exercise_notes.member_id AND m.user_id = auth.uid()));

CREATE POLICY "Owner or staff can delete exercise notes" ON public.exercise_notes
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(),'admin'::app_role) OR private.has_role(auth.uid(),'coach'::app_role) OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = exercise_notes.member_id AND m.user_id = auth.uid()));

CREATE TRIGGER trg_exercise_notes_updated_at BEFORE UPDATE ON public.exercise_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();