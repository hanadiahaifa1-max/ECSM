-- Drop existing constraint and recreate with CASCADE DELETE
ALTER TABLE public.activity_plans 
DROP CONSTRAINT IF EXISTS activity_plans_pipeline_entry_id_fkey;

-- When pipeline is deleted, delete linked activity plans too
ALTER TABLE public.activity_plans 
ADD CONSTRAINT activity_plans_pipeline_entry_id_fkey 
FOREIGN KEY (pipeline_entry_id) 
REFERENCES public.pipeline_entries(id) 
ON DELETE CASCADE;

-- Update sync function to also handle deletes from activity plan side
-- When activity plan is deleted and it created the pipeline, delete pipeline too
CREATE OR REPLACE FUNCTION public.sync_activity_delete_to_pipeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If activity plan had a linked pipeline, delete that pipeline too
  IF OLD.pipeline_entry_id IS NOT NULL THEN
    DELETE FROM public.pipeline_entries WHERE id = OLD.pipeline_entry_id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger for activity plan deletion
DROP TRIGGER IF EXISTS sync_activity_delete_trigger ON public.activity_plans;
CREATE TRIGGER sync_activity_delete_trigger
BEFORE DELETE ON public.activity_plans
FOR EACH ROW
WHEN (OLD.pipeline_entry_id IS NOT NULL)
EXECUTE FUNCTION public.sync_activity_delete_to_pipeline();