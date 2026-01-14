-- Recreate sync functions and triggers properly

-- Function: Sync activity plan changes to linked pipeline
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
      account_name = COALESCE(NEW.account_name, account_name),
      opportunity_name = COALESCE(NEW.opportunity_name, opportunity_name),
      am_name = COALESCE(NEW.am_name, am_name),
      contract_value = COALESCE(NEW.contract_value, contract_value),
      close_month = COALESCE(NEW.est_close_month, close_month),
      updated_at = now()
    WHERE id = NEW.pipeline_entry_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Sync pipeline changes to linked activity plans
CREATE OR REPLACE FUNCTION public.sync_pipeline_to_activities()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all linked activity plans with new pipeline data
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

-- Function: Delete pipeline when linked activity plan is deleted
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

-- Drop existing triggers first
DROP TRIGGER IF EXISTS sync_activity_to_pipeline_trigger ON public.activity_plans;
DROP TRIGGER IF EXISTS sync_activity_delete_trigger ON public.activity_plans;
DROP TRIGGER IF EXISTS sync_pipeline_to_activities_trigger ON public.pipeline_entries;

-- Create trigger: When activity plan is updated, sync to pipeline
CREATE TRIGGER sync_activity_to_pipeline_trigger
AFTER UPDATE ON public.activity_plans
FOR EACH ROW
EXECUTE FUNCTION public.sync_activity_to_pipeline();

-- Create trigger: When activity plan is deleted, delete linked pipeline
CREATE TRIGGER sync_activity_delete_trigger
BEFORE DELETE ON public.activity_plans
FOR EACH ROW
EXECUTE FUNCTION public.sync_activity_delete_to_pipeline();

-- Create trigger: When pipeline is updated, sync to activity plans
CREATE TRIGGER sync_pipeline_to_activities_trigger
AFTER UPDATE ON public.pipeline_entries
FOR EACH ROW
EXECUTE FUNCTION public.sync_pipeline_to_activities();