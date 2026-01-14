-- Fix 1: Restrict highlights visibility to owner + admins
DROP POLICY IF EXISTS "Authenticated users can view all highlights" ON public.highlights;

CREATE POLICY "Users view own highlights or admins view all"
ON public.highlights FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Fix 2: Make activity-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'activity-attachments';

-- Update storage policy to require authentication
DROP POLICY IF EXISTS "Anyone can view activity attachments" ON storage.objects;

CREATE POLICY "Authenticated users can view activity attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'activity-attachments');

-- Fix 3: Update sync_activity_to_pipeline with ownership validation
CREATE OR REPLACE FUNCTION public.sync_activity_to_pipeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.pipeline_entry_id IS NOT NULL THEN
    -- Verify user owns both the activity plan and the target pipeline
    IF NOT EXISTS (
      SELECT 1 FROM pipeline_entries 
      WHERE id = NEW.pipeline_entry_id 
      AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Cannot sync to pipeline owned by different user';
    END IF;
    
    UPDATE public.pipeline_entries
    SET 
      account_name = NEW.account_name,
      opportunity_name = NEW.opportunity_name,
      am_name = NEW.am_name,
      contract_value = NEW.contract_value,
      close_month = NEW.est_close_month,
      updated_at = now()
    WHERE id = NEW.pipeline_entry_id
    AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 4: Update sync_pipeline_to_activities with ownership validation
CREATE OR REPLACE FUNCTION public.sync_pipeline_to_activities()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update activity plans that belong to the same user who owns the pipeline
  UPDATE public.activity_plans
  SET 
    account_name = NEW.account_name,
    opportunity_name = NEW.opportunity_name,
    am_name = NEW.am_name,
    contract_value = NEW.contract_value,
    est_close_month = NEW.close_month,
    updated_at = now()
  WHERE pipeline_entry_id = NEW.id
  AND user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Fix 5: Update sync_activity_delete_to_pipeline with ownership validation
CREATE OR REPLACE FUNCTION public.sync_activity_delete_to_pipeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If activity plan had a linked pipeline, delete that pipeline only if same owner
  IF OLD.pipeline_entry_id IS NOT NULL THEN
    DELETE FROM public.pipeline_entries 
    WHERE id = OLD.pipeline_entry_id
    AND user_id = OLD.user_id;
  END IF;
  
  RETURN OLD;
END;
$$;