-- Create a secure function to get LoB distribution for charts
-- This aggregates data without exposing individual user profiles
CREATE OR REPLACE FUNCTION public.get_lob_distribution()
RETURNS TABLE (
  lob_name text,
  total_value numeric,
  entry_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.lob, 'Unknown') as lob_name,
    COALESCE(SUM(pe.contract_value), 0) as total_value,
    COUNT(pe.id) as entry_count
  FROM pipeline_entries pe
  LEFT JOIN profiles p ON pe.user_id = p.user_id
  WHERE p.lob IS NOT NULL AND p.lob != ''
  GROUP BY p.lob
  HAVING SUM(pe.contract_value) > 0
  ORDER BY total_value DESC;
$$;

-- Drop the permissive SELECT policy that exposes all profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create a restrictive policy - users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);