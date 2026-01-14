-- Add new columns to highlights table based on Excel structure
ALTER TABLE public.highlights 
ADD COLUMN IF NOT EXISTS se_name TEXT,
ADD COLUMN IF NOT EXISTS presales_lob TEXT,
ADD COLUMN IF NOT EXISTS support_needed TEXT,
ADD COLUMN IF NOT EXISTS dept_in_charge TEXT,
ADD COLUMN IF NOT EXISTS potential_rev NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_entry_id UUID REFERENCES public.pipeline_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS stage TEXT;