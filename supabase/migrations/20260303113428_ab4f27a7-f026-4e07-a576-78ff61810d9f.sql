
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  meno TEXT NOT NULL DEFAULT '',
  priezvisko TEXT NOT NULL DEFAULT '',
  stupen TEXT NOT NULL DEFAULT '',
  datum_narodenia DATE,
  vyska NUMERIC,
  vaha NUMERIC,
  kata BOOLEAN NOT NULL DEFAULT false,
  kobudo BOOLEAN NOT NULL DEFAULT false,
  kumite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Competitions table
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazov TEXT NOT NULL,
  datum DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Competition entries table
CREATE TABLE public.competition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  registered BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (profile_id, competition_id)
);
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to auto-create profile + member role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===== RLS POLICIES =====

-- user_roles: only admin can manage, users can read own
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles: everyone authenticated can read, owner or admin can update, admin can insert/delete
CREATE POLICY "Authenticated can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- competitions: everyone can read, only admin can create/update/delete
CREATE POLICY "Anyone can read competitions" ON public.competitions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert competitions" ON public.competitions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update competitions" ON public.competitions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete competitions" ON public.competitions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- competition_entries: everyone can read, owner or admin can manage
CREATE POLICY "Anyone can read entries" ON public.competition_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can insert own entry" ON public.competition_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update own entry" ON public.competition_entries
  FOR UPDATE TO authenticated USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can delete own entry" ON public.competition_entries
  FOR DELETE TO authenticated USING (auth.uid() = profile_id OR public.has_role(auth.uid(), 'admin'));
