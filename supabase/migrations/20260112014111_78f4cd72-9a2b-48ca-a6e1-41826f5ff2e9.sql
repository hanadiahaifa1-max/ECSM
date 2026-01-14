-- Drop the permissive SELECT policy that exposes all activity plans
DROP POLICY IF EXISTS "All authenticated users can view activity plans" ON public.activity_plans;

-- Create a restrictive policy - users can only view their own activity plans
-- Admins can also view all activity plans for management purposes
CREATE POLICY "Users can view their own activity plans or admins can view all" 
ON public.activity_plans 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));