UPDATE public.members SET user_id = NULL WHERE user_id IN (SELECT id FROM auth.users WHERE lower(email) = 'alexandrahargasova@gmail.com');
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE lower(email) = 'alexandrahargasova@gmail.com');
DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = 'alexandrahargasova@gmail.com');
DELETE FROM auth.users WHERE lower(email) = 'alexandrahargasova@gmail.com';