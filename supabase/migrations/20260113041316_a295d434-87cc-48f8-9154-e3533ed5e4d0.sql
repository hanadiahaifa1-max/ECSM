-- Add foreign key constraint with CASCADE for deletion
-- First, drop existing constraint if any
ALTER TABLE public.activity_plans 
DROP CONSTRAINT IF EXISTS activity_plans_pipeline_entry_id_fkey;

-- Add foreign key with ON DELETE SET NULL (when pipeline deleted, activity plan keeps existing but loses the link)
ALTER TABLE public.activity_plans 
ADD CONSTRAINT activity_plans_pipeline_entry_id_fkey 
FOREIGN KEY (pipeline_entry_id) 
REFERENCES public.pipeline_entries(id) 
ON DELETE SET NULL;

-- Create function to sync activity plan changes to pipeline
CREATE OR REPLACE FUNCTION public.sync_activity_to_pipeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only sync if activity plan is linked to a pipeline
  IF NEW.pipeline_entry_id IS NOT NULL THEN
    UPDATE public.pipeline_entries
    SET 
      account_name = NEW.account_name,
      opportunity_name = NEW.opportunity_name,
      am_name = NEW.am_name,
      contract_value = NEW.contract_value,
      close_month = NEW.est_close_month,
      updated_at = now()
    WHERE id = NEW.pipeline_entry_id
    AND user_id = NEW.user_id;  -- Only update if same user owns both
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to sync pipeline changes to activity plans
CREATE OR REPLACE FUNCTION public.sync_pipeline_to_activities()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all linked activity plans
  UPDATE public.activity_plans
  SET 
    account_name = NEW.account_name,
    opportunity_name = NEW.opportunity_name,
    am_name = NEW.am_name,
    contract_value = NEW.contract_value,
    est_close_month = NEW.close_month,
    updated_at = now()
  WHERE pipeline_entry_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for activity plan updates to sync to pipeline
DROP TRIGGER IF EXISTS sync_activity_to_pipeline_trigger ON public.activity_plans;
CREATE TRIGGER sync_activity_to_pipeline_trigger
AFTER UPDATE ON public.activity_plans
FOR EACH ROW
WHEN (OLD.pipeline_entry_id IS NOT NULL OR NEW.pipeline_entry_id IS NOT NULL)
EXECUTE FUNCTION public.sync_activity_to_pipeline();

-- Create trigger for pipeline updates to sync to activity plans
DROP TRIGGER IF EXISTS sync_pipeline_to_activities_trigger ON public.pipeline_entries;
CREATE TRIGGER sync_pipeline_to_activities_trigger
AFTER UPDATE ON public.pipeline_entries
FOR EACH ROW
EXECUTE FUNCTION public.sync_pipeline_to_activities();