-- lovable-cron-fallback-reviewed: 1440 runs/day; minute-level reminder delivery for rest timers and training reminders
select cron.unschedule('process-reminders');
select cron.schedule('process-reminders', '* * * * *', $$
  select net.http_post(
    url := 'https://jikdnhoehahlhkcldcci.supabase.co/functions/v1/process-reminders',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','260cc976c1af50757fedee6afd9b9d6b259ff59c7f38a1cc'),
    body := '{}'::jsonb
  );
$$);