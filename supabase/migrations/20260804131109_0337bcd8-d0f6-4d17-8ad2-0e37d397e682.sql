UPDATE public.members m
SET user_id = u.id
FROM auth.users u
WHERE m.email IS NOT NULL
  AND m.user_id IS NULL
  AND lower(m.email) = lower(u.email);