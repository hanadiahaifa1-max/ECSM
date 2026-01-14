-- Update sync_activity_to_pipeline to handle contract_value properly (not use COALESCE which keeps old value if new is NULL/0)
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
    WHERE id = NEW.pipeline_entry_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also add INSERT trigger so when new activity plan is created with existing pipeline, it syncs
DROP TRIGGER IF EXISTS sync_activity_insert_to_pipeline_trigger ON public.activity_plans;

CREATE TRIGGER sync_activity_insert_to_pipeline_trigger
AFTER INSERT ON public.activity_plans
FOR EACH ROW
WHEN (NEW.pipeline_entry_id IS NOT NULL)
EXECUTE FUNCTION public.sync_activity_to_pipeline();