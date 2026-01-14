-- Add si_name column to pipeline_entries table
ALTER TABLE public.pipeline_entries 
ADD COLUMN si_name text;