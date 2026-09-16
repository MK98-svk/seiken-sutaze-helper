ALTER TABLE public.workout_sets
ADD COLUMN IF NOT EXISTS exercise_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS workout_sets_session_exercise_order_idx
ON public.workout_sets (session_id, exercise_order, set_number);