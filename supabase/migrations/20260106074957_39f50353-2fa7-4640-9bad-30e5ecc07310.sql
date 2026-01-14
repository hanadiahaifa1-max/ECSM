-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create pipeline_entries table
CREATE TABLE public.pipeline_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  opportunity_name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Leads',
  product_family TEXT,
  pilar TEXT NOT NULL,
  tower TEXT NOT NULL,
  se_name TEXT NOT NULL,
  am_name TEXT NOT NULL,
  close_month TEXT,
  contract_value NUMERIC DEFAULT 0,
  jan_plan NUMERIC DEFAULT 0,
  feb_plan NUMERIC DEFAULT 0,
  mar_plan NUMERIC DEFAULT 0,
  apr_plan NUMERIC DEFAULT 0,
  may_plan NUMERIC DEFAULT 0,
  jun_plan NUMERIC DEFAULT 0,
  jul_plan NUMERIC DEFAULT 0,
  aug_plan NUMERIC DEFAULT 0,
  sep_plan NUMERIC DEFAULT 0,
  oct_plan NUMERIC DEFAULT 0,
  nov_plan NUMERIC DEFAULT 0,
  dec_plan NUMERIC DEFAULT 0,
  po_release TEXT,
  po_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pipeline_entries
ALTER TABLE public.pipeline_entries ENABLE ROW LEVEL SECURITY;

-- Pipeline entries policies - all authenticated users can view
CREATE POLICY "Authenticated users can view all pipeline entries" ON public.pipeline_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pipeline entries" ON public.pipeline_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.pipeline_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.pipeline_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for pipeline_entries
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_entries;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_entries_updated_at
  BEFORE UPDATE ON public.pipeline_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();