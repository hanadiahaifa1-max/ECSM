-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add new columns to pipeline_entries
ALTER TABLE public.pipeline_entries
ADD COLUMN IF NOT EXISTS presales_lob text,
ADD COLUMN IF NOT EXISTS contract_period integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS telkom_si text DEFAULT 'Telkom',
ADD COLUMN IF NOT EXISTS bespoke_project boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS project_id text,
ADD COLUMN IF NOT EXISTS po_release_date date,
ADD COLUMN IF NOT EXISTS attachment_url text;

-- Update RLS policies for pipeline_entries to support admin access
DROP POLICY IF EXISTS "Authenticated users can view all pipeline entries" ON public.pipeline_entries;

CREATE POLICY "Users can view own entries or admins view all"
ON public.pipeline_entries FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- Trigger to auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();