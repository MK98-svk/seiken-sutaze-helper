-- Allow authenticated users to insert their own member record
CREATE POLICY "Authenticated can insert own member"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
