
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meno text NOT NULL DEFAULT '',
  priezvisko text NOT NULL DEFAULT '',
  stupen text NOT NULL DEFAULT '',
  datum_narodenia date,
  vyska numeric,
  vaha numeric,
  kata boolean NOT NULL DEFAULT false,
  kobudo boolean NOT NULL DEFAULT false,
  kumite boolean NOT NULL DEFAULT false,
  zlato integer NOT NULL DEFAULT 0,
  striebro integer NOT NULL DEFAULT 0,
  bronz integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Admin can insert members" ON public.members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update members" ON public.members FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete members" ON public.members FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.member_competition_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  registered boolean NOT NULL DEFAULT true,
  UNIQUE(member_id, competition_id)
);

ALTER TABLE public.member_competition_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read member entries" ON public.member_competition_entries FOR SELECT USING (true);
CREATE POLICY "Admin can insert member entries" ON public.member_competition_entries FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update member entries" ON public.member_competition_entries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete member entries" ON public.member_competition_entries FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
