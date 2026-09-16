GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;
GRANT ALL ON public.push_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_reminders TO authenticated;
GRANT ALL ON public.scheduled_reminders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_prefs TO authenticated;
GRANT ALL ON public.notification_prefs TO service_role;

CREATE POLICY "Pouzivatel obnovuje svoje zariadenia"
ON public.push_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);