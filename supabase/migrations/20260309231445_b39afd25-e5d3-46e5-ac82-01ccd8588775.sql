
CREATE OR REPLACE FUNCTION public.recalculate_member_medals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _member_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _member_id := OLD.member_id;
  ELSE
    _member_id := NEW.member_id;
  END IF;

  UPDATE members SET
    zlato = (SELECT COUNT(*) FROM competition_results WHERE member_id = _member_id AND placement = 1),
    striebro = (SELECT COUNT(*) FROM competition_results WHERE member_id = _member_id AND placement = 2),
    bronz = (SELECT COUNT(*) FROM competition_results WHERE member_id = _member_id AND placement = 3)
  WHERE id = _member_id;

  IF TG_OP = 'UPDATE' AND OLD.member_id IS DISTINCT FROM NEW.member_id THEN
    UPDATE members SET
      zlato = (SELECT COUNT(*) FROM competition_results WHERE member_id = OLD.member_id AND placement = 1),
      striebro = (SELECT COUNT(*) FROM competition_results WHERE member_id = OLD.member_id AND placement = 2),
      bronz = (SELECT COUNT(*) FROM competition_results WHERE member_id = OLD.member_id AND placement = 3)
    WHERE id = OLD.member_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recalculate_medals
AFTER INSERT OR UPDATE OR DELETE ON public.competition_results
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_member_medals();
