
-- Fix: Change all policies to PERMISSIVE (default behavior, OR logic)
-- Drop restrictive policies and recreate as permissive

-- user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

CREATE POLICY "Authenticated can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- competitions
DROP POLICY IF EXISTS "Anyone can read competitions" ON public.competitions;
DROP POLICY IF EXISTS "Admin can insert competitions" ON public.competitions;
DROP POLICY IF EXISTS "Admin can update competitions" ON public.competitions;
DROP POLICY IF EXISTS "Admin can delete competitions" ON public.competitions;

CREATE POLICY "Anyone can read competitions" ON public.competitions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert competitions" ON public.competitions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update competitions" ON public.competitions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete competitions" ON public.competitions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- competition_entries
DROP POLICY IF EXISTS "Anyone can read entries" ON public.competition_entries;
DROP POLICY IF EXISTS "Owner can insert own entry" ON public.competition_entries;
DROP POLICY IF EXISTS "Owner can update own entry" ON public.competition_entries;
DROP POLICY IF EXISTS "Owner can delete own entry" ON public.competition_entries;

CREATE POLICY "Anyone can read entries" ON public.competition_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can insert own entry" ON public.competition_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update own entry" ON public.competition_entries
  FOR UPDATE TO authenticated USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can delete own entry" ON public.competition_entries
  FOR DELETE TO authenticated USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
