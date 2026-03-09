
CREATE TABLE public.competition_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  discipline text NOT NULL,
  category text,
  placement integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_id, member_id, discipline, category)
);

ALTER TABLE public.competition_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read results" ON public.competition_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert results" ON public.competition_results FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update results" ON public.competition_results FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete results" ON public.competition_results FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
