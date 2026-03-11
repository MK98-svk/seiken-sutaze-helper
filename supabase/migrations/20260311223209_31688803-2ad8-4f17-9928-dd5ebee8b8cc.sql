
-- Add num_competitors to individual results
ALTER TABLE public.competition_results ADD COLUMN num_competitors integer DEFAULT NULL;

-- Create team competition results table
CREATE TABLE public.team_competition_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  discipline text NOT NULL,
  category text,
  placement integer,
  num_competitors integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.team_competition_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read team results" ON public.team_competition_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert team results" ON public.team_competition_results FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can update team results" ON public.team_competition_results FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin can delete team results" ON public.team_competition_results FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
