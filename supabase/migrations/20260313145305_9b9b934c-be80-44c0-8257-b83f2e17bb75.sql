-- Enable realtime for competition results and entries tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_competition_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_competition_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.members;

-- Add coach RLS policies for member_competition_entries
CREATE POLICY "Coach can insert member entries"
  ON public.member_competition_entries FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Coach can update member entries"
  ON public.member_competition_entries FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'coach'::app_role));

CREATE POLICY "Coach can delete member entries"
  ON public.member_competition_entries FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'coach'::app_role));