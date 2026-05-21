-- Add email column to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email text;
CREATE UNIQUE INDEX IF NOT EXISTS members_email_unique_idx ON public.members (lower(email)) WHERE email IS NOT NULL;

-- Update handle_new_user to auto-link members by email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');

  -- Auto-link existing member by email (case-insensitive)
  UPDATE public.members
    SET user_id = NEW.id
    WHERE user_id IS NULL
      AND email IS NOT NULL
      AND lower(email) = lower(NEW.email);

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();