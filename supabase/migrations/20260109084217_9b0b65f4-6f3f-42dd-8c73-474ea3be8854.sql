-- Add attachment_url column to activity_plans table
ALTER TABLE public.activity_plans ADD COLUMN attachment_url text DEFAULT NULL;