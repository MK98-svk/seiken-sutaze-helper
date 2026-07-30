CREATE TABLE public.workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  performed_at date NOT NULL DEFAULT CURRENT_DATE,
  mode text NOT NULL,
  goal text,
  title text,
  duration_min integer,
  note text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id text NOT NULL,
  exercise_name text NOT NULL,
  muscle_group text,
  set_number integer NOT NULL DEFAULT 1,
  weight numeric,
  reps integer,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  mode text NOT NULL,
  goal text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_sessions_member ON public.workout_sessions(member_id, performed_at DESC);
CREATE INDEX idx_workout_sets_session ON public.workout_sets(session_id);
CREATE INDEX idx_workout_plans_member ON public.workout_plans(member_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sessions TO authenticated;
GRANT ALL ON public.workout_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_sets TO authenticated;
GRANT ALL ON public.workout_sets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT ALL ON public.workout_plans TO service_role;

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner or staff can read sessions" ON public.workout_sessions
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_sessions.member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Owner or staff can insert sessions" ON public.workout_sessions
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_sessions.member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Owner or staff can update sessions" ON public.workout_sessions
FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_sessions.member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Owner or staff can delete sessions" ON public.workout_sessions
FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_sessions.member_id AND m.user_id = auth.uid())
);

CREATE POLICY "Owner or staff can read sets" ON public.workout_sets
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.workout_sessions s JOIN public.members m ON m.id = s.member_id
          WHERE s.id = workout_sets.session_id
            AND (m.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')))
);
CREATE POLICY "Owner or staff can insert sets" ON public.workout_sets
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.workout_sessions s JOIN public.members m ON m.id = s.member_id
          WHERE s.id = workout_sets.session_id
            AND (m.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')))
);
CREATE POLICY "Owner or staff can update sets" ON public.workout_sets
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.workout_sessions s JOIN public.members m ON m.id = s.member_id
          WHERE s.id = workout_sets.session_id
            AND (m.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')))
);
CREATE POLICY "Owner or staff can delete sets" ON public.workout_sets
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.workout_sessions s JOIN public.members m ON m.id = s.member_id
          WHERE s.id = workout_sets.session_id
            AND (m.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')))
);

CREATE POLICY "Owner or staff can read plans" ON public.workout_plans
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_plans.member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Owner or staff can insert plans" ON public.workout_plans
FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_plans.member_id AND m.user_id = auth.uid())
);
CREATE POLICY "Owner or staff can delete plans" ON public.workout_plans
FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coach')
  OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = workout_plans.member_id AND m.user_id = auth.uid())
);

CREATE TRIGGER trg_workout_sessions_updated_at
BEFORE UPDATE ON public.workout_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();