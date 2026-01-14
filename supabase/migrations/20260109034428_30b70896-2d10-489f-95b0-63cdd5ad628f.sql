-- Add LoB column to profiles table
ALTER TABLE public.profiles
ADD COLUMN lob text;

-- Add full_name column to user_roles table for display
ALTER TABLE public.user_roles
ADD COLUMN full_name text;

-- Update the trigger to also populate user_roles with full_name
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role, full_name)
  VALUES (new.id, 'user', new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$function$;

-- Update handle_new_user to also include lob from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, lob)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'lob');
  RETURN new;
END;
$function$;