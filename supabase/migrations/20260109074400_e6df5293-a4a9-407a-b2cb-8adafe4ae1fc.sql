-- Create activity_plans table
CREATE TABLE public.activity_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  se_name TEXT NOT NULL,
  account_name TEXT,
  opportunity_name TEXT,
  activity_date DATE NOT NULL,
  am_name TEXT,
  agenda TEXT,
  solution_offer TEXT,
  contract_value NUMERIC DEFAULT 0,
  rev_plan_fy26 NUMERIC DEFAULT 0,
  est_close_month TEXT,
  output TEXT,
  next_action TEXT,
  pipeline_entry_id UUID REFERENCES public.pipeline_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "All authenticated users can view activity plans"
ON public.activity_plans FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own activity plans"
ON public.activity_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity plans"
ON public.activity_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity plans or admins can delete all"
ON public.activity_plans FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_activity_plans_updated_at
BEFORE UPDATE ON public.activity_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();