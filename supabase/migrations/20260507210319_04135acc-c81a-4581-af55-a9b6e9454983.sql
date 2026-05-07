
CREATE TABLE public.member_competition_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL,
  competition_id UUID NOT NULL,
  kata BOOLEAN NOT NULL DEFAULT false,
  kata_goju BOOLEAN NOT NULL DEFAULT false,
  kata_open BOOLEAN NOT NULL DEFAULT false,
  kobudo BOOLEAN NOT NULL DEFAULT false,
  kumite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (member_id, competition_id)
);

ALTER TABLE public.member_competition_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read intents"
ON public.member_competition_intents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin coach owner can insert intents"
ON public.member_competition_intents FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'coach'::app_role)
  OR EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.user_id = auth.uid())
);

CREATE POLICY "Admin coach owner can update intents"
ON public.member_competition_intents FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'coach'::app_role)
  OR EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.user_id = auth.uid())
);

CREATE POLICY "Admin coach owner can delete intents"
ON public.member_competition_intents FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'coach'::app_role)
  OR EXISTS (SELECT 1 FROM members WHERE members.id = member_id AND members.user_id = auth.uid())
);

CREATE TRIGGER trg_intents_updated_at
BEFORE UPDATE ON public.member_competition_intents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-mark member as registered for the competition when intent is saved
CREATE OR REPLACE FUNCTION public.sync_intent_to_entry()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.member_competition_entries (member_id, competition_id, registered)
  VALUES (NEW.member_id, NEW.competition_id, true)
  ON CONFLICT DO NOTHING;
  -- if existing entry, ensure registered = true
  UPDATE public.member_competition_entries
    SET registered = true
    WHERE member_id = NEW.member_id AND competition_id = NEW.competition_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_intent_sync_entry
AFTER INSERT OR UPDATE ON public.member_competition_intents
FOR EACH ROW EXECUTE FUNCTION public.sync_intent_to_entry();

ALTER PUBLICATION supabase_realtime ADD TABLE public.member_competition_intents;
