-- Create highlights table
CREATE TABLE public.highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  related_account TEXT,
  related_opportunity TEXT,
  highlight_date DATE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all highlights
CREATE POLICY "Authenticated users can view all highlights"
ON public.highlights
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert their own highlights
CREATE POLICY "Authenticated users can insert highlights"
ON public.highlights
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own highlights OR admins can update any
CREATE POLICY "Users can update own highlights or admins can update all"
ON public.highlights
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Only admins can delete highlights
CREATE POLICY "Only admins can delete highlights"
ON public.highlights
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_highlights_updated_at
BEFORE UPDATE ON public.highlights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();