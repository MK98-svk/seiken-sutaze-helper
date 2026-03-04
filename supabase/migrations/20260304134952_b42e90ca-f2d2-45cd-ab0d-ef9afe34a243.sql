ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_user_id_key;
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);