ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS is_competitor boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_trainee boolean NOT NULL DEFAULT true;