
DO $$
DECLARE old_id uuid := 'aa4f62da-d0f6-4c03-bc62-a3666783552a';
        new_id uuid := 'f29b8daf-2e4d-46b7-b5b4-4af8e45cdd62';
BEGIN
  UPDATE public.competition_results r SET member_id = new_id
   WHERE member_id = old_id
     AND NOT EXISTS (SELECT 1 FROM public.competition_results r2
                     WHERE r2.member_id = new_id AND r2.competition_id = r.competition_id
                       AND r2.discipline = r.discipline AND r2.category IS NOT DISTINCT FROM r.category);
  DELETE FROM public.competition_results WHERE member_id = old_id;

  UPDATE public.member_competition_entries e SET member_id = new_id
   WHERE member_id = old_id
     AND NOT EXISTS (SELECT 1 FROM public.member_competition_entries e2
                     WHERE e2.member_id = new_id AND e2.competition_id = e.competition_id);
  DELETE FROM public.member_competition_entries WHERE member_id = old_id;

  UPDATE public.member_competition_categories c SET member_id = new_id
   WHERE member_id = old_id
     AND NOT EXISTS (SELECT 1 FROM public.member_competition_categories c2
                     WHERE c2.member_id = new_id AND c2.competition_id = c.competition_id
                       AND c2.discipline = c.discipline AND c2.category = c.category);
  DELETE FROM public.member_competition_categories WHERE member_id = old_id;

  UPDATE public.member_competition_intents i SET member_id = new_id
   WHERE member_id = old_id
     AND NOT EXISTS (SELECT 1 FROM public.member_competition_intents i2
                     WHERE i2.member_id = new_id AND i2.competition_id = i.competition_id);
  DELETE FROM public.member_competition_intents WHERE member_id = old_id;

  UPDATE public.exercise_notes SET member_id = new_id WHERE member_id = old_id;
  UPDATE public.workout_plans SET member_id = new_id WHERE member_id = old_id;
  UPDATE public.workout_sessions SET member_id = new_id WHERE member_id = old_id;

  DELETE FROM public.members WHERE id = old_id;

  UPDATE public.members
     SET meno = btrim(meno), priezvisko = btrim(priezvisko),
         kata = true
   WHERE id = new_id;
END $$;

UPDATE public.members SET meno = btrim(meno), priezvisko = btrim(priezvisko)
 WHERE meno <> btrim(meno) OR priezvisko <> btrim(priezvisko);
