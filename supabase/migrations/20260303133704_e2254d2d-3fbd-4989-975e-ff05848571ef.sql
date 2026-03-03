
-- Add user_id column to members to link a member record to an auth user
ALTER TABLE public.members ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Allow members to update their own record (height, weight, disciplines)
CREATE POLICY "Member can update own record"
ON public.members
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
